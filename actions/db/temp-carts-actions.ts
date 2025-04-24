'use server';

import { db } from '@/db/db';
import { tempCartsTable } from '@/db/schema';
import { ActionState } from '@/lib/types';
import { eq, lt, sql } from 'drizzle-orm';

/**
 * Creates a temporary cart record to store URL metadata
 * This is used as a workaround for passing URL data through Polar checkout
 */
export async function createTempCartAction(
  cartId: string,
  url: string = '',
  additionalMetadata?: string
): Promise<ActionState<{ id: string; cartId: string }>> {
  try {
    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Insert record into temp_carts table
    const [result] = await db.insert(tempCartsTable)
      .values({
        cartId,
        url,
        metadata: additionalMetadata,
        expiresAt
      })
      .returning({ id: tempCartsTable.id, cartId: tempCartsTable.cartId });

    return {
      isSuccess: true,
      message: 'Temporary cart created successfully',
      data: result
    };
  } catch (error) {
    console.error('Error creating temp cart:', error);
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `Failed to create temporary cart: ${error.message}`
        : 'Failed to create temporary cart due to an unknown error'
    };
  }
}

/**
 * Retrieves a temporary cart by its cart ID
 */
export async function getTempCartByCartIdAction(
  cartId: string
): Promise<ActionState<{ url: string; metadata: string | null }>> {
  try {
    const result = await db.select({
      url: tempCartsTable.url,
      metadata: tempCartsTable.metadata
    })
    .from(tempCartsTable)
    .where(eq(tempCartsTable.cartId, cartId))
    .limit(1);

    if (!result || result.length === 0) {
      return {
        isSuccess: false,
        message: `No temporary cart found with ID: ${cartId}`
      };
    }

    // We've verified result has at least one item, so first item cannot be undefined
    const firstItem = result[0]!;

    return {
      isSuccess: true,
      data: {
        url: firstItem.url || '',
        metadata: firstItem.metadata
      }
    };
  } catch (error) {
    console.error('Error retrieving temp cart:', error);
    return {
      isSuccess: false,
      message: error instanceof Error
        ? `Failed to retrieve temporary cart: ${error.message}`
        : 'Failed to retrieve temporary cart due to an unknown error'
    };
  }
}

/**
 * Deletes a temporary cart after it has been processed
 */
export async function deleteTempCartAction(
  cartId: string
): Promise<ActionState<void>> {
  try {
    await db.delete(tempCartsTable)
      .where(eq(tempCartsTable.cartId, cartId));

    return {
      isSuccess: true,
      message: 'Temporary cart deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting temp cart:', error);
    return {
      isSuccess: false,
      message: error instanceof Error
        ? `Failed to delete temporary cart: ${error.message}`
        : 'Failed to delete temporary cart due to an unknown error'
    };
  }
}

/**
 * Cleans up expired temporary carts
 * This can be called periodically or via a cron job
 */
export async function cleanupExpiredTempCartsAction(): Promise<ActionState<{ count: number }>> {
  try {
    const now = new Date();
    const result = await db.delete(tempCartsTable)
      .where(lt(tempCartsTable.expiresAt, sql`${now}`))
      .returning();

    return {
      isSuccess: true,
      message: `Cleaned up ${result.length} expired temporary carts`,
      data: { count: result.length }
    };
  } catch (error) {
    console.error('Error cleaning up expired temp carts:', error);
    return {
      isSuccess: false,
      message: error instanceof Error
        ? `Failed to clean up expired carts: ${error.message}`
        : 'Failed to clean up expired carts due to an unknown error'
    };
  }
} 