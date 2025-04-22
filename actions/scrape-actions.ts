'use server';

import { updatePurchaseStatusAction } from '@/actions/db/purchases-actions';
import { createScrapedDataAction, updateScrapedDataContentAction, updateScrapedDataStatusAction } from '@/actions/db/scraped-data-actions';
import { DEFAULT_SCRAPE_OPTIONS, ScrapeOptions, scrapeWithRetry } from '@/lib/firecrawl';
import { ActionState } from '@/types';

/**
 * Triggers a website scrape using Firecrawl and saves the results to the database
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