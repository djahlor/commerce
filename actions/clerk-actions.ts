'use server';

import { linkClerkUserToPurchasesAction } from "@/actions/db/profiles-actions";
import { ActionState } from "@/types";
import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Links the current authenticated user to any purchases made with their email
 * This is typically called after a user signs in
 */
export async function linkClerkUserAction(): Promise<ActionState<{ updatedCount: number }>> {
  try {
    // Get the current authenticated user
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "You must be signed in to perform this action."
      };
    }
    
    // Get user details from Clerk to access their email
    const user = await currentUser();
    if (!user) {
      return {
        isSuccess: false,
        message: "Unable to retrieve user details."
      };
    }
    
    // Get primary email
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    );
    
    if (!primaryEmail) {
      return {
        isSuccess: false,
        message: "No primary email found for this user."
      };
    }
    
    // Link user to purchases with this email
    const result = await linkClerkUserToPurchasesAction(userId, primaryEmail.emailAddress);
    
    if (!result.isSuccess) {
      return {
        isSuccess: false,
        message: result.message
      };
    }
    
    return {
      isSuccess: true,
      message: `Successfully linked ${result.data.updatedCount} purchases to your account.`,
      data: result.data
    };
  } catch (error) {
    console.error('Error in linkClerkUserAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
} 