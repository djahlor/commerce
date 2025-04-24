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

// Product IDs - these should be updated with your actual Polar product IDs
export const PRODUCT_IDS = {
  BASE_KIT: 'base_kit', // Update with actual ID from Polar dashboard
  FULL_STACK: 'full_stack', // Update with actual ID
  UPSELLS: {
    SEO_STRATEGY: 'seo_strategy', // Update with actual ID
    CONTENT_STRATEGY: 'content_strategy', // Update with actual ID
    CUSTOMER_PERSONA: 'customer_persona', // Update with actual ID
  },
}; 