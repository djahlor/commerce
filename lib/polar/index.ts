/**
 * Polar SDK client for handling checkouts and webhooks
 */
import { Polar } from '@polar-sh/sdk';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

// Initialize Polar SDK
const accessToken = process.env.POLAR_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error(
    'POLAR_ACCESS_TOKEN environment variable is not set. Please set it in your .env.local file.'
  );
}

// Create Polar SDK instance
export const polar = new Polar({
  accessToken,
  // Default to production server, but can be overridden with env var
  server: process.env.POLAR_SERVER_TYPE === 'sandbox' ? 'sandbox' : 'production',
});

// Webhook verification secret
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

/**
 * Verify webhook signature
 * @param signature Signature from the webhook request
 * @param payload Raw request body
 * @returns Boolean indicating if the signature is valid
 */
export const verifyWebhookSignature = (
  signature: string | null,
  payload: string
): boolean => {
  if (!webhookSecret) {
    console.warn(
      'POLAR_WEBHOOK_SECRET is not set. Webhook validation is disabled.'
    );
    return true; // Allow in development, but log warning
  }

  if (!signature) {
    return false;
  }

  try {
    // Use the SDK's validateEvent helper
    validateEvent(payload, { 'polar-signature': signature }, webhookSecret);
    return true;
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error('Webhook signature verification failed:', error.message);
    } else {
      console.error('Error verifying webhook signature:', error);
    }
    return false;
  }
};

// Product IDs - using environment variables
export const PRODUCT_IDS = {
  // Using environment variables for Polar product IDs
  BASE_KIT: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_BASE_KIT || '606a3e6a-09c0-46fb-9f4e-d3375668b714', // Edge Kit™
  FULL_STACK: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_FULL_STACK || '045b8bd4-cb2e-4a9d-805d-8ad9be14ff4c', // Edge Stack™
  UPSELLS: {
    SEO_STRATEGY: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_SEO_STRATEGY || '', // Replace with actual UUID when available
    CONTENT_STRATEGY: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_CONTENT_STRATEGY || '', // Replace with actual UUID when available
    CUSTOMER_PERSONA: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_CUSTOMER_PERSONA || '', // Replace with actual UUID when available
  },
}; 