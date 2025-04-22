'use server';

import { db } from '@/db/db';
import { purchasesTable } from '@/db/schema/purchases-schema';
import { ActionState } from '@/types';
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
        customerEmail: data.email,
        status: data.status || 'processing'
      })
      .returning();

    return {
      isSuccess: true,
      message: "Purchase created successfully",
      data: purchase
    };
  } catch (error) {
    console.error('Error in createPurchaseAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
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
        message: "The requested resource was not found."
      };
    }

    return {
      isSuccess: true,
      message: "Purchase status updated successfully",
      data: purchase
    };
  } catch (error) {
    console.error('Error in updatePurchaseStatusAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
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
        message: "You must be signed in to perform this action."
      };
    }

    const purchases = await db.query.purchasesTable.findMany({
      where: eq(purchasesTable.clerkUserId, userId),
      orderBy: (purchases, { desc }) => [desc(purchases.createdAt)]
    });

    return {
      isSuccess: true,
      message: "Purchases retrieved successfully",
      data: purchases
    };
  } catch (error) {
    console.error('Error in getUserPurchasesAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
} 