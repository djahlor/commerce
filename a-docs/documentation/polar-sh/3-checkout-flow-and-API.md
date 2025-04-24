## 3. Checkout Flow & API (Polar.sh for E-Com Edge Kit)

The E-Com Edge Kit relies on Polar's **Checkout Session API** to programmatically initiate the payment process after the user builds their cart (including custom URLs) within the Next.js application.

### 3.1 Primary Method: Checkout Session API

Instead of using static Checkout Links or the Embedded Checkout primarily, the project will use a server-side action to dynamically create a checkout session when the user clicks "Checkout" in the adapted cart component.

*   **API Endpoint:** `POST /v1/checkouts`
*   **Environment:** Use `https://sandbox-api.polar.sh/v1/checkouts` for testing and `https://api.polar.sh/v1/checkouts` for production.
*   **Authentication:** Requires the Organization Access Token (OAT) in the `Authorization: Bearer <token>` header. The Polar SDK handles this automatically.

### 3.2 Creating a Checkout Session (`POST /v1/checkouts`)

Your backend server action (e.g., `actions/polar-actions.ts#createPolarCheckoutAction`) will call this endpoint.

**Key Request Body Parameters:**

*   `products` **(Required)**: `string[]`
    *   An array of Polar **Product IDs** representing the items in the user's cart.
    *   The first product ID in the array is typically selected by default on the Polar checkout page.
    *   **Handling Multiple Items:** For the multi-item cart requirement, you will pass all Product IDs from the user's local cart state into this array. Example: `["prod_base_kit_123", "prod_upsell_scanner_456"]`.
*   `success_url` **(Required)**: `string | null`
    *   The URL on *your* site where the customer will be redirected after a successful payment.
    *   Set this to your custom success page, e.g., `https://yourdomain.com/success`.
    *   **Important:** You can include the placeholder `{CHECKOUT_ID}` in the URL. Polar will replace this with the actual Checkout Session ID upon redirect. Example: `https://yourdomain.com/success?checkout_id={CHECKOUT_ID}`. This ID is useful for fetching order status on the success page.
*   `metadata` **(Optional but CRITICAL for this project)**: `object`
    *   A key-value store for attaching custom data to the checkout session. This data is passed through to the order/subscription and included in webhook events.
    *   **Structure:** An object where keys are strings (max 40 chars) and values can be strings (max 500 chars), integers, numbers (floating-point), or booleans. Max 50 pairs.
    *   **See Section 3.3 for specific handling of per-item URLs.**
*   `customer_email` **(Optional)**: `string | null`
    *   Prefills the email field on the Polar checkout page. Useful if the user is already known or logged into a part of your system before checkout.
*   `customer_external_id` **(Optional)**: `string | null`
    *   An ID from *your* system (e.g., your internal user ID, Clerk User ID *if* known pre-checkout).
    *   If a Polar Customer with this external ID already exists, the order will be linked.
    *   If not, Polar will create a new Customer and associate this external ID with them. Useful for linking Polar customers back to your user accounts post-purchase.
*   `allow_discount_codes` **(Optional)**: `boolean` (default: `true`)
    *   Controls if the user can enter discount codes on the Polar checkout page.
*   `discount_id` **(Optional)**: `string | null`
    *   Apply a specific pre-defined Polar Discount directly.
*   `require_billing_address` **(Optional)**: `boolean` (default: `false`)
    *   Forces collection of the full billing address (beyond just country). Automatically true if you pre-set the billing address. US addresses are always required fully.
*   `customer_billing_address` **(Optional)**: `object | null`
    *   Prefills the billing address fields.

### 3.3 Metadata Handling (Passing Custom URL per Item)

This is a critical aspect for the E-Com Edge Kit, as you need to associate a specific website URL provided by the user with each kit purchased in the cart.

**Challenge:** Standard Polar `metadata` on the checkout session (`POST /v1/checkouts`) is typically associated with the *entire checkout*, not individual line items within that checkout. The API documentation doesn't explicitly show per-line-item metadata capability during checkout creation.

