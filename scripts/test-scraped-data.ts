import { createScrapedDataAction, getScrapedDataByIdAction } from '@/actions/db/scraped-data-actions';
import { db } from '@/db/db';
import { purchasesTable } from '@/db/schema/purchases-schema';
import { scrapedDataTable } from '@/db/schema/scraped-data-schema';
import { eq } from 'drizzle-orm';

async function testScrapedData() {
  console.log('Testing scraped data actions...');
  
  try {
    // Step 1: Create a purchase record directly using Drizzle instead of the server action
    console.log('Creating a test purchase record directly with Drizzle...');
    const [purchase] = await db
      .insert(purchasesTable)
      .values({
        polarOrderId: `test-order-${Date.now()}`, // Must be unique
        customerEmail: 'test@example.com',
        amount: 1000, // $10.00
        url: 'https://example.com',
        tier: 'base',
        status: 'processing'
      })
      .returning();
    
    if (!purchase) {
      console.error('Failed to create purchase record. Cannot continue test.');
      return;
    }
    
    console.log('Purchase created:', purchase);
    console.log(`Using purchase ID: ${purchase.id}`);
    
    // Step 2: Create a scraped data record directly using Drizzle
    console.log('Creating a scraped data record directly with Drizzle...');
    try {
      const [scrapedData] = await db
        .insert(scrapedDataTable)
        .values({
          purchaseId: purchase.id,
          url: 'https://example.com',
          contentType: 'markdown',
          status: 'pending'
        })
        .returning();
      
      if (!scrapedData) {
        console.error('Failed to create scraped data record.');
        return;
      }
      
      console.log('Scraped data created successfully:', scrapedData);
      
      // Test fetching the data
      console.log('Fetching scraped data by ID...');
      const fetchedData = await db
        .select()
        .from(scrapedDataTable)
        .where(eq(scrapedDataTable.id, scrapedData.id))
        .then(results => results[0]);
      
      console.log('Fetched data:', fetchedData);
    } catch (error) {
      console.error('Error creating or fetching scraped data:', error);
    }
    
    // Step 3: Now try the actual server actions which should work if direct DB operations succeeded
    console.log('\nTesting the server actions again...');
    const createResult = await createScrapedDataAction({
      purchaseId: purchase.id,
      url: 'https://example2.com',
      contentType: 'markdown',
      status: 'pending'
    });
    
    console.log('Create result using server action:', JSON.stringify(createResult, null, 2));
    
    if (createResult.isSuccess && createResult.data) {
      console.log('Successfully created scraped data record via server action');
      console.log('Now trying to fetch it by ID...');
      
      const fetchResult = await getScrapedDataByIdAction(createResult.data.id);
      console.log('Fetch result:', JSON.stringify(fetchResult, null, 2));
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testScrapedData().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
}); 