## 4. Webhooks (Polar.sh for E-Com Edge Kit)

Webhooks are essential for automating the E-Com Edge Kit's backend processes *after* a user successfully completes a payment on Polar's hosted checkout page. Polar sends automated notifications (HTTP POST requests) to an endpoint you define on your server when specific events occur.

### 4.1 Purpose

For this project, webhooks serve as the trigger mechanism for:

1.  **Order Confirmation:** Receiving official notification that a payment has succeeded.
2.  **Backend Processing Initiation:** Triggering the custom workflow, which includes:
    *   Retrieving the full cart details (including the per-item URL) using the `tempCartId` passed via metadata.
    *   Saving the confirmed purchase details into the Supabase `purchases` table.
    *   Initiating the website scraping process via Firecrawl (`triggerScrapeAction`).
    *   (Subsequently, the scraping/PDF generation actions will handle AI processing, PDF storage, and status updates).

### 4.2 Setup in Polar Dashboard

You need to configure a webhook endpoint within your Polar organization settings (for both Sandbox and Production environments):

1.  **Navigate:** Go to Settings -> Developers -> Webhooks in your Polar dashboard.
2.  **Add Endpoint:** Click "Add Endpoint".
3.  **URL:** Enter the **absolute public URL** of your webhook handler API route.
    *   Example Production: `https://your-live-domain.com/api/webhooks/polar`
    *   Example Development: You'll need a tunneling service like [ngrok](https://ngrok.com/) to expose your local development server. The URL will look like `https://<your-ngrok-id>.ngrok-free.app/api/webhooks/polar`.
4.  **Format:** Select **"RAW"**. This ensures Polar sends the payload as standard JSON. (Discord/Slack formats are not relevant here).
5.  **Secret:** Generate or enter a strong secret key. This is **crucial** for verifying that incoming requests genuinely originate from Polar.
    *   Store this secret securely as an environment variable on your server (e.g., `POLAR_WEBHOOK_SECRET`). **Do not hardcode it.**
6.  **Events:** Select the specific events you want Polar to send notifications for. For this project, the primary event is:
    *   `order.succeeded`: This event typically fires when a checkout session is successfully completed and payment is confirmed.
    *   *(Note based on Changelog):* Polar documentation also mentions `order.paid` and `order.updated` events. While `order.succeeded` seems most appropriate for triggering the post-purchase flow, verify if `order.paid` might be more suitable if there's a delay between success and final payment processing confirmation. For the initial implementation, target `order.succeeded`. You might also subscribe to `order.refunded` later if you need to handle refund logic like revoking access.

### 4.3 Verification

**It is absolutely critical to verify the signature of every incoming webhook request.** This prevents malicious actors from sending fake requests to your endpoint.

*   **Mechanism:** Polar includes specific headers in each webhook POST request (e.g., `webhook-signature`, `webhook-timestamp`, `webhook-id`) based on the [Standard Webhooks](https://www.standardwebhooks.com/) specification. The signature is generated using the **Webhook Secret** you configured.
*   **Implementation:**
    *   **Recommended:** Use the helper functions provided by the official Polar SDKs (e.g., `@polar-sh/sdk` or `@polar-sh/nextjs`). These libraries typically have a function like `validateEvent` or `Webhooks` wrapper that takes the raw request body, headers, and your webhook secret, performs the verification, and parses the event payload if valid. It will throw an error if verification fails.
    *   **Manual/Other Libraries:** If not using the official SDK helpers directly, use a library compatible with Standard Webhooks. Ensure you handle the base64 encoding of the secret as required by the standard (the Polar SDK helpers manage this internally).
*   **Action on Failure:** If signature verification fails, immediately respond with an HTTP `403 Forbidden` or `400 Bad Request` status code and **do not process the payload**.

### 4.4 Payload Structure & Data Extraction

Assuming verification succeeds, the webhook handler needs to parse the JSON payload of the `order.succeeded` event. Key data points to extract include:

*   `data.id` or similar path for the **Polar Order ID**. Store this in your `purchases` table (`polarOrderId`).
*   `data.customer_email`: The email address the customer used during checkout. Store this (`customerEmail`).
*   `data.line_items` (or similar structure): An array representing the items purchased. You'll need to iterate through this to understand *what* was bought (using the `product_id`).
*   `data.metadata`: The metadata object you passed during checkout creation. **Crucially, extract the `tempCartId` from here.**
    *   Example: `const tempCartId = payload.data.metadata?.tempCartId;`
*   `data.amount_total` (or similar): The total amount paid (usually in cents). Store this (`amount`).

### 4.5 Delivery & Retries

*   **Acknowledgement:** Your webhook handler **must** return a successful HTTP status code (e.g., `200 OK` or `202 Accepted`) to Polar *quickly* after receiving and verifying the request. This acknowledges receipt. **Do not wait for long-running processes like scraping or PDF generation to finish before responding.**
*   **Timeouts:** Polar expects a response within **20 seconds**. If your handler takes longer, Polar will consider it a failure.
*   **Retries:** If Polar doesn't receive a successful response (due to timeout, network error, or your server returning a 4xx/5xx error), it will automatically retry sending the webhook up to **10 times** with exponential backoff.
*   **Best Practice:** Perform only essential, quick tasks synchronously within the main webhook handler function (verification, parsing, saving initial purchase record with 'pending' status, triggering an *asynchronous* background job/queue for scraping). Respond 200 OK immediately after triggering the background task.

### 4.6 Idempotency

Webhook handlers must be **idempotent**. This means processing the exact same webhook event multiple times should result in the same final state as processing it once. Retries can cause duplicate deliveries.

*   **Implementation:** Before creating a new record in your `purchases` table, check if a record with the same `polarOrderId` already exists. If it does, you can either:
    *   Ignore the duplicate event and respond 200 OK.
    *   Update the existing record if necessary (though usually not needed for `order.succeeded`).

### 4.7 Triggering Subsequent Actions

After successfully verifying the webhook, parsing the payload, and retrieving the full cart data (using `tempCartId`):

1.  Call your Supabase server action (`createPurchaseAction`) to create the record in the `purchases` table, including the `polarOrderId`, `customerEmail`, purchased `tier`, the associated `url` (retrieved via `tempCartId`), `amount`, and setting an initial `status` like `'pending_scrape'`.
2.  Call (or enqueue) your scraping action (`triggerScrapeAction`), passing the `purchaseId` (from the newly created Supabase record) and the `url`.
3.  Respond `200 OK` to Polar.

