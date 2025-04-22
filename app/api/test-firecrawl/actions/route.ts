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
    
    // Test the full scraping action
    const result = await triggerScrapeAction(url, mockPurchaseId, DEFAULT_SCRAPE_OPTIONS);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Firecrawl Test] Action Error:', error);
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