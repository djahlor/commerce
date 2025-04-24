import {
  createPurchaseAction,
  getPurchaseByOrderIdAction,
  updatePurchaseStatusAction
} from '@/actions/db/purchases-actions';
import { deleteTempCartAction, getTempCartByCartIdAction } from '@/actions/db/temp-carts-actions';
import { generatePDFAction } from '@/actions/pdf/pdf-actions';
import { verifyWebhookSignature } from '@/lib/polar';
import { NextRequest, NextResponse } from 'next/server';

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
      const { id: polarOrderId, email, total_amount, metadata } = order;
      
      // Check if this order has already been processed (idempotency check)
      const existingPurchase = await getPurchaseByOrderIdAction(polarOrderId);
      
      if (existingPurchase && existingPurchase.isSuccess && existingPurchase.data) {
        console.log(`Order ${polarOrderId} already processed, skipping`);
        return NextResponse.json({ message: 'Order already processed' }, { status: 200 });
      }
      
      // Get the URL either directly from metadata or from the temp cart table
      let url = metadata?.url || '';
      
      // If tempCartId exists in metadata but no URL, retrieve from temp_carts table
      if (!url && metadata?.tempCartId) {
        try {
          const tempCartResult = await getTempCartByCartIdAction(metadata.tempCartId);
          if (tempCartResult.isSuccess && tempCartResult.data) {
            url = tempCartResult.data.url;
            
            // Cleanup the temp cart after successful retrieval
            await deleteTempCartAction(metadata.tempCartId)
              .catch(error => console.error(`Failed to delete temp cart ${metadata.tempCartId}:`, error));
          } else {
            console.error(`Failed to retrieve temp cart: ${tempCartResult.message}`);
          }
        } catch (error) {
          console.error('Error retrieving temp cart data:', error);
        }
      }
      
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
        status: 'processing'
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