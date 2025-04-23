'use server';

import { updatePurchaseStatusAction } from '@/actions/db/purchases-actions';
import { createScrapedDataAction, updateScrapedDataContentAction, updateScrapedDataStatusAction } from '@/actions/db/scraped-data-actions';
import { DEFAULT_SCRAPE_OPTIONS, ScrapeOptions, scrapeWithRetry } from '@/lib/firecrawl';
import { directScrape } from '@/lib/firecrawl-direct';
import { ActionState } from '@/types';

/**
 * Triggers a website scrape using Firecrawl and saves the results to the database.
 * If the regular scrape fails with "No markdown content", it automatically falls back to the direct API approach.
 */
export async function triggerScrapeAction(
  url: string,
  purchaseId: string,
  options: ScrapeOptions = DEFAULT_SCRAPE_OPTIONS
): Promise<ActionState<{ scrapedDataId: string }>> {
  try {
    // Create initial record with pending status
    const createResult = await createScrapedDataAction({
      purchaseId,
      url,
      contentType: 'markdown',
      status: 'pending'
    });

    if (!createResult.isSuccess) {
      return {
        isSuccess: false,
        message: createResult.message || 'Failed to create initial scrape record'
      };
    }

    const scrapedDataId = createResult.data!.id;

    try {
      // Update purchase status to indicate scraping in progress
      await updatePurchaseStatusAction(purchaseId, 'pending_scrape');

      // First try the standard scrape method
      try {
        // Perform the scrape with retries
        const scrapeResult = await scrapeWithRetry(url, options);

        if (!scrapeResult.success) {
          throw new Error(scrapeResult.error || 'Scrape returned unsuccessful result');
        }

        if (!scrapeResult.data?.markdown) {
          throw new Error('No markdown content found in scrape result');
        }

        // Update database with successful results
        await updateScrapedDataContentAction(scrapedDataId, {
          scrapedContent: { 
            markdown: scrapeResult.data.markdown, 
            metadata: scrapeResult.data.metadata || {} 
          },
          contentType: 'markdown',
          status: 'completed'
        });

        // Update purchase status to indicate scraping completed
        await updatePurchaseStatusAction(purchaseId, 'scrape_complete');

        return {
          isSuccess: true,
          message: 'Website scraped successfully',
          data: { scrapedDataId }
        };
      } catch (originalError: any) {
        // If the error is specifically about no markdown content, try the direct approach
        if (originalError.message === 'No markdown content found in scrape result') {
          console.log(`[Firecrawl] No markdown found with regular scrape, falling back to direct method for ${url}`);
          
          // Try the direct scrape approach as a fallback
          const directScrapeResult = await directScrape(url);
          
          if (!directScrapeResult.isSuccess) {
            throw new Error(directScrapeResult.message || 'Direct scrape also failed');
          }
          
          if (!directScrapeResult.data?.content) {
            throw new Error('No content found in direct scrape result');
          }
          
          // Update database with results from direct scrape
          await updateScrapedDataContentAction(scrapedDataId, {
            scrapedContent: { 
              markdown: directScrapeResult.data.content, 
              metadata: {
                source: 'direct-scrape-fallback',
                scrapedAt: new Date().toISOString()
              } 
            },
            contentType: 'markdown',
            status: 'completed'
          });
          
          // Update purchase status to indicate scraping completed
          await updatePurchaseStatusAction(purchaseId, 'scrape_complete');
          
          return {
            isSuccess: true,
            message: 'Website scraped successfully using fallback direct method',
            data: { scrapedDataId }
          };
        } else {
          // For other errors, rethrow the original error
          throw originalError;
        }
      }
    } catch (error: any) {
      console.error('Error during scraping:', error);

      // Update database with error status
      await updateScrapedDataStatusAction(
        scrapedDataId, 
        'failed', 
        error.message || 'Unknown scraping error'
      );

      // Update purchase status to indicate scraping failed
      await updatePurchaseStatusAction(purchaseId, 'scrape_failed');

      return {
        isSuccess: false,
        message: `Scraping failed: ${error.message || 'Unknown error'}`
      };
    }
  } catch (error: any) {
    console.error('Error in triggerScrapeAction:', error);
    return {
      isSuccess: false,
      message: 'An unexpected error occurred during the scraping process'
    };
  }
}

