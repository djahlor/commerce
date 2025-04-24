## 5. SDK Usage (TypeScript Focus for E-Com Edge Kit)

Polar provides official SDKs to simplify interaction with their API. For a Next.js project, the TypeScript SDK is the most relevant. Framework-specific adapters (like `@polar-sh/nextjs`) can further simplify common tasks like webhook handling and checkout routes.

### 5.1 Installation

Install the necessary packages using your package manager (e.g., pnpm, npm, yarn):

```bash
# Core SDK for direct API interaction
pnpm add @polar-sh/sdk

# Optional but recommended: Next.js adapter for simplified routes/handlers
pnpm add @polar-sh/nextjs zod # zod is often a peer dependency for validation
```

### 5.2 Initialization

Create a client instance to interact with the API. It's good practice to centralize this in a utility file (e.g., `lib/polar.ts`).

```typescript
// lib/polar.ts
import { Polar, PolarOptions } from '@polar-sh/sdk';

// Ensure environment variables are loaded (e.g., using dotenv or Next.js built-in support)
const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
if (!polarAccessToken) {
  throw new Error('POLAR_ACCESS_TOKEN environment variable is not set.');
}

// Determine the server based on environment (optional, defaults to production)
const polarServer: PolarOptions['server'] =
  process.env.NODE_ENV === 'development' || process.env.POLAR_ENV === 'sandbox'
  ? 'sandbox'
  : 'production';

export const polar = new Polar({
  accessToken: polarAccessToken,
  server: polarServer, // Explicitly set for clarity and sandbox testing
});

// You might also initialize webhook helpers here if using the core SDK directly
// import { Webhook } from '@polar-sh/sdk/webhooks';
// export const polarWebhook = new Webhook(process.env.POLAR_WEBHOOK_SECRET ?? '');
```

**Key Points:**

*   **Access Token:** The client requires your Organization Access Token (OAT) obtained from the Polar dashboard and stored securely in environment variables (`POLAR_ACCESS_TOKEN`).
*   **Server Environment:** Explicitly setting `server: 'sandbox'` is crucial for development and testing. Omit it or set `server: 'production'` for the live application. Use environment variables (like `NODE_ENV` or a custom `POLAR_ENV`) to control this dynamically.

### 5.3 Key SDK Functions for E-Com Edge Kit

#### 5.3.1 Creating Checkout Sessions (`polar.checkouts.create`)

This is used in your server action (`actions/polar-actions.ts#createPolarCheckoutAction`) to initiate the payment flow.

```typescript
// Example usage within a server action
import { polar } from '@/lib/polar'; // Import your initialized client
import { CheckoutCreate } from '@polar-sh/sdk/models/components'; // Import necessary types

// ... inside your server action ...

const tempCartId = 'your-temporary-cart-uuid'; // ID from Supabase temp_carts
const productIds = ['prod_base_kit_123', 'prod_upsell_scanner_456']; // From user's cart state
const successRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?checkout_id={CHECKOUT_ID}`;

try {
  const checkoutCreatePayload: CheckoutCreate = {
    products: productIds,
    success_url: successRedirectUrl,
    metadata: {
      // CRITICAL: Pass the temporary cart ID for URL retrieval in webhook
      tempCartId: tempCartId,
      // Add any other checkout-level metadata if needed
    },
    // Optionally prefill customer details if known
    // customer_email: 'user@example.com',
    // customer_external_id: 'clerk_or_internal_user_id',
  };

  const checkoutSession = await polar.checkouts.create(checkoutCreatePayload);

  if (checkoutSession.url) {
    // Return the URL for client-side redirect
    return { success: true, data: { checkoutUrl: checkoutSession.url } };
  } else {
    throw new Error('Polar checkout session creation failed.');
  }
} catch (error) {
  console.error('Error creating Polar checkout session:', error);
  return { success: false, error: 'Failed to initiate checkout.' };
}
```

#### 5.3.2 Verifying Webhooks (`polar.webhooks.constructEvent` or `@polar-sh/nextjs` Helper)

This is used in your webhook handler (`app/api/webhooks/polar/route.ts`) to securely verify and parse incoming events.

**Option A: Using `@polar-sh/nextjs` Helper (Recommended for Next.js)**

This adapter simplifies route setup significantly.

```typescript
// app/api/webhooks/polar/route.ts
import { Webhooks } from '@polar-sh/nextjs';
import { type WebhookPayload } from '@polar-sh/sdk/webhooks'; // Type for payload
import { processOrderSucceeded } from '@/lib/webhook-processor'; // Your custom processing logic

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('POLAR_WEBHOOK_SECRET environment variable is not set.');
}

