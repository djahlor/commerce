import { db } from '@/db/db';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin endpoint to create the temp_carts table directly 
 * This is useful for testing or if migrations are problematic
 */
export async function GET(req: NextRequest) {
  try {
    // Create the temp_carts table directly using SQL
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS temp_carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id TEXT NOT NULL UNIQUE,
        url TEXT,
        metadata TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      )
    `);
    
    return NextResponse.json({
      success: true,
      message: 'temp_carts table created successfully'
    });
  } catch (error) {
    console.error('Error creating temp_carts table:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 