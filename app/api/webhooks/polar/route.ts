import {
  createPurchaseAction,
  getPurchaseByOrderIdAction,
  updatePurchaseStatusAction
} from '@/actions/db/purchases-actions';
import { deleteTempCartAction, getTempCartByCartIdAction } from '@/actions/db/temp-carts-actions';
import { generatePDFAction } from '@/actions/pdf/pdf-actions';
import { verifyWebhookSignature } from '@/lib/polar';
import { NextRequest, NextResponse } from 'next/server';

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Function to potentially notify admins of missing URLs (placeholder for now)
async function notifyAdminOfMissingUrl(orderId: string, email: string): Promise<void> {
  // This would ideally send an email or Slack notification to admins
  // For now, we'll just log it prominently
  console.error(`
    ⚠️⚠️⚠️ ADMIN NOTIFICATION ⚠️⚠️⚠️
    Order ${orderId} is missing a required website URL
    Customer email: ${email}
    Action needed: Contact customer to request their website URL
    ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
  `);
  
  // In a real implementation, this would call an email service
  // await sendAdminNotificationEmail({
  //   subject: `Missing URL - Order ${orderId}`,
  //   message: `Customer with email ${email} did not provide a website URL for their order.`
  // });
}

// Webhook handler for Polar.sh webhooks
export async function POST(req: NextRequest) {
  try {
    // Get the raw request body
    const rawBody = await req.text();
    
    // Get the signature from the header
    const signature = req.headers.get('x-polar-signature');
    
    if (!signature) {
      console.error('Webhook error: No signature provided');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }
    
    // Verify the webhook signature using the helper function
    const isValidSignature = verifyWebhookSignature(signature, rawBody);
    if (!isValidSignature) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Parse the webhook payload
    const event = JSON.parse(rawBody);
    
    // Process the event based on its type
    if (event.type === 'order.succeeded') {
      // Extract order data from the event
      const order = event.data;
      const { id: polarOrderId, email, total_amount, metadata, customer_note } = order;
      
      // Check if this order has already been processed (idempotency check)
      const existingPurchase = await getPurchaseByOrderIdAction(polarOrderId);
      
      if (existingPurchase && existingPurchase.isSuccess && existingPurchase.data) {
        console.log(`Order ${polarOrderId} already processed, skipping`);
        return NextResponse.json({ message: 'Order already processed' }, { status: 200 });
      }
      
      // Get the URL from customer note (provided during checkout)
      let url = '';
      let urlSource = 'none';
      let missingUrl = false;
      
      // Extract the website URL from customer note
      if (customer_note) {
        // Use a simple regex to extract a URL from the customer note
        const urlMatch = customer_note.match(/(https?:\/\/[^\s]+)/i);
        if (urlMatch && urlMatch[0]) {
          url = urlMatch[0];
          urlSource = 'customer_note_regex';
        } else {
          // If no URL pattern found, use the entire note as it might be just the URL
          const trimmedNote = customer_note.trim();
          // Basic check if note looks like a URL
          if (URL_REGEX.test(trimmedNote)) {
            url = trimmedNote.startsWith('http') ? trimmedNote : `https://${trimmedNote}`;
            urlSource = 'customer_note_full';
          }
        }
      }
      
      // If URL is not in customer note but tempCartId exists in metadata,
      // try retrieving from temp_carts table as fallback
      if ((!url || !url.startsWith('http')) && metadata?.tempCartId) {
        try {
          const tempCartResult = await getTempCartByCartIdAction(metadata.tempCartId);
          if (tempCartResult.isSuccess && tempCartResult.data && tempCartResult.data.url) {
            url = tempCartResult.data.url;
            urlSource = 'temp_cart';
          }
          
          // Cleanup the temp cart after retrieval regardless of URL presence
          await deleteTempCartAction(metadata.tempCartId)
            .catch(error => console.error(`Failed to delete temp cart ${metadata.tempCartId}:`, error));
        } catch (error) {
          console.error('Error retrieving temp cart data:', error);
        }
      }
      
      // Final validation and warning for missing URL
      if (!url) {
        missingUrl = true;
        console.warn(`⚠️ No URL provided for order ${polarOrderId}. Using fallback empty URL.`);
        url = ''; // Ensure it's an empty string, not undefined
        urlSource = 'empty_fallback';
        
        // Flag for admin attention - don't block order processing
        // This should eventually send an email or Slack notification to the team
        notifyAdminOfMissingUrl(polarOrderId, email)
          .catch(error => console.error('Failed to notify admin of missing URL:', error));
      } else if (!url.startsWith('http')) {
        console.warn(`⚠️ URL for order ${polarOrderId} is missing protocol. Adding https://`);
        url = `https://${url}`;
        urlSource = `${urlSource}_with_protocol_fix`;
      }
      
      // Log URL source for debugging
      console.log(`Order ${polarOrderId}: URL source = ${urlSource}, URL = ${url}`);
      
      // Determine the tier from the order (can be extracted based on your specific data structure)
      // This is a placeholder - adjust based on your actual order structure
      const tier = order.line_items?.[0]?.product_id || 'basic';
      
      // Create a new purchase record in the database
      const purchaseResult = await createPurchaseAction({
        polarOrderId,
        email,
        amount: total_amount,
        url,
        tier,
        // Use existing enum values until we can properly add the new one
        // Still flag missing URLs for admin attention via console logs
        status: missingUrl ? 'pending_scrape' : 'processing'
      });
      
      if (!purchaseResult.isSuccess) {
        console.error(`Failed to create purchase record: ${purchaseResult.message}`);
        return NextResponse.json(
          { error: 'Failed to process order' }, 
          { status: 500 }
        );
      }
      
      // Start the PDF generation process asynchronously
      // We don't wait for it to complete to respond quickly to the webhook
      const purchaseId = purchaseResult.data!.id;
      
      // Trigger PDF generation in the background
      generatePDFAction(purchaseId, url, tier).catch(async (error) => {
        console.error(`Error generating PDF: ${error}`);
        // Update purchase status to failed if PDF generation fails
        await updatePurchaseStatusAction(purchaseId, 'failed');
      });
      
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    // Handle other event types as needed
    return NextResponse.json({ received: true }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 