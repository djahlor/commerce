import { extractStructuredDataAction } from '@/actions/scrape-actions';
import { scrapeWithRetry } from '@/lib/firecrawl';
import { NextResponse } from 'next/server';

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

    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    // First show the environment info (safely)
    const envInfo = {
      apiKeySet: !!apiKey,
      apiKeyFormat: apiKey ? (apiKey.startsWith('fc-') ? 'valid' : 'invalid') : 'not set',
      url: url,
      nodeEnv: process.env.NODE_ENV
    };

    console.log('[Firecrawl Test] Environment:', envInfo);
    
    // Test the direct Firecrawl integration
    const result = await scrapeWithRetry(url);
    
    return NextResponse.json({
      environment: envInfo,
      result: result
    });
  } catch (error: any) {
    console.error('[Firecrawl Test] Error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { url, schema, prompt } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Test the structured data extraction
    const result = await extractStructuredDataAction(url, schema, prompt);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}