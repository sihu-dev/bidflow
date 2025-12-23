/**
 * @module connectors/base-connector
 * @description Base connector interface for global tender platforms
 */

export type SourceId = 'ted' | 'sam_gov' | 'g2b' | 'ungm' | 'gebiz';

export interface NormalizedBid {
  // Source identification
  sourceId: SourceId;
  sourceNoticeId: string;
  sourceUrl: string;

  // Basic information
  title: string;
  description: string;
  organization: string;
  organizationId?: string;
  country: string;
  region?: string;

  // Financial
  estimatedPrice?: number;
  currency: string;
  budgetRange?: {
    min: number;
    max: number;
  };

  // Timeline
  publishedDate: Date;
  deadline: Date;
  startDate?: Date;

  // Classification
  categories: string[];
  cpvCodes?: string[]; // EU CPV codes
  naicsCodes?: string[]; // US NAICS codes
  keywords: string[];

  // Requirements
  documents?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  eligibility?: {
    countries: string[];
    companySize?: string[];
    certifications?: string[];
  };

  // Metadata
  language: string;
  contentHash: string;
  rawData: Record<string, unknown>;

  // Timestamps
  fetchedAt: Date;
}

export interface ConnectorConfig {
  apiKey?: string;
  baseUrl: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface FetchOptions {
  keywords?: string[];
  countries?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  categories?: string[];
}

export interface FetchResult {
  bids: NormalizedBid[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected sourceId: SourceId;
  private lastRequestTime: number = 0;
  private requestCount: { minute: number; hour: number } = { minute: 0, hour: 0 };

  constructor(sourceId: SourceId, config: ConnectorConfig) {
    this.sourceId = sourceId;
    this.config = config;
  }

  /**
   * Fetch tenders from the source
   */
  abstract fetchTenders(options: FetchOptions): Promise<FetchResult>;

  /**
   * Fetch a single tender by ID
   */
  abstract fetchTenderById(id: string): Promise<NormalizedBid | null>;

  /**
   * Normalize raw data to standard format
   */
  protected abstract normalizeBid(rawData: unknown): NormalizedBid;

  /**
   * Rate limiting check
   */
  protected async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Calculate minimum delay between requests
    const minDelay = (60 * 1000) / this.config.rateLimit.requestsPerMinute;

    if (timeSinceLastRequest < minDelay) {
      const delay = minDelay - timeSinceLastRequest;
      await this.sleep(delay);
    }

    this.lastRequestTime = Date.now();
    this.requestCount.minute++;
    this.requestCount.hour++;

    // Reset counters
    setTimeout(() => this.requestCount.minute--, 60 * 1000);
    setTimeout(() => this.requestCount.hour--, 60 * 60 * 1000);
  }

  /**
   * Make HTTP request with retry logic
   */
  protected async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await this.checkRateLimit();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.retryAttempts) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          console.warn(
            `[${this.sourceId}] Request failed (attempt ${attempt + 1}/${this.config.retryAttempts + 1}), retrying in ${delay}ms...`
          );
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `[${this.sourceId}] Request failed after ${this.config.retryAttempts + 1} attempts: ${lastError?.message}`
    );
  }

  /**
   * Generate content hash for deduplication
   */
  protected generateContentHash(data: {
    title: string;
    organization: string;
    deadline: Date;
  }): string {
    const str = `${data.title}|${data.organization}|${data.deadline.toISOString()}`;
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log connector activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${this.sourceId}] [${level.toUpperCase()}] ${timestamp}`;

    if (level === 'error') {
      console.error(prefix, message, data);
    } else if (level === 'warn') {
      console.warn(prefix, message, data);
    } else {
      console.log(prefix, message, data);
    }
  }
}
