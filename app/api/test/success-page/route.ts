import { createOutputAction } from '@/actions/db/outputs-actions'
import { createPurchaseAction } from '@/actions/db/purchases-actions'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint to create a purchase with various statuses
 * GET /api/test/success-page?status=processing|completed|scrape_failed|generation_failed
 * 
 * Returns a purchase record that can be used to test the success page
 */
export async function GET(request: NextRequest) {
  try {
    // Get requested status
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'processing'
    
    // Create test purchase ID
    const testId = `test-${Date.now()}`
    
    // Create a test purchase with requested status
    const purchaseResult = await createPurchaseAction({
      polarOrderId: testId,
      email: 'test@example.com',
      amount: 9900, // $99
      url: 'https://example.com',
      tier: 'base',
      status: status as any
    })
    
    if (!purchaseResult.isSuccess || !purchaseResult.data) {
      return NextResponse.json(
        { error: 'Failed to create test purchase', message: purchaseResult.message },
        { status: 500 }
      )
    }
    
    const purchaseId = purchaseResult.data.id
    
    // If status is completed, create some test outputs
    let outputs = []
    if (status === 'completed') {
      // Create test outputs for completed purchases
      const types = ['blueprint', 'persona', 'technical']
      
      for (const type of types) {
        const outputResult = await createOutputAction({
          purchaseId,
          type,
          filePath: `${purchaseId}/${type}-report.pdf`
        })
        
        if (outputResult.isSuccess && outputResult.data) {
          outputs.push(outputResult.data)
        }
      }
    }
    
    // Return test data
    return NextResponse.json({
      success: true,
      test: 'complete',
      purchase: purchaseResult.data,
      outputs,
      testUrl: `/success?orderId=${testId}`
    })
    
  } catch (error) {
    console.error('Test success page error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 