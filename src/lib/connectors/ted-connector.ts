/**
 * @module connectors/ted-connector
 * @description TED (Tenders Electronic Daily) API Connector - EU Public Procurement
 *
 * API Documentation: https://api.ted.europa.eu/
 * Rate Limit: 60 requests/minute
 * Coverage: ~800,000 public procurement notices/year across EU
 */

import {
  BaseConnector,
  type NormalizedBid,
  type FetchOptions,
  type FetchResult,
  type ConnectorConfig,
} from './base-connector';

// TED API Response Types
interface TEDNotice {
  ND_ROOT: {
    NOTICE_DATA: {
      NO_DOC_OJS: string;
      ORIGINAL: {
        LANGUAGE: string;
      };
      REF_OJS: {
        COLL_OJS: string;
        NO_OJS: string;
      };
      CODED_DATA_SECTION: {
        REF_NOTICE?: {
          NO_DOC_OJS: string;
        };
        NOTICE_DATA: {
          NO_DOC_OJS: string;
          URI_DOC: string;
        };
        CODIF_DATA: {
          TD_DOCUMENT_TYPE: string;
          NC_CONTRACT_NATURE: string;
          PR_PROC: string;
          RP_REGULATION: string;
          TY_TYPE_BID: string;
          AC_AWARD_CRIT: string;
          ORIG_NUTS: string;
          CPV_ADDITIONAL?: {
            CPV_CODE: string;
          }[];
          CPV_MAIN: {
            CPV_CODE: string;
          };
        };
      };
    };
    FORM_SECTION: {
      F02_2014?: {
        CONTRACTING_BODY: {
          ADDRESS_CONTRACTING_BODY: {
            OFFICIALNAME: string;
            ADDRESS: string;
            TOWN: string;
            POSTAL_CODE: string;
            COUNTRY: {
              VALUE: string;
            };
            CONTACT_POINT?: string;
            PHONE?: string;
            EMAIL?: string;
            URL_GENERAL?: string;
          };
        };
        OBJECT_CONTRACT: {
          TITLE: {
            P: string;
          };
          SHORT_DESCR: {
            P: string;
          };
          CPV_ADDITIONAL?: {
            CPV_CODE: {
              CODE: string;
            };
          }[];
          VAL_ESTIMATED_TOTAL?: {
            VALUE: string;
            CURRENCY: string;
          };
          VAL_TOTAL?: {
            VALUE: string;
            CURRENCY: string;
          };
        };
        PROCEDURE: {
          PT_OPEN?: {};
          PT_RESTRICTED?: {};
          PT_COMPETITIVE_NEGOTIATION?: {};
          PT_COMPETITIVE_DIALOGUE?: {};
          MAIN_FEATURES_AWARD?: {
            P: string;
          };
        };
        LEFTI: {
          SUITABILITY?: {
            P: string;
          };
          ECONOMIC_FINANCIAL_INFO?: {
            P: string;
          };
          TECHNICAL_PROFESSIONAL_INFO?: {
            P: string;
          };
        };
        COMPLEMENTARY_INFO: {
          DATE_DISPATCH_NOTICE?: string;
        };
      };
      F03_2014?: {
        AWARD_CONTRACT: {
          CONTRACT_NO?: string;
          TITLE?: {
            P: string;
          };
          CONTRACT_AWARD_DATE?: string;
          AWARDED_CONTRACT: {
            DATE_CONCLUSION_CONTRACT?: string;
            CONTRACTORS: {
              CONTRACTOR: {
                ADDRESS_CONTRACTOR: {
                  OFFICIALNAME: string;
                  TOWN: string;
                  COUNTRY: {
                    VALUE: string;
                  };
                };
              };
            };
            VAL_TOTAL?: {
              VALUE: string;
              CURRENCY: string;
            };
          };
        }[];
      };
    };
    TRANSLATION_SECTION?: {
      ML_TITLES?: {
        ML_TI_DOC: Array<{
          LG: string;
          TI_CY: string;
          TI_TOWN: string;
          TI_TEXT: {
            P: string;
          };
        }>;
      };
    };
  };
}

interface TEDSearchResponse {
  notices: TEDNotice[];
  total: number;
  offset: number;
  limit: number;
}

