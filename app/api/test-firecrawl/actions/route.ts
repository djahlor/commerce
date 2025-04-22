import { createScrapedDataAction } from '@/actions/db/scraped-data-actions';
import { extractStructuredDataAction, triggerScrapeAction } from '@/actions/scrape-actions';
import { DEFAULT_SCRAPE_OPTIONS } from '@/lib/firecrawl';
import { NextResponse } from 'next/server';

// This is a temporary endpoint for testing the full Firecrawl server action
export async function GET(request: Request) {
  try {
    // Get URL from query parameters
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ 
        error: 'URL parameter is required' 
      }, { status: 400 });
    }

    // Create a mock purchase ID for testing
    const mockPurchaseId = `test-${Date.now()}`;
    
    // Show what we're about to do
    console.log(`[Firecrawl Test] Triggering full scrape action for URL: ${url} with mock purchase ID: ${mockPurchaseId}`);
    
    // Test database connection directly first (more granular debugging)
    try {
      console.log('[Firecrawl Test] First testing direct DB action...');
      const dbResult = await createScrapedDataAction({
        purchaseId: mockPurchaseId,
        url,
        contentType: 'markdown',
        status: 'pending'
      });
      
      console.log('[Firecrawl Test] Direct DB result:', dbResult);
      
      if (!dbResult.isSuccess) {
        return NextResponse.json({
          error: 'Database connection test failed',
          details: dbResult
        }, { status: 500 });
      }
    } catch (dbError: any) {
      console.error('[Firecrawl Test] Direct DB error:', {
        message: dbError.message,
        stack: dbError.stack
      });
      
      return NextResponse.json({
        error: 'Database connection test threw exception',
        message: dbError.message,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      }, { status: 500 });
    }
    
    // Test the full scraping action
    console.log('[Firecrawl Test] Now testing full scrape action...');
    const result = await triggerScrapeAction(url, mockPurchaseId, DEFAULT_SCRAPE_OPTIONS);
    
    console.log('[Firecrawl Test] Full scrape result:', result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Firecrawl Test] Action Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    });
    
    return NextResponse.json({ 
      error: 'Test action failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Endpoint for testing structured data extraction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, schema, prompt } = body;
    
    if (!url) {
      return NextResponse.json({ 
        error: 'URL is required in the request body' 
      }, { status: 400 });
    }
    
    // Test structured data extraction
    const result = await extractStructuredDataAction(url, schema, prompt);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Firecrawl Test] Extraction Error:', error);
    return NextResponse.json({ 
      error: 'Test extraction failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 