import { testPdfStorage } from '@/actions/storage/test-storage';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to test PDF storage functionality
 * GET /api/test-storage?purchaseId=test-id&delete=true
 */
export async function GET(request: NextRequest) {
  try {
    // Extract test parameters
    const searchParams = request.nextUrl.searchParams;
    const purchaseId = searchParams.get('purchaseId') || 'test-purchase-id';
    const shouldDelete = searchParams.get('delete') === 'true';
    
    // Run the storage test
    const result = await testPdfStorage(purchaseId, shouldDelete);
    
    // Return the results
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in test-storage API route:', error);
    return NextResponse.json({
      isSuccess: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 