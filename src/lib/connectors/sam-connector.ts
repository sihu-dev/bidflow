/**
 * @module connectors/sam-connector
 * @description SAM.gov API Connector - US Federal Government Procurement
 *
 * API Documentation: https://open.gsa.gov/api/opportunities-api/
 * Rate Limit: 10 requests/second, 1000 requests/hour
 * Coverage: ~20,000 federal contract opportunities/month
 */

import {
  BaseConnector,
  type NormalizedBid,
  type FetchOptions,
  type FetchResult,
  type ConnectorConfig,
} from './base-connector';

// SAM.gov API Response Types
interface SAMOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  fullParentPathName: string;
  fullParentPathCode: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  typeOfSetAsideDescription: string;
  typeOfSetAside: string;
  responseDeadLine: string;
  naicsCode: string;
  naicsCodes?: string[];
  classificationCode: string;
  active: string;
  award?: {
    date: string;
    number: string;
    amount: string;
    awardee: {
      name: string;
      location: {
        streetAddress: string;
        city: {
          code: string;
          name: string;
        };
        state: {
          code: string;
          name: string;
        };
        zip: string;
        country: {
          code: string;
          name: string;
        };
      };
    };
  };
  pointOfContact?: Array<{
    type: string;
    title: string;
    fullName: string;
    email: string;
    phone: string;
    fax: string;
  }>;
  description: string;
  organizationType: string;
  officeAddress: {
    zipcode: string;
    city: string;
    countryCode: string;
    state: string;
  };
  placeOfPerformance?: {
    streetAddress: string;
    city: {
      code: string;
      name: string;
    };
    state: {
      code: string;
      name: string;
    };
    country: {
      code: string;
      name: string;
    };
  };
  additionalInfoLink?: string;
  uiLink: string;
  links?: Array<{
    rel: string;
    href: string;
  }>;
  resourceLinks?: string[];
}

interface SAMSearchResponse {
  opportunitiesData: SAMOpportunity[];
  totalRecords: number;
  offset: number;
  limit: number;
}

