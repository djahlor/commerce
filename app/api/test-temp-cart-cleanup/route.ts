import { createTempCartAction, deleteTempCartAction, getTempCartByCartIdAction } from '@/actions/db/temp-carts-actions';
import { generateTempCartId } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint for the temp cart cleanup
 * This simulates the webhook flow that should delete the cart after use
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Generate a unique cart ID and create a cart
    const tempCartId = generateTempCartId();
    const testUrl = 'https://example-store.com/temp-cart-to-delete';
    
    const createResult = await createTempCartAction(
      tempCartId,
      testUrl,
      JSON.stringify({ testData: true })
    );
    
    if (!createResult.isSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create temp cart for deletion test',
        details: createResult.message
      }, { status: 500 });
    }
    
    // 2. Verify the cart exists
    const getBeforeResult = await getTempCartByCartIdAction(tempCartId);
    
    // 3. Delete the cart
    const deleteResult = await deleteTempCartAction(tempCartId);
    
    if (!deleteResult.isSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete temp cart',
        details: deleteResult.message
      }, { status: 500 });
    }
    
    // 4. Try to get the cart again to verify it's deleted
    const getAfterResult = await getTempCartByCartIdAction(tempCartId);
    
    return NextResponse.json({
      success: true,
      test: 'complete',
      originalCartId: tempCartId,
      cartExistedBefore: getBeforeResult.isSuccess,
      deleteSuccess: deleteResult.isSuccess,
      cartExistsAfter: getAfterResult.isSuccess,
      cleanup: {
        success: !getAfterResult.isSuccess,
        message: getAfterResult.message
      }
    });
    
  } catch (error) {
    console.error('Test temp cart cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 