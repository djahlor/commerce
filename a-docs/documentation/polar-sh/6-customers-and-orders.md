## 6. Customers & Orders (Polar.sh for E-Com Edge Kit)

Polar automatically manages customer records and creates orders based on successful checkout sessions. Understanding how these relate is important for linking purchases back to users in your system.

### 6.1 Customer Creation and Management

*   **Automatic Creation:** When a user completes a Polar checkout for the first time using a specific email address, Polar automatically creates a "Customer" record associated with that email within your Polar organization.
*   **Identification:** The primary identifier for a customer within Polar is their **email address**. Polar uses this to group subsequent orders from the same email under the same customer record.
*   **Polar Customer ID:** Each customer record also has a unique internal Polar Customer ID (e.g., `cus_xxxxxxxxxxxxxx`). This ID might be available in webhook payloads or API responses related to orders and subscriptions linked to that customer.
*   **External ID Linking:** As mentioned in Section 3.3, you can proactively link a Polar Customer to your internal user system using the `customer_external_id` field when creating the checkout session.
    *   If you provide an `external_id` that doesn't exist yet in Polar, a new Polar Customer is created with both the email and your `external_id` attached.
    *   If you provide an `external_id` that *does* already exist for a customer in Polar, the new order is linked to that existing customer.
*   **Dashboard View:** You can view and manage your customers within the Polar dashboard under the "Customers" section.

### 6.2 Order Creation

*   **Trigger:** An "Order" record is created in Polar automatically when a checkout session transitions to a successful state (typically corresponding to the `order.succeeded` or `order.paid` webhook event).
*   **Scope:** An Order represents a single, completed transaction.
    *   For **one-time purchases** (like the Base Kit, Full Stack, or standalone upsells), the Order represents that specific sale.
    *   For **subscriptions** (like the Monthly Edge Update), an Order is created for the *initial* payment, and subsequent recurring payments might also generate new Order records (or update the subscription status, check Polar's subscription event details).

### 6.3 Linking Orders to Customers

Polar automatically links an Order to a Customer record based on the **email address** used during the checkout that generated the order.

### 6.4 Order Information (via Webhook/API)

The information associated with an Order is crucial for fulfilling the E-Com Edge Kit deliverables. This data is primarily accessed via the `order.succeeded` (or `order.paid`) webhook payload, but can also potentially be fetched via the Orders API if needed.

Key Order-related information in the webhook payload (`payload.data`):

*   `id`: The unique Polar Order ID (`polarOrderId` in your `purchases` table).
*   `customer_id`: The Polar Customer ID associated with this order.
*   `customer_email`: The email used for the purchase. **Critical for linking to your `profiles` table if `customer_external_id` wasn't used.**
*   `line_items` (or `items` / `products` - check exact payload structure): An array detailing *what* was purchased. Each item typically includes:
    *   `product_id`: The Polar Product ID.
    *   `price_id`: The specific price ID used.
    *   `quantity`: Number of units purchased (usually 1 for the kits).
    *   Amount details per item.
*   `amount_total` (or similar field): Total amount paid (in cents).
*   `currency`: Currency code (e.g., "usd").
*   `metadata`: The custom metadata object you attached during checkout creation. **This contains the `tempCartId` needed to retrieve the associated user-provided URL(s).**
*   `status`: The status of the order (e.g., "succeeded", "paid").
*   Timestamps (`created_at`, etc.).

### 6.5 Linking Logic in E-Com Edge Kit

The flow for linking Polar data to your Supabase records is:

1.  **Webhook Trigger (`order.succeeded`):** The process starts here.
2.  **Extract `tempCartId` and `customerEmail`:** Get these from the webhook payload's metadata and customer details.
3.  **Retrieve URL(s):** Use `tempCartId` to fetch the full cart details (including the URL for each kit) from Supabase `temp_carts`.
4.  **Create `purchases` Record:** Save the order details (Polar Order ID, email, tier, amount, retrieved URL, status='pending_scrape') into your Supabase `purchases` table. Get the `purchaseId`.
5.  **Trigger Scraper:** Start the scraping process with the `purchaseId` and `url`.
6.  **User Login/Dashboard Access:** When the user accesses the dashboard (`/dashboard`), they authenticate via Clerk.
7.  **Clerk `userId`:** Obtain the user's Clerk ID.
8.  **Profile Linking (`linkClerkUserAction`):** On the first dashboard visit post-purchase:
    *   Query the `profiles` table using the Clerk `userId`.
    *   If no profile exists, or if it exists but isn't fully linked, query the `purchases` table using the `customerEmail` obtained from Clerk's user object (which should match the email from the Polar purchase).
    *   Find the corresponding `purchases` record(s).
    *   Update the `purchases` record(s) by setting the `clerkUserId` field.
    *   Create/update the `profiles` record, ensuring the `clerkUserId` and `email` are stored.
9.  **Dashboard Data Fetching:** Subsequent dashboard visits use the authenticated Clerk `userId` to query `profiles`, then join to `purchases` and `outputs` to display the user's specific reports.
