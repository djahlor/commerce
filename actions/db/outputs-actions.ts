'use server';

import { db } from '@/db/db';
import { outputsTable } from '@/db/schema/outputs-schema';
import { purchasesTable } from '@/db/schema/purchases-schema';
import { ActionState, ErrorMessages } from '@/lib/types';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * Creates a new output record
 */
export async function createOutputAction(
  data: {
    purchaseId: string;
    type: string;
    path: string;
    rawOutputId?: string;
  }
): Promise<ActionState<typeof outputsTable.$inferSelect>> {
  try {
    const [output] = await db
      .insert(outputsTable)
      .values(data)
      .returning();

    return {
      isSuccess: true,
      data: output
    };
  } catch (error) {
    console.error('Error in createOutputAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
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
    const outputs = await db.query.outputsTable.findMany({
      where: eq(outputsTable.purchaseId, purchaseId),
      orderBy: (outputs, { asc }) => [asc(outputs.type)]
    });

    return {
      isSuccess: true,
      data: outputs
    };
  } catch (error) {
    console.error('Error in getPurchaseOutputsAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
}

/**
 * Gets all outputs for the authenticated user
 */
export async function getUserOutputsAction(): Promise<ActionState<Array<(typeof outputsTable.$inferSelect & { purchase: typeof purchasesTable.$inferSelect })>>> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        isSuccess: false,
        message: ErrorMessages.UNAUTHORIZED
      };
    }

    // Join with purchases to filter by user
    const outputs = await db.query.outputsTable.findMany({
      with: {
        purchase: true
      },
      where: eq(purchasesTable.clerkUserId, userId)
    });

    return {
      isSuccess: true,
      data: outputs
    };
  } catch (error) {
    console.error('Error in getUserOutputsAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
} 