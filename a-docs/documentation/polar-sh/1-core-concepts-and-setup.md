## 1. Core Concepts & Setup (Polar.sh for E-Com Edge Kit)

This section covers the fundamental aspects of Polar.sh relevant to setting up the E-Com Edge Kit project.

### 1.1 What Polar.sh Provides

Polar.sh serves two primary functions for this project:

1.  **Billing Platform:** It handles the entire payment process, including accepting payments via its hosted checkout page, managing product definitions, and processing orders.
2.  **Merchant of Record (MoR):** Polar takes on the legal responsibility for selling the digital products to the end customer. This significantly simplifies tax compliance, as Polar handles the calculation, collection, and remittance of international sales taxes (like VAT, GST, etc.) where applicable. You receive payouts net of taxes and Polar's fees.

### 1.2 Sandbox vs. Production Environment

Polar provides two distinct environments:

*   **Sandbox (`sandbox.polar.sh`, API: `sandbox-api.polar.sh`):**
    *   A completely separate testing environment.
    *   Use this extensively during development and testing.
    *   Requires its own user account, organization, products, and API keys.
    *   Allows simulating purchases using [Stripe's test card numbers](https://docs.stripe.com/testing#cards) without actual money changing hands.
    *   Ideal for testing checkout flows, webhook handlers, and integrations.
    *   SDKs need to be explicitly configured to use the sandbox server (e.g., `server: 'sandbox'` option in the JS/TS SDK).
*   **Production (`polar.sh`, API: `api.polar.sh`):**
    *   The live environment for real transactions.
    *   Requires its own organization setup, product configuration, and API keys.
    *   Use only when ready to launch and accept actual payments.

**Recommendation:** Develop and test *all* integrations using the Sandbox environment first.

### 1.3 Organization Setup

Before creating products or API keys, you need to:

1.  Sign up for Polar.sh (both sandbox and production).
2.  Create an "Organization" within Polar. This acts as your store or business entity within the platform. You'll manage products, view orders, set up webhooks, and generate API keys within the context of your organization.

### 1.4 Authentication: Organization Access Tokens (OAT)

Interaction with the Polar API (e.g., creating checkout sessions) requires authentication. The primary method for server-side integration is using **Organization Access Tokens (OAT)**.

*   **Generation:** Create OATs within your Polar organization's settings under the "Developers" or "API Keys" section.
*   **Scope:** Tokens are tied to a *specific* organization. You'll need separate tokens for your Sandbox and Production organizations.
*   **Security:**
    *   Treat these tokens like passwords. **Never** expose them in client-side code (e.g., directly in your Next.js frontend components).
    *   Store them securely as environment variables on your server (e.g., in `.env.local` and Vercel environment variables). Use names like `POLAR_ACCESS_TOKEN` or `POLAR_SECRET_KEY`.
    *   Polar participates in secret scanning programs (like GitHub's) and may automatically revoke tokens found exposed publicly.
*   **Usage:** Pass the token in the `Authorization` header of your API requests as a Bearer token:
    `Authorization: Bearer <your_polar_access_token>`
    *   The official Polar SDKs handle this automatically when initialized with the token.
