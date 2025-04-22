import { db } from '@/db/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the database connection by running a simple query
    console.log('[DB Test] Testing database connection...');
    console.log('[DB Test] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[DB Test] DATABASE_URL format:', process.env.DATABASE_URL ? 
      `${process.env.DATABASE_URL.split(':')[0]}:****` : 'not set');
    
    try {
      // Try to execute a simple query
      const result = await db.query.purchases.findMany({
        limit: 1
      });
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        testResult: {
          recordCount: result.length,
          connectionValid: true
        }
      });
    } catch (queryError: any) {
      console.error('[DB Test] Query error:', {
        message: queryError.message,
        name: queryError.name,
        stack: queryError.stack
      });
      
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        message: queryError.message,
        stack: process.env.NODE_ENV === 'development' ? queryError.stack : undefined
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[DB Test] General error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      error: 'Database connection test failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 