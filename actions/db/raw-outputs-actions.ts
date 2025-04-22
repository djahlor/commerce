'use server';

import { db } from '@/db/db';
import { rawOutputsTable } from '@/db/schema/raw-outputs-schema';
import { ActionState, ErrorMessages } from '@/lib/types';
import { eq } from 'drizzle-orm';

/**
 * Creates a new raw output record
 */
export async function createRawOutputAction(
  data: {
    purchaseId: string;
    content: string;
    type: string;
  }
): Promise<ActionState<typeof rawOutputsTable.$inferSelect>> {
  try {
    const [rawOutput] = await db
      .insert(rawOutputsTable)
      .values(data)
      .returning();

    return {
      isSuccess: true,
      data: rawOutput
    };
  } catch (error) {
    console.error('Error in createRawOutputAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
}

/**
 * Gets a raw output by ID
 */
export async function getRawOutputAction(
  id: string
): Promise<ActionState<typeof rawOutputsTable.$inferSelect>> {
  try {
    const rawOutput = await db.query.rawOutputsTable.findFirst({
      where: eq(rawOutputsTable.id, id)
    });

    if (!rawOutput) {
      return {
        isSuccess: false,
        message: ErrorMessages.NOT_FOUND
      };
    }

    return {
      isSuccess: true,
      data: rawOutput
    };
  } catch (error) {
    console.error('Error in getRawOutputAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
}

/**
 * Gets all raw outputs for a purchase
 */
export async function getPurchaseRawOutputsAction(
  purchaseId: string
): Promise<ActionState<Array<typeof rawOutputsTable.$inferSelect>>> {
  try {
    const rawOutputs = await db.query.rawOutputsTable.findMany({
      where: eq(rawOutputsTable.purchaseId, purchaseId),
      orderBy: (rawOutputs, { desc }) => [desc(rawOutputs.createdAt)]
    });

    return {
      isSuccess: true,
      data: rawOutputs
    };
  } catch (error) {
    console.error('Error in getPurchaseRawOutputsAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
} 