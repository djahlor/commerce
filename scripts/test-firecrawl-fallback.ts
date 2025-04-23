import { triggerScrapeAction } from '@/actions/scrape-actions';
import { db } from '@/db/db';
import { purchasesTable } from '@/db/schema/purchases-schema';
import { scrapedDataTable } from '@/db/schema/scraped-data-schema';
import { DEFAULT_SCRAPE_OPTIONS } from '@/lib/firecrawl';
import { eq } from 'drizzle-orm';

interface ScrapedContent {
  markdown?: string;
  metadata?: {
    source?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * This test verifies that the fallback mechanism in triggerScrapeAction works
 * for the site that was previously failing with "No markdown content" error
 */
async function testFallbackMechanism() {
  console.log('=== Testing Firecrawl Fallback Mechanism ===');
  
  // Generate a unique order ID and use the site that was failing
  const testOrderId = `test-fallback-${Date.now()}`;
  const testUrl = 'https://evecurls.com/';
  
  try {
    // Create a new purchase record
    console.log(`Creating test purchase with order ID: ${testOrderId}`);
    const [purchase] = await db
      .insert(purchasesTable)
      .values({
        polarOrderId: testOrderId,
        customerEmail: 'test@example.com',
        amount: 1000,
        url: testUrl,
        tier: 'base',
        status: 'processing'
      })
      .returning();
    
    if (!purchase) {
      throw new Error('Failed to create purchase record');
    }
    
    console.log(`Created purchase with ID: ${purchase.id}`);
    
    // Test the scrape action which should now fall back to direct scraping
    console.log(`Testing scrape action with fallback for URL: ${testUrl}`);
    const scrapeResult = await triggerScrapeAction(testUrl, purchase.id, DEFAULT_SCRAPE_OPTIONS);
    
    console.log('Scrape result:', JSON.stringify(scrapeResult, null, 2));
    
    if (scrapeResult.isSuccess && scrapeResult.data) {
      console.log('✅ SUCCESS: Fallback mechanism worked!');

      // Check the database record to confirm
      const scrapedDataResults = await db
        .select()
        .from(scrapedDataTable)
        .where(eq(scrapedDataTable.id, scrapeResult.data.scrapedDataId));
      
      if (scrapedDataResults.length > 0) {
        const scrapedData = scrapedDataResults[0];
        
        if (scrapedData) {
          console.log('Scraped Data Status:', scrapedData.status);
          
          // Check if we have content
          if (scrapedData.scrapedContent) {
            const content = scrapedData.scrapedContent as ScrapedContent;
            const metadata = content.metadata || {};
            console.log('Source:', metadata.source || 'unknown');
            console.log('Content Length:', content.markdown?.length || 0);
            
            if (content.markdown) {
              console.log('Content Preview:', content.markdown.substring(0, 200) + '...');
            } else {
              console.log('❌ ERROR: No markdown in content');
            }
          } else {
            console.log('❌ ERROR: No content in database record');
          }
        }
      } else {
        console.log('❌ ERROR: No database record found');
      }
    } else {
      console.log('❌ ERROR: Fallback mechanism failed:', scrapeResult.message);
    }
    
    // Check the purchase status
    const updatedPurchases = await db
      .select()
      .from(purchasesTable)
      .where(eq(purchasesTable.id, purchase.id));
      
    if (updatedPurchases.length > 0) {
      const updatedPurchase = updatedPurchases[0];
      console.log('Final Purchase Status:', updatedPurchase?.status);
    } else {
      console.log('❌ ERROR: Updated purchase not found');
    }
    
    console.log('Test completed');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testFallbackMechanism().then(() => {
  console.log('Fallback test completed');
  process.exit(0);
}).catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
}); 