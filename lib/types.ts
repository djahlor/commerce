/**
 * Generic type for server action responses
 * Used to standardize error handling and response formats across all server actions
 */
export type ActionState<T = void> = 
  | { isSuccess: true; data: T; message?: string }
  | { isSuccess: false; error?: Error; message: string };

/**
 * Common error messages used across server actions
 */
export const ErrorMessages = {
  UNAUTHORIZED: "You must be signed in to perform this action.",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again later.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "The provided data is invalid."
} as const; 