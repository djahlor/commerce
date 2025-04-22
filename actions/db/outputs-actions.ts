'use server';

import { db } from '@/db/db';
import { outputsTable } from '@/db/schema/outputs-schema';
import { purchasesTable } from '@/db/schema/purchases-schema';
import { ActionState } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * Creates a new output record
 */
export async function createOutputAction(
  data: {
    purchaseId: string;
    type: string;
    filePath: string;
    rawOutputId?: string;
  }
): Promise<ActionState<typeof outputsTable.$inferSelect>> {
  try {
    const [output] = await db
      .insert(outputsTable)
      .values(data)
      .returning();

    if (!output) {
      return {
        isSuccess: false,
        message: "Failed to create output record"
      };
    }

    return {
      isSuccess: true,
      message: "Output created successfully",
      data: output
    };
  } catch (error) {
    console.error('Error in createOutputAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Gets outputs for a specific purchase
 */
export async function getPurchaseOutputsAction(
  purchaseId: string
): Promise<ActionState<Array<typeof outputsTable.$inferSelect>>> {
  try {
    const outputs = await db.query.outputs.findMany({
      where: eq(outputsTable.purchaseId, purchaseId),
      orderBy: (outputs: any, { asc }: { asc: any }) => [asc(outputs.type)]
    });

    return {
      isSuccess: true,
      message: "Purchase outputs retrieved successfully",
      data: outputs
    };
  } catch (error) {
    console.error('Error in getPurchaseOutputsAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Gets all outputs for the authenticated user
 */
export async function getUserOutputsAction(): Promise<ActionState<Array<(typeof outputsTable.$inferSelect & { purchase: typeof purchasesTable.$inferSelect })>>> {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "You must be signed in to perform this action."
      };
    }

    // Join with purchases to filter by user
    const outputs = await db.query.outputs.findMany({
      with: {
        purchase: true
      },
      where: eq(purchasesTable.clerkUserId, userId)
    });

    return {
      isSuccess: true,
      message: "User outputs retrieved successfully",
      data: outputs
    };
  } catch (error) {
    console.error('Error in getUserOutputsAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
} 