**Required Implementation Strategy (Workaround - As per PRD/Spec):**

1.  **Pre-Checkout Save:** *Before* calling `polar.checkouts.create`, your server action (`createPolarCheckoutAction`) must save the essential cart details, *including the URL associated with each specific Product ID*, to a temporary table in your Supabase database (e.g., `temp_carts`). Generate a unique ID for this temporary record (e.g., a UUID).
    *   `temp_carts` schema example: `{ id: uuid, cart_data: jsonb, created_at: timestamp, expires_at: timestamp }`
    *   `cart_data` would store `[{ productId: "prod_...", quantity: 1, url: "https://customer-site.com" }, ...]`.
2.  **Pass Temporary ID in Metadata:** When calling `polar.checkouts.create`, include *only* the unique ID of the temporary Supabase record in the `metadata` field.
    *   Example: `metadata: { tempCartId: "your-unique-temp-cart-uuid" }`
3.  **Retrieve in Webhook:** In your `order.succeeded` webhook handler (`app/api/webhooks/polar/route.ts`), extract the `tempCartId` from the incoming webhook payload's metadata.
4.  **Fetch Full Data:** Use the `tempCartId` to query your Supabase `temp_carts` table and retrieve the full cart details, including the crucial per-item URLs.
5.  **Process Order:** Proceed with creating the purchase record in your main `purchases` table, associating the correct URL with the purchased kit, and triggering the scraping process.
6.  **Cleanup:** Delete the record from `temp_carts` after successful processing to avoid clutter. Implement an expiration mechanism for `temp_carts` as well (e.g., records older than 1 hour) to handle abandoned checkouts.

**Verification Needed:** Double-check the latest Polar API documentation or contact their support to confirm if per-line-item metadata at checkout creation has been added. If it has, the workaround might be simplified, but the described workaround is the safe approach based on current information.

### 3.4 Checkout Session Response

The `POST /v1/checkouts` API call, if successful (HTTP 201), returns a JSON object representing the checkout session. Key fields include:

*   `id`: `string` - The unique ID of the Polar Checkout Session. This is the `{CHECKOUT_ID}` placeholder value.
*   `url`: `string` - The URL of the Polar-hosted checkout page. **This is the URL you need to redirect the user to.**
*   `client_secret`: `string` - Used for client-side updates (less relevant for this project's flow).
*   `status`: `string` - Initially "open".
*   `expires_at`: `string` - Timestamp when the session expires.
*   Details of the products, customer info (if provided), amounts, etc.

### 3.5 Redirecting the User

After the server action successfully creates the checkout session and receives the response:

1.  The server action returns the `url` from the Polar response to the client-side component that initiated the checkout (e.g., the cart modal).
2.  The client-side JavaScript performs a full-page redirect to this Polar checkout `url`:
    ```javascript
    // Example in a React component after getting the checkoutUrl from the server action
    window.location.href = checkoutUrl;
    ```
3.  The user leaves your site and completes the payment on Polar's secure, hosted page.

### 3.6 Success URL Handling

*   When creating the checkout session, you provide the `success_url` (e.g., `https://yourdomain.com/success?checkout_id={CHECKOUT_ID}`).
*   After the user successfully pays on Polar's page, Polar redirects the user's browser back to this URL.
*   Polar replaces `{CHECKOUT_ID}` with the actual ID of the completed session.
*   Your `/success` page component can then parse this `checkout_id` from the URL query parameters. This ID can be used to fetch initial status information or simply display a confirmation message while waiting for the webhook to fully process the order backend.

### 3.7 Other Checkout Methods (Mention Only)

*   **Checkout Links:** Static URLs created in the Polar dashboard that link to a checkout for specific products. Less flexible for dynamic carts with custom data like URLs.
*   **Embedded Checkout:** A JavaScript library (`@polar-sh/checkout`) allows embedding the checkout form directly into your site using an iframe. While powerful, the project spec opts for the simpler redirect-to-hosted-page flow via the Checkout Session API.

