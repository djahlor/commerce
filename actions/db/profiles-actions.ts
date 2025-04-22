'use server';

import { db } from '@/db/db';
import { profilesTable } from '@/db/schema/profiles-schema';
import { ActionState } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

/**
 * Gets the profile for the currently authenticated user
 */
export async function getCurrentProfileAction(): Promise<ActionState<typeof profilesTable.$inferSelect | null>> {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "You must be signed in to perform this action."
      };
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    });

    return {
      isSuccess: true,
      message: "Profile retrieved successfully",
      data: profile || null
    };
  } catch (error) {
    console.error('Error in getCurrentProfileAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Creates or updates a profile for the currently authenticated user
 * 
 * Note: Email parameter is accepted but not stored in the profiles table
 * as Clerk already manages user emails. It can be used elsewhere in the
 * application flow, such as for notifications or data association.
 */
export async function upsertProfileAction(email: string): Promise<ActionState<typeof profilesTable.$inferSelect>> {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "You must be signed in to perform this action."
      };
    }

    // Check if profile exists
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    });

    if (existingProfile) {
      // Update existing profile
      const [updatedProfile] = await db
        .update(profilesTable)
        .set({ updatedAt: new Date() })
        .where(eq(profilesTable.userId, userId))
        .returning();

      if (!updatedProfile) {
        return {
          isSuccess: false,
          message: "Failed to update profile"
        };
      }

      return {
        isSuccess: true,
        message: "Profile updated successfully",
        data: updatedProfile
      };
    } else {
      // Create new profile
      const [newProfile] = await db
        .insert(profilesTable)
        .values({
          userId
        })
        .returning();

      if (!newProfile) {
        return {
          isSuccess: false,
          message: "Failed to create profile"
        };
      }

      return {
        isSuccess: true,
        message: "Profile created successfully",
        data: newProfile
      };
    }
  } catch (error) {
    console.error('Error in upsertProfileAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
} 