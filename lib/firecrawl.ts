import FirecrawlApp from '@mendable/firecrawl-js';

// Ensure API key is set
const apiKey = process.env.FIRECRAWL_API_KEY;

if (!apiKey) {
  console.error('FIRECRAWL_API_KEY environment variable is not set');
} else if (!apiKey.startsWith('fc-')) {
  console.error('FIRECRAWL_API_KEY seems to be invalid - should start with "fc-"');
}

// Initialize Firecrawl client
export const firecrawl = new FirecrawlApp({
  apiKey: apiKey || ''
});

// Response types based on FirecrawlApp's return values
export interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    rawHtml?: string;
    screenshot?: string;
    links?: string[];
    json?: any;
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      sourceURL?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  error?: string;
}

// Scrape options with reasonable defaults
export type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'screenshot' | 'links' | 'content' | 'screenshot@fullPage' | 'extract' | 'json')[];
  onlyMainContent?: boolean;
  timeout?: number;
  waitFor?: number;
  retries?: number;
  retryDelay?: number;
  jsonOptions?: {
    schema?: any;
    prompt?: string;
  };
};

// Default options
export const DEFAULT_SCRAPE_OPTIONS: ScrapeOptions = {
  formats: ['markdown'],
  onlyMainContent: true,
  timeout: 30000,
  waitFor: 1000,
  retries: 2,
  retryDelay: 1000
};

// Utility function to handle retries for scraping
export async function scrapeWithRetry(
  url: string, 
  options: ScrapeOptions = DEFAULT_SCRAPE_OPTIONS
): Promise<FirecrawlResponse> {
  // Validate API key first
  if (!apiKey) {
    console.error('Cannot make Firecrawl request: FIRECRAWL_API_KEY not set');
    return {
      success: false,
      error: 'API key not configured. Please set FIRECRAWL_API_KEY environment variable.'
    };
  }

  let lastError: Error | null = null;
  const retries = options.retries || DEFAULT_SCRAPE_OPTIONS.retries || 2;
  const delay = options.retryDelay || DEFAULT_SCRAPE_OPTIONS.retryDelay || 1000;
  
  // Remove retry-specific options before passing to Firecrawl
  const { retries: _, retryDelay: __, ...firecrawlOptions } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[Firecrawl] Attempt ${attempt + 1}/${retries + 1} to scrape ${url}`);
      const result = await firecrawl.scrapeUrl(url, firecrawlOptions);
      console.log(`[Firecrawl] Scrape successful: ${url}`);
      return result as FirecrawlResponse;
    } catch (error: any) {
      lastError = error as Error;
      console.error(`[Firecrawl] Scrape attempt ${attempt + 1}/${retries + 1} failed:`, {
        url,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack
      });
      
      if (attempt < retries) {
        console.log(`[Firecrawl] Waiting ${delay * Math.pow(2, attempt)}ms before retry...`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  // All retries failed
  const errorMsg = lastError?.message || 'Scraping failed after multiple attempts';
  console.error(`[Firecrawl] All scrape attempts failed for ${url}: ${errorMsg}`);
  
  return {
    success: false,
    error: errorMsg
  };
} 