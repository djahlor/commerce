## 7. Merchant of Record (MoR) - Polar.sh for E-Com Edge Kit

One of the significant advantages of using Polar.sh for the E-Com Edge Kit is its function as a **Merchant of Record (MoR)**. This drastically simplifies the complexities associated with international sales tax compliance.

### 7.1 What MoR Means for Your Project

*   **Polar is the Seller:** Legally, Polar Software Inc. acts as the reseller of your digital products (the E-Com Edge Kits and upsells) to the end customer. The transaction occurs between the customer and Polar.
*   **Tax Liability Transfer:** Polar assumes the legal responsibility and liability for calculating, collecting, and remitting sales taxes (like VAT, GST, US Sales Tax) to the relevant government authorities worldwide, based on the customer's location.
*   **Simplified Compliance:** You, as the product creator, do not need to register for sales tax in potentially dozens or hundreds of different countries and jurisdictions, nor do you need to file and pay taxes in those locations. Polar handles this complexity.
*   **Global Sales Enabled:** This model makes it feasible to sell your kits globally from day one without immediately incurring the high administrative overhead and costs of managing international tax compliance yourself.

### 7.2 How it Works in Practice

1.  **Checkout:** When a customer goes through the Polar checkout process, Polar determines the customer's location (based on billing address, IP address, etc.).
2.  **Tax Calculation:** Polar automatically calculates the applicable sales tax based on local regulations for digital goods in the customer's location.
3.  **Price Display:** The final price shown to the customer on the Polar checkout page includes the base price *plus* any applicable taxes. For example, a $149 kit might be shown as $178.80 to a customer in a country with a 20% VAT rate ($149 * 1.20).
4.  **Collection:** Polar collects the total amount (base price + tax) from the customer.
5.  **Remittance:** Polar is responsible for filing tax returns and remitting the collected tax amounts to the appropriate tax authorities.
6.  **Payout:** Your Polar account balance reflects your earnings *after* taxes and Polar's fees have been deducted. When you request a payout, you receive these net earnings.

**Important Distinction:** Polar handles *sales taxes*. You are still responsible for your own *income/revenue taxes* in your country of residency based on the payouts you receive from Polar.

### 7.3 Fees Associated with Polar (MoR Model)

Using Polar as an MoR involves fees that are deducted from the transaction amount before the funds appear in your balance.

*   **Polar Transaction Fee:** A percentage plus a fixed fee per transaction. The documentation mentions **4% + 40¢** as the base fee. This covers Polar's operational costs, underlying payment processor fees (like Stripe's 2.9% + 30¢), and the cost/risk of managing MoR compliance.
*   **Additional Fees (Passed through from underlying PSP like Stripe):**
    *   International Card Fee: Often around +1.5% for cards issued outside the MoR's primary country (e.g., non-US cards).
    *   Subscription Fee: Sometimes an additional small percentage (e.g., +0.5%) might apply specifically to recurring subscription payments.
    *   Currency Conversion Fees: If applicable.
*   **Dispute/Chargeback Fee:** If a customer disputes a charge with their bank, a fixed fee (e.g., $15) is typically charged by the payment networks, regardless of the outcome. Polar passes this fee on. Polar actively works to minimize chargebacks.
*   **Payout Fees:** When you withdraw funds from your Polar balance to your bank account (via Stripe Connect), additional fees apply, charged by the payout provider (Stripe). These are separate from the initial transaction fees. The documentation mentions:
    *   $2 per month for active payouts (if payouts occurred that month).
    *   0.25% + $0.25 per payout transaction.
    *   Cross-border/currency conversion fees if applicable (0.25% - 1%).

**Summary:** The MoR model simplifies tax compliance significantly but comes at a higher per-transaction fee compared to using a Payment Service Provider (PSP) like Stripe directly (where *you* would be responsible for all tax calculations and remittance). For the E-Com Edge Kit, the benefit of offloading global tax compliance is a key reason for choosing Polar.

---

This concludes the core sections relevant to the E-Com Edge Kit project based on the provided documentation and project requirements.