/**
 * Triggers a website scrape using the direct Firecrawl API approach, 
 * which is more reliable for complex websites
 */
export async function triggerDirectScrapeAction(
  url: string,
  purchaseId: string
): Promise<ActionState<{ scrapedDataId: string }>> {
  try {
    // Create initial record with pending status
    const createResult = await createScrapedDataAction({
      purchaseId,
      url,
      contentType: 'markdown',
      status: 'pending'
    });

    if (!createResult.isSuccess) {
      return {
        isSuccess: false,
        message: createResult.message || 'Failed to create initial scrape record'
      };
    }

    const scrapedDataId = createResult.data!.id;

    try {
      // Update purchase status to indicate scraping in progress
      await updatePurchaseStatusAction(purchaseId, 'pending_scrape');

      // Perform the direct scrape with sitemap crawling and batch processing
      const directScrapeResult = await directScrape(url);

      if (!directScrapeResult.isSuccess) {
        throw new Error(directScrapeResult.message || 'Direct scrape returned unsuccessful result');
      }

      if (!directScrapeResult.data?.content) {
        throw new Error('No content found in direct scrape result');
      }

      // Update database with successful results
      await updateScrapedDataContentAction(scrapedDataId, {
        scrapedContent: { 
          markdown: directScrapeResult.data.content, 
          metadata: {
            source: 'direct-scrape',
            scrapedAt: new Date().toISOString()
          } 
        },
        contentType: 'markdown',
        status: 'completed'
      });

      // Update purchase status to indicate scraping completed
      await updatePurchaseStatusAction(purchaseId, 'scrape_complete');

      return {
        isSuccess: true,
        message: 'Website scraped successfully using direct method',
        data: { scrapedDataId }
      };
    } catch (error: any) {
      console.error('Error during direct scraping:', error);

      // Update database with error status
      await updateScrapedDataStatusAction(
        scrapedDataId, 
        'failed', 
        error.message || 'Unknown direct scraping error'
      );

      // Update purchase status to indicate scraping failed
      await updatePurchaseStatusAction(purchaseId, 'scrape_failed');

      return {
        isSuccess: false,
        message: `Direct scraping failed: ${error.message || 'Unknown error'}`
      };
    }
  } catch (error: any) {
    console.error('Error in triggerDirectScrapeAction:', error);
    return {
      isSuccess: false,
      message: 'An unexpected error occurred during the direct scraping process'
    };
  }
}

/**
 * Extract structured data from a website using Firecrawl
 */
export async function extractStructuredDataAction(
  url: string,
  schema: any,
  prompt?: string
): Promise<ActionState<any>> {
  try {
    const options: ScrapeOptions = {
      ...DEFAULT_SCRAPE_OPTIONS,
      formats: ['json'],
      jsonOptions: {
        schema,
        prompt
      }
    };

    const extractResult = await scrapeWithRetry(url, options);

    if (!extractResult.success) {
      return {
        isSuccess: false,
        message: extractResult.error || 'Data extraction was unsuccessful'
      };
    }

    if (!extractResult.data?.json) {
      return {
        isSuccess: false,
        message: 'No structured data could be extracted'
      };
    }

    return {
      isSuccess: true,
      message: 'Data extracted successfully',
      data: extractResult.data.json
    };
  } catch (error: any) {
    console.error('Error in extractStructuredDataAction:', error);
    return {
      isSuccess: false,
      message: `Data extraction failed: ${error.message || 'Unknown error'}`
    };
  }
} 