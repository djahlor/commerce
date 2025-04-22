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
    status?: "processing" | "completed" | "failed";
    clerkUserId?: string;
  }
): Promise<ActionState<typeof purchasesTable.$inferSelect>> {
  try {
    // Get authenticated user ID if available
    const session = await auth();
    const clerkUserId = data.clerkUserId || session.userId;
    
    const [purchase] = await db
      .insert(purchasesTable)
      .values({
        polarOrderId: data.polarOrderId,
        customerEmail: data.email,
        amount: data.amount,
        url: data.url,
        tier: data.tier,
        clerkUserId: clerkUserId,
        status: (data.status as any) || "processing"
      })
      .returning();

    if (!purchase) {
      return {
        isSuccess: false,
        message: "Failed to create purchase record"
      };
    }

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
  status: "processing" | "completed" | "failed"
): Promise<ActionState<typeof purchasesTable.$inferSelect>> {
  try {
    const [purchase] = await db
      .update(purchasesTable)
      .set({
        status: status,
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
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "You must be signed in to perform this action."
      };
    }

    const purchases = await db.query.purchases.findMany({
      where: eq(purchasesTable.clerkUserId, userId),
      orderBy: (purchases: any, { desc }: { desc: any }) => [desc(purchases.createdAt)]
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