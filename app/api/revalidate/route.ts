import { NextRequest, NextResponse } from 'next/server';

// Temporary replacement for Shopify revalidation
export async function POST(req: NextRequest): Promise<NextResponse> {
  // This is a placeholder for Shopify's revalidation
  // In a real implementation, this would revalidate your own data cache
  console.log('Revalidation request received');
  
  // Simply return a success response for now
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
