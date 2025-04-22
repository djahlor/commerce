'use server';

import { db } from '@/db/db';
import { purchasesTable } from '@/db/schema/purchases-schema';
import { ActionState, ErrorMessages } from '@/lib/types';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * Creates a new purchase record
 */
export async function createPurchaseAction(
  data: {
    polarOrderId: string;
    email: string;
    amount: number;
    url: string;
    tier: string;
    status?: string;
    clerkUserId?: string;
  }
): Promise<ActionState<typeof purchasesTable.$inferSelect>> {
  try {
    // Get authenticated user ID if available
    const { userId } = auth();
    const clerkUserId = data.clerkUserId || userId;
    
    const [purchase] = await db
      .insert(purchasesTable)
      .values({
        ...data,
        clerkUserId,
        status: data.status || 'pending'
      })
      .returning();

    return {
      isSuccess: true,
      data: purchase
    };
  } catch (error) {
    console.error('Error in createPurchaseAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
}

/**
 * Updates the status of a purchase
 */
export async function updatePurchaseStatusAction(
  purchaseId: string,
  status: string
): Promise<ActionState<typeof purchasesTable.$inferSelect>> {
  try {
    const [purchase] = await db
      .update(purchasesTable)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(purchasesTable.id, purchaseId))
      .returning();

    if (!purchase) {
      return {
        isSuccess: false,
        message: ErrorMessages.NOT_FOUND
      };
    }

    return {
      isSuccess: true,
      data: purchase
    };
  } catch (error) {
    console.error('Error in updatePurchaseStatusAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
}

/**
 * Gets purchases for the authenticated user
 */
export async function getUserPurchasesAction(): Promise<ActionState<Array<typeof purchasesTable.$inferSelect>>> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        isSuccess: false,
        message: ErrorMessages.UNAUTHORIZED
      };
    }

    const purchases = await db.query.purchasesTable.findMany({
      where: eq(purchasesTable.clerkUserId, userId),
      orderBy: (purchases, { desc }) => [desc(purchases.createdAt)]
    });

    return {
      isSuccess: true,
      data: purchases
    };
  } catch (error) {
    console.error('Error in getUserPurchasesAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
} 