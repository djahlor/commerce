import { Resend } from 'resend';

// Initialize the Resend client with the API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY environment variable not set. Email functionality will be disabled.');
}

// Create and export the Resend client instance
export const resend = new Resend(resendApiKey);

// Default sender email address
export const defaultFromEmail = process.env.EMAIL_FROM || 'no-reply@example.com';

// Helper function to validate an email address format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 