export class SAMConnector extends BaseConnector {
  private static readonly DEFAULT_CONFIG: ConnectorConfig = {
    baseUrl: 'https://api.sam.gov/opportunities/v2',
    apiKey: process.env.SAM_GOV_API_KEY,
    rateLimit: {
      requestsPerMinute: 600, // 10 req/sec = 600/min
      requestsPerHour: 1000,
    },
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  constructor(config?: Partial<ConnectorConfig>) {
    super('sam_gov', { ...SAMConnector.DEFAULT_CONFIG, ...config });
  }

  /**
   * Fetch opportunities from SAM.gov API
   */
  async fetchTenders(options: FetchOptions): Promise<FetchResult> {
    const {
      keywords = [],
      countries = [], // SAM.gov is US-only, but can filter by place of performance
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
      categories = [], // NAICS codes
    } = options;

    try {
      // Build query parameters
      const params = new URLSearchParams();

      // API key (required)
      if (!this.config.apiKey) {
        throw new Error('SAM.gov API key is required');
      }
      params.append('api_key', this.config.apiKey);

      // Keywords search
      if (keywords.length > 0) {
        params.append('q', keywords.join(' '));
      }

      // Date range (posted date)
      if (dateFrom) {
        params.append('postedFrom', this.formatSAMDate(dateFrom));
      }
      if (dateTo) {
        params.append('postedTo', this.formatSAMDate(dateTo));
      }

      // NAICS codes (North American Industry Classification System)
      if (categories.length > 0) {
        params.append('ncode', categories.join(','));
      }

      // Place of performance (country filter)
      if (countries.length > 0 && !countries.includes('US')) {
        // SAM.gov primarily US opportunities, but can have international place of performance
        params.append('pstate', countries.join(','));
      }

      // Only active opportunities
      params.append('active', 'true');

      // Pagination
      params.append('limit', Math.min(limit, 100).toString()); // Max 100 per request
      params.append('offset', offset.toString());

      // Sort by posted date (newest first)
      params.append('sortBy', '-modifiedDate');

      // Response format
      params.append('format', 'json');

      // API endpoint
      const url = `${this.config.baseUrl}/search?${params.toString()}`;

      this.log('info', 'Fetching opportunities', { keywords, limit, offset });

      // Make request
      const response = await this.fetchWithRetry<SAMSearchResponse>(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Normalize opportunities
      const bids = response.opportunitiesData.map((opp) => this.normalizeBid(opp));

      this.log('info', 'Fetched opportunities successfully', {
        count: bids.length,
        total: response.totalRecords,
      });

      return {
        bids,
        totalCount: response.totalRecords,
        hasMore: offset + bids.length < response.totalRecords,
        nextOffset: offset + bids.length,
      };
    } catch (error) {
      this.log('error', 'Failed to fetch opportunities', error);
      throw error;
    }
  }

  /**
   * Fetch a single opportunity by notice ID
   */
  async fetchTenderById(noticeId: string): Promise<NormalizedBid | null> {
    try {
      if (!this.config.apiKey) {
        throw new Error('SAM.gov API key is required');
      }

      const params = new URLSearchParams({
        api_key: this.config.apiKey,
        format: 'json',
      });

      const url = `${this.config.baseUrl}/${noticeId}?${params.toString()}`;

      this.log('info', 'Fetching opportunity by ID', { noticeId });

      const opportunity = await this.fetchWithRetry<SAMOpportunity>(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      return this.normalizeBid(opportunity);
    } catch (error) {
      this.log('error', 'Failed to fetch opportunity by ID', { noticeId, error });
      return null;
    }
  }

  /**
   * Normalize SAM.gov opportunity to standard format
   */
  protected normalizeBid(rawData: unknown): NormalizedBid {
    const opp = rawData as SAMOpportunity;

    // Extract basic information
    const noticeId = opp.noticeId;
    const title = opp.title;
    const description = opp.description || '';

    // Organization (derived from office address or opportunity type)
    const organization = this.extractOrganization(opp);

    // Country (US by default, but check place of performance)
    const country = opp.placeOfPerformance?.country?.code || 'US';

    // Estimated price (from award if available)
    const estimatedPrice = opp.award?.amount ? parseFloat(opp.award.amount) : undefined;
    const currency = 'USD';

    // NAICS codes
    const naicsCodes = opp.naicsCodes || (opp.naicsCode ? [opp.naicsCode] : []);

    // Keywords extraction
    const keywords = this.extractKeywords(title + ' ' + description);

    // Categories (NAICS to readable categories)
    const categories = naicsCodes.map((code) => this.naicsToCategory(code));

    // Dates
    const publishedDate = new Date(opp.postedDate);
    const deadline = new Date(opp.responseDeadLine || publishedDate);

    // Source URL
    const sourceUrl = opp.uiLink || `https://sam.gov/opp/${noticeId}/view`;

    // Documents
    const documents = opp.resourceLinks?.map((link, idx) => ({
      name: `Document ${idx + 1}`,
      url: link,
      type: 'pdf',
    }));

    // Generate content hash
    const contentHash = this.generateContentHash({
      title,
      organization,
      deadline,
    });

    return {
      sourceId: 'sam_gov',
      sourceNoticeId: noticeId,
      sourceUrl,
      title,
      description,
      organization,
      organizationId: opp.solicitationNumber,
      country,
      region: opp.officeAddress?.state || undefined,
      estimatedPrice,
      currency,
      publishedDate,
      deadline,
      categories: Array.from(new Set(categories)),
      naicsCodes,
      keywords,
      documents,
      language: 'en',
      contentHash,
      rawData: opp as unknown as Record<string, unknown>,
      fetchedAt: new Date(),
    };
  }

  /**
   * Extract organization name from opportunity
   */
  private extractOrganization(opp: SAMOpportunity): string {
    // Try to extract from full parent path
    if (opp.fullParentPathName) {
      const parts = opp.fullParentPathName.split('.');
      return parts[parts.length - 1] || 'US Government';
    }

    // Fallback to organization type
    if (opp.organizationType) {
      return opp.organizationType;
    }

    return 'US Federal Government';
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Remove special characters and convert to lowercase
    const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ');

    // Split into words
    const words = cleaned.split(/\s+/);

    // Common stopwords
    const stopwords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'government',
      'federal',
      'services',
    ]);

    // Filter out stopwords and short words
    const keywords = words.filter((word) => word.length > 3 && !stopwords.has(word));

    // Return unique keywords (max 20)
    return Array.from(new Set(keywords)).slice(0, 20);
  }

  /**
   * Convert NAICS code to category
   */
  private naicsToCategory(naicsCode: string): string {
    // NAICS codes are 2-6 digits, sector is first 2 digits
    const sector = naicsCode.substring(0, 2);

    const naicsSectors: Record<string, string> = {
      '11': 'Agriculture',
      '21': 'Mining & Extraction',
      '22': 'Utilities',
      '23': 'Construction',
      '31': 'Manufacturing',
      '32': 'Manufacturing',
      '33': 'Manufacturing',
      '42': 'Wholesale Trade',
      '44': 'Retail Trade',
      '45': 'Retail Trade',
      '48': 'Transportation',
      '49': 'Warehousing',
      '51': 'Information',
      '52': 'Finance & Insurance',
      '53': 'Real Estate',
      '54': 'Professional Services',
      '55': 'Management',
      '56': 'Administrative Services',
      '61': 'Educational Services',
      '62': 'Healthcare',
      '71': 'Arts & Entertainment',
      '72': 'Accommodation & Food',
      '81': 'Other Services',
      '92': 'Public Administration',
    };

    return naicsSectors[sector] || 'Other';
  }

  /**
   * Format date for SAM.gov API (MM/DD/YYYY)
   */
  private formatSAMDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}