export const POST = Webhooks({
  webhookSecret: webhookSecret,

  // Define specific handlers for events you subscribed to
  onOrderSucceeded: async (payload: WebhookPayload<'order.succeeded'>) => {
    console.log('Received order.succeeded webhook:', payload.data.id);
    try {
      // Call your custom logic asynchronously
      await processOrderSucceeded(payload);
      // No need to explicitly return 200, the helper handles it
    } catch (error) {
      console.error('Error processing order.succeeded webhook:', error);
      // Throwing an error here might cause the helper to return a 500
      // Consider more granular error handling if needed
      throw error; // Re-throw to signal failure to Polar for retries
    }
  },

  // Optional: Define a generic handler for all subscribed events
  // onPayload: async (payload: WebhookPayload<any>) => {
  //   console.log(`Received webhook event type: ${payload.type}`);
  //   // Route to specific handlers based on payload.type if not using specific handlers above
  // },

   // Optional: Handle errors during verification/processing
   onError: async (error) => {
     console.error(`Webhook handler error: ${error.message}`);
     // The helper typically responds with an appropriate error code
   },
});
```

**Option B: Using Core SDK (`@polar-sh/sdk/webhooks`)**

This gives more manual control but requires handling the request/response explicitly.

```typescript
// app/api/webhooks/polar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Webhook, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import { processOrderSucceeded } from '@/lib/webhook-processor';

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('POLAR_WEBHOOK_SECRET environment variable is not set.');
}

const polarWebhook = new Webhook(webhookSecret);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  try {
    // Verify signature and parse event
    const event = polarWebhook.constructEvent(rawBody, headers);

    // Handle the event based on its type
    switch (event.type) {
      case 'order.succeeded':
        console.log('Received order.succeeded webhook:', event.data.id);
        // Trigger processing asynchronously - DO NOT await long tasks here
        processOrderSucceeded(event).catch(err => {
            console.error("Async webhook processing failed:", err);
            // Implement monitoring/alerting for background failures
        });
        break;
      // Handle other event types if subscribed
      // case 'order.refunded':
      //   console.log('Order refunded:', event.data.id);
      //   break;
      default:
        console.warn(`Unhandled event type ${event.type}`);
    }

    // Acknowledge receipt to Polar immediately
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    } else {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}
```

#### 5.3.3 Fetching Products (Optional - `polar.products.list` / `get`)

While the project primarily uses hardcoded Product IDs, you might want to fetch product details dynamically for display purposes.

```typescript
import { polar } from '@/lib/polar';

async function getProductDetails(productId: string) {
  try {
    const product = await polar.products.get(productId);
    console.log('Product Name:', product.name);
    // Access product.prices array for pricing info
    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
}

async function listAllProducts() {
  try {
    // Use pagination parameters as needed
    const productsList = await polar.products.list({ limit: 50 });
    // productsList.items contains the array of products
    // productsList.pagination contains pagination info
    console.log(`Fetched ${productsList.items.length} products.`);
    return productsList.items;
  } catch (error) {
    console.error('Error listing products:', error);
    return [];
  }
}
```

#### 5.3.4 Creating Customer Portal Sessions (Optional - `polar.customerSessions.create`)

If you implement a button for users to manage their subscriptions/orders directly via Polar's portal.

```typescript
import { polar } from '@/lib/polar';

async function getCustomerPortalUrl(polarCustomerId: string) {
  try {
    const session = await polar.customerSessions.create({ customerId: polarCustomerId });
    return session.customerPortalUrl; // URL to redirect the user to
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return null;
  }
}
```
