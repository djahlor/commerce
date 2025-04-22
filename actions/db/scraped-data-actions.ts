'use server';

import { db } from '@/db/db';
import { scrapedDataTable } from '@/db/schema/scraped-data-schema';
import { ActionState } from '@/types';
import { eq } from 'drizzle-orm';

/**
 * Creates a new scraped data record
 */
export async function createScrapedDataAction(
  data: {
    purchaseId: string;
    url: string;
    scrapedContent?: any;
    contentType: 'markdown' | 'json';
    status?: 'pending' | 'completed' | 'failed';
    errorMessage?: string;
  }
): Promise<ActionState<typeof scrapedDataTable.$inferSelect>> {
  try {
    const [scrapedData] = await db
      .insert(scrapedDataTable)
      .values({
        purchaseId: data.purchaseId,
        url: data.url,
        scrapedContent: data.scrapedContent || null,
        contentType: data.contentType,
        status: data.status || 'pending',
        errorMessage: data.errorMessage
      })
      .returning();

    if (!scrapedData) {
      return {
        isSuccess: false,
        message: "Failed to create scraped data record"
      };
    }

    return {
      isSuccess: true,
      message: "Scraped data created successfully",
      data: scrapedData
    };
  } catch (error) {
    console.error('Error in createScrapedDataAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Updates a scraped data record with content
 */
export async function updateScrapedDataContentAction(
  id: string,
  data: {
    scrapedContent: any;
    contentType: 'markdown' | 'json';
    status: 'completed' | 'failed';
    errorMessage?: string;
  }
): Promise<ActionState<typeof scrapedDataTable.$inferSelect>> {
  try {
    const [scrapedData] = await db
      .update(scrapedDataTable)
      .set({
        scrapedContent: data.scrapedContent,
        contentType: data.contentType,
        status: data.status,
        errorMessage: data.errorMessage,
        updatedAt: new Date()
      })
      .where(eq(scrapedDataTable.id, id))
      .returning();

    if (!scrapedData) {
      return {
        isSuccess: false,
        message: "The requested resource was not found."
      };
    }

    return {
      isSuccess: true,
      message: "Scraped data updated successfully",
      data: scrapedData
    };
  } catch (error) {
    console.error('Error in updateScrapedDataContentAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Updates the status of a scraped data record
 */
export async function updateScrapedDataStatusAction(
  id: string,
  status: 'pending' | 'completed' | 'failed',
  errorMessage?: string
): Promise<ActionState<typeof scrapedDataTable.$inferSelect>> {
  try {
    const [scrapedData] = await db
      .update(scrapedDataTable)
      .set({
        status: status,
        errorMessage: errorMessage,
        updatedAt: new Date()
      })
      .where(eq(scrapedDataTable.id, id))
      .returning();

    if (!scrapedData) {
      return {
        isSuccess: false,
        message: "The requested resource was not found."
      };
    }

    return {
      isSuccess: true,
      message: "Scraped data status updated successfully",
      data: scrapedData
    };
  } catch (error) {
    console.error('Error in updateScrapedDataStatusAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Gets scraped data by purchase ID
 */
export async function getScrapedDataByPurchaseIdAction(
  purchaseId: string
): Promise<ActionState<typeof scrapedDataTable.$inferSelect>> {
  try {
    const scrapedData = await db
      .select()
      .from(scrapedDataTable)
      .where(eq(scrapedDataTable.purchaseId, purchaseId))
      .then(result => result[0]);

    if (!scrapedData) {
      return {
        isSuccess: false,
        message: "Scraped data not found for this purchase"
      };
    }

    return {
      isSuccess: true,
      message: "Scraped data retrieved successfully",
      data: scrapedData
    };
  } catch (error) {
    console.error('Error in getScrapedDataByPurchaseIdAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Gets scraped data by its ID
 */
export async function getScrapedDataByIdAction(
  id: string
): Promise<ActionState<typeof scrapedDataTable.$inferSelect>> {
  try {
    const scrapedData = await db
      .select()
      .from(scrapedDataTable)
      .where(eq(scrapedDataTable.id, id))
      .then(result => result[0]);

    if (!scrapedData) {
      return {
        isSuccess: false,
        message: "Scraped data not found"
      };
    }

    return {
      isSuccess: true,
      message: "Scraped data retrieved successfully",
      data: scrapedData
    };
  } catch (error) {
    console.error('Error in getScrapedDataByIdAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
} 