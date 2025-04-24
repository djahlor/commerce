## 2. Product Definition (Polar.sh for E-Com Edge Kit)

In Polar, both one-time purchases and subscriptions are treated as "Products". You define these within your Polar organization's dashboard. For the E-Com Edge Kit, you'll need to create products representing your different kit tiers and potential upsells.

### 2.1 Creating Products in Polar Dashboard

1.  **Navigate:** Log in to your Polar dashboard (either Sandbox or Production) and go to the "Products" section.
2.  **Create New:** Click the button to create a new product.
3.  **Define Details:**
    *   **Name & Description:** Give the product a clear name (e.g., "E-Com Edge Base Kit", "Competitor Kill Matrix Upsell", "Monthly Edge Update") and description. These might be shown to the customer during checkout.
    *   **Billing Cycle:**
        *   For the **Base Kit ($149)** and **Full Edge Stack ($399)**, select **"One-time purchase"**.
        *   For the **Competitor Kill Matrix ($199)** and **Threat Scanner ($99)** upsells (if sold standalone), also select **"One-time purchase"**.
        *   For the **Monthly Edge Update ($49/month)** upsell, select **"Monthly"**. Polar also supports "Yearly" if needed for other subscription types.
    *   **Pricing Type & Price:**
        *   For fixed-price items, select **"Fixed price"**.
        *   Enter the price in the chosen currency (e.g., USD). **Important:** Polar typically expects prices in cents (confirm this in their UI or documentation if unsure), so $149 would be entered as `14900`.
        *   *Note:* "Pay what you want" and "Free" options exist but are not relevant for the defined E-Com Edge Kit products.
    *   **Product Media:** You can optionally upload images for your products.
    *   **Checkout Fields:** Polar allows adding custom fields to the checkout. This project handles the required URL input *before* adding to the cart, so standard Polar checkout fields might not be necessary unless you need other info.
    *   **Benefits (Entitlements):** Polar has built-in features to automate access to things like file downloads, license keys, Discord roles, etc., directly tied to a product purchase. **For the E-Com Edge Kit, the core PDF delivery is handled by a custom backend process triggered *after* the purchase via webhook.** Therefore, you *will not* typically use Polar's built-in "Benefits" feature for delivering the main PDF reports. You simply need the product definition for the payment and order processing.

### 2.2 Product IDs

*   **Importance:** Every product (and its specific price, though often the same ID for simple products) you create in Polar will have a unique ID (e.g., `prod_xxxxxxxxxxxxxx`).
*   **Finding the ID:** You can find this ID in the Polar dashboard on the product's detail page or sometimes via context menus in the product list.
*   **Usage:** This Product ID is crucial for integration. You will need it to:
    *   Reference the correct product when creating a Checkout Session via the API (`POST /v1/checkouts`).
    *   Potentially identify purchased items in the webhook payload.

**Recommendation:** Keep a record (e.g., in your project's configuration or environment variables) mapping your internal product names/tiers to their corresponding Polar Product IDs for both Sandbox and Production environments.

```
# .env.example
# --- Polar Product IDs ---
NEXT_PUBLIC_POLAR_PRODUCT_ID_BASE_KIT=prod_...
NEXT_PUBLIC_POLAR_PRODUCT_ID_FULL_STACK=prod_...
NEXT_PUBLIC_POLAR_PRODUCT_ID_UPSELL_MATRIX=prod_...
NEXT_PUBLIC_POLAR_PRODUCT_ID_UPSELL_SCANNER=prod_...
NEXT_PUBLIC_POLAR_PRODUCT_ID_UPSELL_MONTHLY=prod_...

# Remember to have separate sets for Sandbox and Production if IDs differ
POLAR_SANDBOX_PRODUCT_ID_BASE_KIT=prod_...
POLAR_PROD_PRODUCT_ID_BASE_KIT=prod_...
```