export class TEDConnector extends BaseConnector {
  private static readonly DEFAULT_CONFIG: ConnectorConfig = {
    baseUrl: 'https://api.ted.europa.eu/v3',
    apiKey: process.env.TED_API_KEY,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  constructor(config?: Partial<ConnectorConfig>) {
    super('ted', { ...TEDConnector.DEFAULT_CONFIG, ...config });
  }

  /**
   * Fetch tenders from TED API
   */
  async fetchTenders(options: FetchOptions): Promise<FetchResult> {
    const {
      keywords = [],
      countries = [],
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
      categories = [],
    } = options;

    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Keywords search
      if (keywords.length > 0) {
        params.append('q', keywords.join(' OR '));
      }

      // Country filter (ISO 3166-1 alpha-2 codes)
      if (countries.length > 0) {
        params.append('country', countries.join(','));
      }

      // Date range
      if (dateFrom) {
        params.append('publicationDate.from', dateFrom.toISOString().split('T')[0]);
      }
      if (dateTo) {
        params.append('publicationDate.to', dateTo.toISOString().split('T')[0]);
      }

      // CPV codes (Common Procurement Vocabulary)
      if (categories.length > 0) {
        params.append('cpv', categories.join(','));
      }

      // Pagination
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      // Sort by publication date (newest first)
      params.append('sort', '-publicationDate');

      // API endpoint
      const url = `${this.config.baseUrl}/notices/search?${params.toString()}`;

      this.log('info', 'Fetching tenders', { url, keywords, countries, limit, offset });

      // Make request
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['X-API-Key'] = this.config.apiKey;
      }

      const response = await this.fetchWithRetry<TEDSearchResponse>(url, {
        method: 'GET',
        headers,
      });

      // Normalize bids
      const bids = response.notices.map((notice) => this.normalizeBid(notice));

      this.log('info', 'Fetched tenders successfully', {
        count: bids.length,
        total: response.total,
      });

      return {
        bids,
        totalCount: response.total,
        hasMore: offset + bids.length < response.total,
        nextOffset: offset + bids.length,
      };
    } catch (error) {
      this.log('error', 'Failed to fetch tenders', error);
      throw error;
    }
  }

  /**
   * Fetch a single tender by TED notice ID
   */
  async fetchTenderById(noticeId: string): Promise<NormalizedBid | null> {
    try {
      const url = `${this.config.baseUrl}/notices/${noticeId}`;

      this.log('info', 'Fetching tender by ID', { noticeId });

      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      if (this.config.apiKey) {
        headers['X-API-Key'] = this.config.apiKey;
      }

      const notice = await this.fetchWithRetry<TEDNotice>(url, {
        method: 'GET',
        headers,
      });

      return this.normalizeBid(notice);
    } catch (error) {
      this.log('error', 'Failed to fetch tender by ID', { noticeId, error });
      return null;
    }
  }

  /**
   * Normalize TED notice to standard format
   */
  protected normalizeBid(rawData: unknown): NormalizedBid {
    const notice = rawData as TEDNotice;
    const noticeData = notice.ND_ROOT.NOTICE_DATA;
    const formSection = notice.ND_ROOT.FORM_SECTION;

    // Extract F02 (Contract Notice) or F03 (Contract Award) data
    const f02 = formSection.F02_2014;
    const f03 = formSection.F03_2014;

    // Get contracting body
    const contractingBody = f02?.CONTRACTING_BODY?.ADDRESS_CONTRACTING_BODY;

    // Get contract object
    const objectContract = f02?.OBJECT_CONTRACT;

    // Extract basic information
    const noticeId = noticeData.NO_DOC_OJS;
    const language = noticeData.ORIGINAL.LANGUAGE;

    // Title (try to get English version from translations)
    const translations = notice.ND_ROOT.TRANSLATION_SECTION?.ML_TITLES?.ML_TI_DOC;
    const englishTranslation = translations?.find((t) => t.LG === 'EN');
    const title =
      englishTranslation?.TI_TEXT?.P ||
      objectContract?.TITLE?.P ||
      f03?.AWARD_CONTRACT?.[0]?.TITLE?.P ||
      'Untitled';

    // Description
    const description = objectContract?.SHORT_DESCR?.P || '';

    // Organization
    const organization = contractingBody?.OFFICIALNAME || 'Unknown';

    // Country
    const country = contractingBody?.COUNTRY?.VALUE || 'EU';

    // Estimated price
    const valEstimated = objectContract?.VAL_ESTIMATED_TOTAL;
    const valTotal = objectContract?.VAL_TOTAL;
    const estimatedPrice = valEstimated?.VALUE
      ? parseFloat(valEstimated.VALUE)
      : valTotal?.VALUE
        ? parseFloat(valTotal.VALUE)
        : undefined;
    const currency = valEstimated?.CURRENCY || valTotal?.CURRENCY || 'EUR';

    // CPV codes
    const cpvMain = noticeData.CODED_DATA_SECTION.CODIF_DATA.CPV_MAIN?.CPV_CODE;
    const cpvAdditional =
      noticeData.CODED_DATA_SECTION.CODIF_DATA.CPV_ADDITIONAL?.map((c) => c.CPV_CODE) ||
      [];
    const cpvCodes = [cpvMain, ...cpvAdditional].filter(Boolean) as string[];

    // Keywords extraction from title and description
    const keywords = this.extractKeywords(title + ' ' + description);

    // Categories (CPV divisions)
    const categories = cpvCodes.map((code) => this.cpvToCategory(code));

    // Dates
    const publishedDate = new Date(
      noticeData.CODED_DATA_SECTION.NOTICE_DATA.URI_DOC.split('/')[5] || Date.now()
    );
    const deadline = new Date(publishedDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Default: 30 days

    // Source URL
    const sourceUrl = `https://ted.europa.eu/udl?uri=${noticeData.NO_DOC_OJS}`;

    // Generate content hash
    const contentHash = this.generateContentHash({
      title,
      organization,
      deadline,
    });

    return {
      sourceId: 'ted',
      sourceNoticeId: noticeId,
      sourceUrl,
      title,
      description,
      organization,
      organizationId: contractingBody?.OFFICIALNAME || undefined,
      country,
      region: contractingBody?.TOWN || undefined,
      estimatedPrice,
      currency,
      publishedDate,
      deadline,
      categories: Array.from(new Set(categories)),
      cpvCodes,
      keywords,
      language,
      contentHash,
      rawData: notice as unknown as Record<string, unknown>,
      fetchedAt: new Date(),
    };
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
    ]);

    // Filter out stopwords and short words
    const keywords = words.filter((word) => word.length > 3 && !stopwords.has(word));

    // Return unique keywords (max 20)
    return Array.from(new Set(keywords)).slice(0, 20);
  }

  /**
   * Convert CPV code to category
   */
  private cpvToCategory(cpvCode: string): string {
    // CPV codes are hierarchical: XX000000-Y (division), XXYZ0000-Y (group), etc.
    const division = cpvCode.substring(0, 2);

    const cpvDivisions: Record<string, string> = {
      '30': 'IT Equipment & Software',
      '31': 'Electrical Machinery',
      '32': 'Radio, TV & Communications',
      '33': 'Medical Equipment',
      '34': 'Transport Equipment',
      '35': 'Security Equipment',
      '38': 'Laboratory Equipment',
      '39': 'Furniture',
      '42': 'Industrial Machinery',
      '43': 'Mining Machinery',
      '44': 'Construction Structures',
      '45': 'Construction Work',
      '48': 'Software',
      '50': 'Repair & Maintenance',
      '51': 'Installation Services',
      '60': 'Transport Services',
      '63': 'Supporting Transport Services',
      '64': 'Postal Services',
      '65': 'Utilities',
      '66': 'Financial Services',
      '70': 'Real Estate Services',
      '71': 'Architectural Services',
      '72': 'IT Services',
      '73': 'Research Services',
      '75': 'Administration Services',
      '76': 'Oil & Gas Services',
      '77': 'Agricultural Services',
      '79': 'Business Services',
      '80': 'Education Services',
      '85': 'Health Services',
      '90': 'Waste Services',
      '92': 'Recreation Services',
      '98': 'Other Services',
    };

    return cpvDivisions[division] || 'Other';
  }
}
