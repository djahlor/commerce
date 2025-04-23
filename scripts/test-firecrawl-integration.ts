import { extractStructuredDataAction, triggerDirectScrapeAction, triggerScrapeAction } from '@/actions/scrape-actions';
import { db } from '@/db/db';
import { purchasesTable } from '@/db/schema/purchases-schema';
import { scrapedDataTable } from '@/db/schema/scraped-data-schema';
import { ScrapeOptions } from '@/lib/firecrawl';
import { directScrape } from '@/lib/firecrawl-direct';
import { eq } from 'drizzle-orm';

async function testFirecrawlIntegration() {
  console.log('=== Testing Full Firecrawl Integration ===');
  
  // Generate a unique order ID
  const testOrderId = `test-order-${Date.now()}`;
  const testUrl = 'https://evecurls.com/';
  
  // Modified options with best practices according to Firecrawl docs
  const scrapeOptions: ScrapeOptions = {
    formats: ['markdown', 'html'], // Primary formats Firecrawl is designed for
    onlyMainContent: true,         // Focus on main content, ignore navigation/footer
    waitFor: 5000,                 // Wait longer for dynamic content (5s)
    timeout: 60000,                // 60s timeout for complete page load
    retries: 3,                    // Increase retry attempts 
    retryDelay: 2000               // Longer delay between retries
  };
  
  // Create an e-commerce specific schema for extraction
  const ecommerceSchema = {
    type: "object",
    properties: {
      productName: { type: "string" },
      description: { type: "string" },
      price: { type: "string" },
      currency: { type: "string" },
      inStock: { type: "boolean" },
      imageURLs: { type: "array", items: { type: "string" } },
      categories: { type: "array", items: { type: "string" } },
      reviews: { 
        type: "array", 
        items: { 
          type: "object", 
          properties: {
            rating: { type: "number" },
            text: { type: "string" },
            author: { type: "string" }
          }
        } 
      }
    }
  };
  
  const extractPrompt = "Extract product information from this e-commerce website. Focus on the main product details, pricing, and customer reviews if available.";
  
  try {
    // Step 1: Create a new purchase record
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
    
    // Step A: Let's try the original scrape method
    console.log(`\n=== A. Testing original scrape method ===`);
    console.log(`Trying regular scrape for URL: ${testUrl} with optimized options`);
    console.log('Scrape options:', JSON.stringify(scrapeOptions, null, 2));
    const scrapeResult = await triggerScrapeAction(testUrl, purchase.id, scrapeOptions);
    console.log('Original scrape result:', JSON.stringify(scrapeResult, null, 2));
    
    // Check the database record for the original scrape
    if (scrapeResult.isSuccess && scrapeResult.data) {
      console.log(`Checking scraped data record with ID: ${scrapeResult.data.scrapedDataId}`);
      const scrapedDataResults = await db
        .select()
        .from(scrapedDataTable)
        .where(eq(scrapedDataTable.id, scrapeResult.data.scrapedDataId));
      
      if (scrapedDataResults.length > 0) {
        const scrapedData = scrapedDataResults[0];
        if (scrapedData) {
          console.log('Original scrape record status:', scrapedData.status);
          console.log('Has content:', scrapedData.scrapedContent !== null);
        }
      }
    }
    
    // Create a new purchase for the server action test
    console.log(`\n=== B. Testing direct server action ===`);
    const [purchase2] = await db
      .insert(purchasesTable)
      .values({
        polarOrderId: `${testOrderId}-direct`,
        customerEmail: 'test@example.com',
        amount: 1000,
        url: testUrl,
        tier: 'base',
        status: 'processing'
      })
      .returning();
    
    if (!purchase2) {
      throw new Error('Failed to create second purchase record');
    }
    
    console.log(`Created second purchase with ID: ${purchase2.id}`);
    
    // Try the new direct scrape server action
    console.log(`Trying direct scrape server action for URL: ${testUrl}`);
    const directActionResult = await triggerDirectScrapeAction(testUrl, purchase2.id);
    console.log('Direct scrape server action result:', JSON.stringify(directActionResult, null, 2));
    
    // Check the database record for the direct scrape
    if (directActionResult.isSuccess && directActionResult.data) {
      console.log(`Checking scraped data record with ID: ${directActionResult.data.scrapedDataId}`);
      const directScrapedDataResults = await db
        .select()
        .from(scrapedDataTable)
        .where(eq(scrapedDataTable.id, directActionResult.data.scrapedDataId));
      
      if (directScrapedDataResults.length > 0) {
        const directScrapedData = directScrapedDataResults[0];
        if (directScrapedData) {
          console.log('Direct scrape record status:', directScrapedData.status);
          console.log('Has content:', directScrapedData.scrapedContent !== null);
          
          if (directScrapedData.scrapedContent) {
            const contentPreview = JSON.stringify(directScrapedData.scrapedContent).substring(0, 300) + '...';
            console.log('Content preview:', contentPreview);
          }
        }
      }
    }
    
    // Create a third purchase for the direct utility test
    console.log(`\n=== C. Testing direct utility function ===`);
    const [purchase3] = await db
      .insert(purchasesTable)
      .values({
        polarOrderId: `${testOrderId}-utility`,
        customerEmail: 'test@example.com',
        amount: 1000,
        url: testUrl,
        tier: 'base',
        status: 'processing'
      })
      .returning();
    
    if (!purchase3) {
      throw new Error('Failed to create third purchase record');
    }
    
    console.log(`Created third purchase with ID: ${purchase3.id}`);
    
    // Try the direct utility function
    console.log(`Trying direct utility function for URL: ${testUrl}`);
    const directUtilityResult = await directScrape(testUrl);
    console.log('Direct utility result success:', directUtilityResult.isSuccess);
    console.log('Direct utility result message:', directUtilityResult.message);
    
    if (directUtilityResult.isSuccess && directUtilityResult.data) {
      // Print a sample of content
      const contentPreview = directUtilityResult.data.content.substring(0, 300) + '...';
      console.log('Content preview:', contentPreview);
      
      // Insert into scraped_data table
      console.log('Inserting direct utility results into database...');
      const scrapedDataResults = await db
        .insert(scrapedDataTable)
        .values({
          purchaseId: purchase3.id,
          url: testUrl,
          contentType: 'markdown',
          status: 'completed',
          scrapedContent: {
            markdown: directUtilityResult.data.content,
            metadata: {
              source: 'direct-utility',
              scrapedAt: new Date().toISOString()
            }
          }
        })
        .returning();
      
      if (scrapedDataResults.length > 0) {
        const scrapedData = scrapedDataResults[0];
        if (scrapedData) {
          console.log('Successfully saved direct utility results with ID:', scrapedData.id);
          
          // Update purchase status
          await db
            .update(purchasesTable)
            .set({
              status: 'scrape_complete'
            })
            .where(eq(purchasesTable.id, purchase3.id));
          
          console.log('Updated purchase status to scrape_complete');
        }
      }
    }
    
    // Try structured data extraction as well
    console.log(`\n=== D. Testing structured data extraction ===`);
    console.log('Using e-commerce schema for extraction');
    const extractionResult = await extractStructuredDataAction(testUrl, ecommerceSchema, extractPrompt);
    console.log('Extraction result:', JSON.stringify(extractionResult, null, 2));
    
    // Final check of purchase statuses
    console.log(`\n=== Final purchase statuses ===`);
    const allPurchases = await db
      .select()
      .from(purchasesTable)
      .where(
        eq(purchasesTable.polarOrderId, testOrderId) ||
        eq(purchasesTable.polarOrderId, `${testOrderId}-direct`) ||
        eq(purchasesTable.polarOrderId, `${testOrderId}-utility`)
      );
    
    for (const purchase of allPurchases) {
      console.log(`Purchase ${purchase.polarOrderId}: ${purchase.status}`);
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testFirecrawlIntegration().then(() => {
  console.log('Integration test completed');
  process.exit(0);
}).catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
}); 