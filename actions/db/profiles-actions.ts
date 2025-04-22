'use server';

import { db } from '@/db/db';
import { profilesTable } from '@/db/schema/profiles-schema';
import { ActionState, ErrorMessages } from '@/lib/types';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * Gets the profile for the currently authenticated user
 */
export async function getCurrentProfileAction(): Promise<ActionState<typeof profilesTable.$inferSelect | null>> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        isSuccess: false,
        message: ErrorMessages.UNAUTHORIZED
      };
    }

    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.clerkUserId, userId)
    });

    return {
      isSuccess: true,
      data: profile
    };
  } catch (error) {
    console.error('Error in getCurrentProfileAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
}

/**
 * Creates or updates a profile for the currently authenticated user
 */
export async function upsertProfileAction(email: string): Promise<ActionState<typeof profilesTable.$inferSelect>> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        isSuccess: false,
        message: ErrorMessages.UNAUTHORIZED
      };
    }

    // Check if profile exists
    const existingProfile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.clerkUserId, userId)
    });

    if (existingProfile) {
      // Update existing profile
      const [updatedProfile] = await db
        .update(profilesTable)
        .set({ email, updatedAt: new Date() })
        .where(eq(profilesTable.clerkUserId, userId))
        .returning();

      return {
        isSuccess: true,
        data: updatedProfile
      };
    } else {
      // Create new profile
      const [newProfile] = await db
        .insert(profilesTable)
        .values({
          clerkUserId: userId,
          email
        })
        .returning();

      return {
        isSuccess: true,
        data: newProfile
      };
    }
  } catch (error) {
    console.error('Error in upsertProfileAction:', error);
    return {
      isSuccess: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: ErrorMessages.INTERNAL_ERROR
    };
  }
} 