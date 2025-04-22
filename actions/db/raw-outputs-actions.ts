'use server';

import { db } from '@/db/db';
import { rawOutputsTable } from '@/db/schema/raw-outputs-schema';
import { ActionState } from '@/types';
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
      
    if (!rawOutput) {
      return {
        isSuccess: false,
        message: "Failed to create raw output record"
      };
    }

    return {
      isSuccess: true,
      message: "Raw output created successfully",
      data: rawOutput
    };
  } catch (error) {
    console.error('Error in createRawOutputAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
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
    const rawOutput = await db.query.rawOutputs.findFirst({
      where: eq(rawOutputsTable.id, id)
    });

    if (!rawOutput) {
      return {
        isSuccess: false,
        message: "The requested resource was not found."
      };
    }

    return {
      isSuccess: true,
      message: "Raw output retrieved successfully",
      data: rawOutput
    };
  } catch (error) {
    console.error('Error in getRawOutputAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
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
    const rawOutputs = await db.query.rawOutputs.findMany({
      where: eq(rawOutputsTable.purchaseId, purchaseId),
      orderBy: (rawOutputs: any, { desc }: { desc: any }) => [desc(rawOutputs.createdAt)]
    });

    return {
      isSuccess: true,
      message: "Purchase raw outputs retrieved successfully",
      data: rawOutputs
    };
  } catch (error) {
    console.error('Error in getPurchaseRawOutputsAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
} 