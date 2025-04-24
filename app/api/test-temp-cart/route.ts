import { createTempCartAction, getTempCartByCartIdAction } from '@/actions/db/temp-carts-actions';
import { generateTempCartId } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint for the temp cart implementation
 * This simulates the full flow from checkout to webhook
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Generate a unique cart ID like we would in the checkout process
    const tempCartId = generateTempCartId();
    
    // 2. Create a cart entry with a test URL
    const testUrl = 'https://example-store.com/with-very-long-path/that-might-exceed-metadata-limits';
    const testMetadata = JSON.stringify({
      items: [
        { productId: 'test-product-1', quantity: 1, url: testUrl },
        { productId: 'test-product-2', quantity: 2 }
      ]
    });
    
    const createResult = await createTempCartAction(
      tempCartId,
      testUrl,
      testMetadata
    );
    
    if (!createResult.isSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create temp cart',
        details: createResult.message
      }, { status: 500 });
    }
    
    // 3. Simulate the webhook flow by retrieving the cart data
    const getResult = await getTempCartByCartIdAction(tempCartId);
    
    if (!getResult.isSuccess || !getResult.data) {
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve temp cart',
        details: getResult.message
      }, { status: 500 });
    }
    
    // 4. Verify the data matches what we expect
    const retrievedUrl = getResult.data.url;
    const retrievedMetadata = getResult.data.metadata ? JSON.parse(getResult.data.metadata) : null;
    
    return NextResponse.json({
      success: true,
      test: 'complete',
      originalData: {
        tempCartId,
        url: testUrl,
        metadata: JSON.parse(testMetadata)
      },
      retrievedData: {
        url: retrievedUrl,
        metadata: retrievedMetadata
      },
      validation: {
        urlMatches: testUrl === retrievedUrl,
        metadataMatches: testMetadata === getResult.data.metadata
      }
    });
    
  } catch (error) {
    console.error('Test temp cart error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 