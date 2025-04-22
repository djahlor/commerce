---

## E-Com Edge Kit Technical Specification (v2 - Hybrid Approach)

## 1. System Overview

- **Core Purpose**: Deliver AI-generated digital PDF kits (Survival Blueprint, etc.) to e-commerce owners via a premium Next.js web application. Leverages the **Next.js Commerce starter** for UI/cart structure, [**Polar.sh**](http://polar.sh/) for payment processing (acting as Merchant of Record) and order handling, **Supabase** for custom data/PDF storage, and **Clerk** for user authentication on a custom dashboard. Incorporates patterns and components (Shadcn UI, DB setup) inspired by `o1-pro`.
- **Key Workflows**:
    1. User browses products (Kit Tiers, Upsells) displayed on a frontend built using Next.js Commerce components, styled customly. Product data sourced from Polar API or Supabase/local config.
    2. On a Product Page (`app/product/[handle]/page.tsx`), if the product requires a URL (e.g., Base Kit), the user inputs their target e-commerce store URL via a **custom input field**.
    3. User adds items to the cart. The cart state (items, quantities, associated URLs) is managed **locally** within the Next.js app (adapting Next.js Commerce cart context/state).
    4. User initiates checkout from the cart.
    5. A server action (`actions/polar-actions.ts#createPolarCheckoutAction`) reads the local cart state, formats line items, and crucially passes the **URL(s) as metadata** when calling the **Polar Checkout API**.
        - *(Metadata Workaround if Needed):* If Polar doesn't support per-line-item metadata easily, this action will first save cart details (items + URLs) to a temporary Supabase table (`temp_carts`), get a unique ID, and pass *only* that ID in the Polar metadata.
    6. User is redirected to **Polar's hosted checkout page** and completes payment.
    7. Polar sends an `order.succeeded` **webhook** to a custom endpoint (`app/api/webhooks/polar/route.ts`).
    8. The webhook handler verifies the request, retrieves order details (customer email, amount, items, metadata including URL or temp cart ID).
    9. Handler creates/updates a record in **Supabase `purchases`** table, linking `polarOrderId`, customer email, etc. If using the workaround, it retrieves full item details/URLs from `temp_carts`.
    10. Handler triggers the AI/PDF generation process (`actions/pdf-actions.ts`) for each relevant item in the order.
    11. PDF generation completes, files are uploaded to **Supabase Storage**, and metadata is saved in **Supabase `outputs`** table, linked to the `purchaseId`. Purchase status updated.
    12. **Resend** sends a confirmation email with a link to the custom dashboard.
    13. User lands on the custom success page (`/success`) post-checkout, sees processing animation, then links/prompt for dashboard.
    14. User navigates to the **custom Dashboard (`/dashboard`)**, authenticating via **Clerk**.
    15. On first login post-purchase, backend logic links the **Clerk `userId`** to the relevant **Supabase `purchases`** record based on email match.
    16. Dashboard fetches and displays owned outputs from Supabase, tracks progress, and shows upsell offers. Upsells trigger a new Polar checkout.
- **System Architecture**:
    - **Frontend:** Next.js App Router (Vercel Commerce starter base), Tailwind CSS, **Shadcn UI** (integrated), Framer Motion.
    - **Payment/Order Backend:** [**Polar.sh**](http://polar.sh/) (SDK, API, Webhooks).
    - **Custom Data/Storage:** **Supabase** (Postgres via Drizzle ORM for `purchases`, `outputs`, `profiles`, potentially `temp_carts`; Storage for PDFs).
    - **Authentication:** **Clerk** (for `/dashboard` access).
    - **Custom Backend Logic:** Vercel Functions/Edge Functions (Webhook handler, Server Actions).
    - **AI Service:** OpenAI (or chosen provider).
    - **Email:** Resend.
    - **Deployment:** Vercel.

## 2. Project Structure (Adapting Next.js Commerce + `o1-pro`)

- **Base:** Vercel/Next.js Commerce starter kit.
- **Removals:**
    - `lib/shopify/` and all direct Shopify API dependencies/calls.
    - Shopify-specific cart backend logic in `components/cart/actions.ts`.
- **Key Adaptations & Integrations:**
    - `app/layout.tsx`: Integrate **ClerkProvider**, **ThemeProvider** (`o1-pro` pattern), apply global styles.
    - `app/(marketing)/**`: Adapt routes/pages (landing, product display).
    - `app/product/[handle]/page.tsx`: **Modify** heavily. Fetch product data (Polar/Supabase/local). Add **`UrlInput` component**. Adapt layout.
    - `components/cart/**`: **Adapt** Cart context/state management for local storage (React Context/Zustand). Adapt `add-to-cart`, `delete-item-button`, `edit-item-quantity-button` to modify local state. Adapt `modal.tsx` UI. Cart actions (`actions.ts`) now modify local state.
    - `app/(auth)/dashboard/**`: **Create** new route group for custom dashboard (Clerk protected). Structure based on `o1-pro` patterns.
    - `app/(auth)/success/page.tsx`: **Create** custom post-checkout success page.
    - `app/api/webhooks/polar/route.ts`: **Create** new route for Polar webhooks.
    - `middleware.ts`: **Adapt/Create** using Clerk `authMiddleware` from `o1-pro` pattern to protect `/dashboard`.
    - `actions/`: **Create** new directory, adopt `o1-pro` structure.
        - `polar-actions.ts`: `createPolarCheckoutAction`.
        - `db/purchases-actions.ts`, `db/outputs-actions.ts`, `db/profiles-actions.ts` (Supabase CRUD, using Drizzle).
        - `pdf-actions.ts` (AI/PDF flow).
        - `storage/pdf-storage-actions.ts` (Supabase Storage).
        - `email-actions.ts` (Resend).
        - `clerk-actions.ts`: `linkClerkUserAction`.
    - `lib/`:
        - `polar/`: Add Polar SDK client setup.
        - `supabase/`: Add Supabase client setup (from `o1-pro`).
        - `clerk/`: Add Clerk setup helpers if needed.
        - `drizzle/`: Drizzle client instance (`db.ts` from `o1-pro`).
        - `ai.ts`, `pdf.ts`, `validation.ts`, `queue.ts` (optional).
        - `utils.ts`: Keep `cn`, potentially add others.
        - `hooks/`: Bring in relevant hooks from `o1-pro` (`useToast`, `useIsMobile`).
    - `db/`: **Adopt** `o1-pro` structure for schema definitions (`schema/`) and migrations (`migrations/`).
        - `schema/purchases-schema.ts` (Revised for Polar)
        - `schema/outputs-schema.ts` (Similar)
        - `schema/profiles-schema.ts` (Adapted from `o1-pro`, links Clerk ID)
        - `schema/temp-carts-schema.ts` (If metadata workaround needed)
    - `components/ui/`: **Integrate** Shadcn UI components using `o1-pro`'s `components.json`. Used for building custom elements (dashboard, forms) and styling reused ones.
    - `components/`:
        - **Reuse/Adapt/Style:** `layout/navbar`, `layout/footer`, `grid`, `price`, loading components.
        - **Create Custom:** `product/url-input.tsx`, `dashboard/**`, `success/**`, `landing/hero.tsx` (potentially based on `o1-pro`).
    - `public/`: Static assets.
    - `tailwind.config.ts`, `postcss.config.mjs`, `globals.css`: Merge Next.js Commerce setup with `o1-pro`'s Tailwind theme/plugins and Shadcn config.

## 3. Feature Specification (Revised for Hybrid)

### 3.1 Product Display & URL Input

- **User Story**: View Kit details, input my URL if required, and add to cart.
- **Implementation**:
    1. Fetch product details (tiers, prices, descriptions) from Polar API or Supabase/local config for `app/product/[handle]/page.tsx`.
    2. Display using adapted Next.js Commerce components + Shadcn.
    3. Include custom `UrlInput` component (`components/product/url-input.tsx`) conditionally based on product type. Use `react-hook-form` + Shadcn `Input` + `Form` components (pattern from `o1-pro`). Client-side validation (`lib/validation.ts`).
    4. "Add to Cart" button triggers action to update **local cart state**, storing item details + URL.
- **Error Handling**: URL validation errors prevent adding to cart. Product fetch errors display message.

### 3.2 Cart Management (Local State)

- **User Story**: View items in my cart, adjust quantities, see totals, and proceed to checkout.
- **Implementation**:
    1. Adapt `components/cart/cart-context.tsx` to use React Context or Zustand for local state management. State includes `[{ productId, quantity, price, url?, ... }]`.
    2. Modify cart UI (`components/cart/modal.tsx`) to read from local state.
    3. Adapt item manipulation buttons (`edit-item-quantity`, `delete-item`) to dispatch actions updating local state.
    4. Calculate totals (`subtotal`, maybe estimated taxes if needed later) based on local cart state.
- **Error Handling**: Handle edge cases like adding same item multiple times (increment quantity).

### 3.3 Polar Checkout Initiation

- **User Story**: Click checkout and be securely redirected to pay.
- **Implementation**:
    1. Checkout button in cart triggers `createPolarCheckoutAction` (`actions/polar-actions.ts`).
    2. Action reads current local cart state.
    3. Formats line items based on Polar's API requirements.
    4. **Crucially:** Includes `metadata` in the `polar.checkouts.create` call. Pass the URL directly if possible: `metadata: { url: item.url }`. If only per-checkout metadata allowed, implement workaround (save cart to `temp_carts` in Supabase, pass `tempCartId` in metadata).
    5. Action returns the Polar checkout URL.
    6. Client-side redirects user to the Polar checkout URL.
- **Error Handling**: Handle errors from Polar API during checkout creation (show toast message). Handle empty cart state.

### 3.4 Polar Webhook Processing

- **User Story**: After payment, the system automatically processes my order and starts generating my reports.
- **Implementation**:
    1. Polar `order.succeeded` webhook hits `app/api/webhooks/polar/route.ts`.
    2. Verify signature using `polar.webhooks.constructEvent`.
    3. Extract `order_id`, customer email, line items, metadata (URL or `tempCartId`).
    4. *(If using workaround):* Fetch full cart details/URLs from Supabase `temp_carts` using `tempCartId`. Clean up temp record.
    5. Call `createPurchaseAction` (`actions/db/purchases-actions.ts`) to save order details to Supabase `purchases` table (status 'processing'). Include extracted URL(s).
    6. For each relevant line item, trigger `generatePDFAction` (`actions/pdf-actions.ts`) with `purchaseId`, `url`, `tier`, etc. Potentially use a queue (`lib/queue.ts`) if generation is long.
    7. Return 200 OK to Polar immediately after validation/initial processing trigger.
- **Error Handling**: Verification failure returns 40x. DB/Trigger failures log errors, update purchase status to 'failed', potentially notify admin. Ensure idempotency (check if `polarOrderId` already exists in `purchases`).

### 3.5 PDF Generation & Delivery

- **User Story**: Receive my generated PDFs quickly and reliably.
- **Implementation**:
    1. `generatePDFAction` runs (potentially asynchronously via queue).
    2. Uses AI (`lib/ai.ts`) to generate raw content based on the URL and tier.
    3. Saves the raw AI output to Supabase `raw_outputs` table for debugging and potential reuse.
    4. Formats the content into a PDF (`lib/pdf.ts`).
    5. Uploads PDF to Supabase Storage (`actions/storage/pdf-storage-actions.ts`).
    6. Saves PDF metadata to Supabase `outputs` table.
    7. Updates associated Supabase `purchases` record status to 'completed'.
    8. Triggers `sendDownloadEmailAction` (`actions/email-actions.ts`) with dashboard link / direct signed URLs for downloads.
- **Error Handling**: Retries within the action for transient AI/PDF errors. Log persistent failures, update purchase status.

### 3.6 Success Page

- **User Story**: See confirmation and processing status immediately after payment.
- **Implementation**:
    1. User lands on `/success` page.
    2. Displays "Processing..." animation (`components/success/processing-spinner.tsx`).
    3. Optional: Poll Supabase `purchases` table for status update based on order ID (passed via query param from Polar redirect?).
    4. Once status is 'completed', show download links (generating signed URLs from Supabase Storage paths) or strong prompt to login/signup for Dashboard via Clerk.
- **Error Handling**: If status becomes 'failed', show error message and contact support prompt.

### 3.7 Dashboard (Clerk Auth + Supabase Data)

- **User Story**: Log in securely to access my reports, track progress, and find relevant next steps/upsells.
- **Implementation**:
    1. `/dashboard` routes protected by Clerk middleware (`middleware.ts`).
    2. Uses Clerk components (`<UserButton>`, potentially sign-in/up components on auth pages) based on `o1-pro` examples.
    3. On first login post-purchase, call `linkClerkUserAction` (`actions/clerk-actions.ts`) - likely triggered client-side after successful Clerk authentication by checking if `userId` is linked in Supabase `profiles` yet.
    4. Dashboard page fetches data via `getUserOutputsAction` (reads Supabase `outputs` linked to `purchases` linked to Clerk `userId` via `profiles`).
    5. Renders using custom components built with Shadcn UI: `OutputList`, `ProgressTracker`, `UpsellCard`.
- **Error Handling**: Handle cases where user is logged in but has no purchases.

### 3.8 Upsells (Dashboard -> Polar Checkout)

- **User Story**: Purchase additional reports or subscriptions from my dashboard.
- **Implementation**:
    1. `UpsellCard` components display products defined in Polar.
    2. "Buy Now" button calls `createPolarCheckoutAction` for the specific upsell product ID.
    3. User redirected to Polar checkout. Flow repeats from step 3.4 (webhook processes upsell order, links to existing user).

## 4. Database Schema (Supabase + Drizzle)

### 4.1 Tables

- **profiles** (Adapted from `o1-pro`):
    
    ```tsx
    export const profilesTable = pgTable("profiles", {
      clerkUserId: text("clerk_user_id").primaryKey(), // Clerk User ID
      email: text("email").notNull().unique(), // Store email for linking
      // Optional: Add name, avatar_url from Clerk?
      // Removed Stripe IDs unless needed for other reasons
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    });
    export type InsertProfile = typeof profilesTable.$inferInsert;
    export type SelectProfile = typeof profilesTable.$inferSelect;
    
    ```
    
- **purchases**:
    
    ```tsx
    export const purchasesTable = pgTable("purchases", {
      id: uuid("id").defaultRandom().primaryKey(),
      clerkUserId: text("clerk_user_id").references(() => profilesTable.clerkUserId), // Linked post-purchase/login
      polarOrderId: text("polar_order_id").notNull().unique(),
      customerEmail: text("customer_email").notNull(), // From Polar Order
      // Optional: polarCustomerId if available/useful
      tier: text("tier").notNull(), // "base", "full-stack", "upsell-competitor", etc.
      url: text("url"), // Input URL (null for upsells without URL input)
      amount: integer("amount").notNull(), // Amount in cents from Polar order
      status: text("status").default('processing').notNull(), // 'processing', 'completed', 'failed'
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
    });
    export type InsertPurchase = typeof purchasesTable.$inferInsert;
    export type SelectPurchase = typeof purchasesTable.$inferSelect;
    
    ```
    
- **outputs**: (Largely Unchanged)
    
    ```tsx
     export const outputsTable = pgTable("outputs", {
       id: uuid("id").defaultRandom().primaryKey(),
       purchaseId: uuid("purchase_id").references(() => purchasesTable.id, { onDelete: "cascade" }).notNull(),
       type: text("type").notNull(), // "blueprint", "persona", "ad-script", etc.
       filePath: text("file_path").notNull(), // Supabase Storage path
       createdAt: timestamp("created_at").defaultNow().notNull(),
       updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
     });
     export type InsertOutput = typeof outputsTable.$inferInsert;
     export type SelectOutput = typeof outputsTable.$inferSelect;
    
    ```
    
- **raw_outputs**: (New for storing unformatted AI content)
    
    ```tsx
     export const rawOutputsTable = pgTable("raw_outputs", {
       id: uuid("id").defaultRandom().primaryKey(),
       purchaseId: uuid("purchase_id").references(() => purchasesTable.id, { onDelete: "cascade" }).notNull(),
       type: text("type").notNull(), // "blueprint", "persona", "ad-script", etc.
       content: text("content").notNull(), // The raw AI-generated content
       metadata: text("metadata"), // Optional JSON metadata about the generation
       createdAt: timestamp("created_at").defaultNow().notNull(),
       updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
     });
     export type InsertRawOutput = typeof rawOutputsTable.$inferInsert;
     export type SelectRawOutput = typeof rawOutputsTable.$inferSelect;
    
    ```
    
- **temp_carts** (Optional - If Metadata Workaround Needed):
    
    ```tsx
    // export const tempCartsTable = pgTable("temp_carts", {
    //   id: uuid("id").defaultRandom().primaryKey(),
    //   cartData: jsonb("cart_data").notNull(), // Store [{ productId, quantity, url, ... }]
    //   createdAt: timestamp("created_at").defaultNow().notNull(),
    //   expiresAt: timestamp("expires_at").notNull(), // e.g., 1 hour from creation
    // });
    
    ```
    
- **Relationships**: `outputs.purchaseId` → `purchases.id`; `purchases.clerkUserId` → `profiles.clerkUserId`.

## 5. Key Actions & Logic

- **`actions/polar-actions.ts`**:
    - `createPolarCheckoutAction`: Takes cart items (from local state) + metadata (URL/tempCartId), calls Polar API, returns checkout URL.
- **`actions/db/*.ts`**:
    - `createPurchaseAction`: Saves purchase details from webhook to Supabase.
    - `updatePurchaseStatusAction`: Updates status ('completed'/'failed').
    - `createOutputAction`: Saves PDF metadata to Supabase `outputs`.
    - `createRawOutputAction`: Saves raw AI content to Supabase `raw_outputs`.
    - `getUserOutputsAction`: Fetches outputs for dashboard based on `clerkUserId`.
    - `getProfileByEmailAction`, `createOrLinkProfileAction`: Manages `profiles` table for Clerk linking.
- **`actions/pdf-actions.ts`**:
    - `generatePDFAction`: Orchestrates AI -> Raw Storage -> PDF -> Storage flow. Calls `createRawOutputAction`, `createOutputAction`, `updatePurchaseStatusAction`, `sendDownloadEmailAction`.
- **`actions/clerk-actions.ts`**:
    - `linkClerkUserAction`: Called client-side post-login to ensure Clerk user is linked in `profiles` and `purchases`.
- **`app/api/webhooks/polar/route.ts`**:
    - Handles `order.succeeded`. Verifies -> Parses -> Calls `createPurchaseAction` -> Triggers `generatePDFAction` (possibly via queue).

## 6. Design System & UI (Hybrid)

- **Foundation:** Tailwind CSS configured via `tailwind.config.ts` (merged from Next.js Commerce + `o1-pro`/Shadcn).
- **Component Library:** **Shadcn UI** integrated (using `o1-pro`'s `components.json`).
- **Usage:**
    - Reused Next.js Commerce components (Layout, Grid, etc.) styled with Tailwind/Shadcn variables.
    - Custom components (Dashboard elements, URL input, Success page elements) built using Shadcn primitives.
    - Apply custom futuristic aesthetic (glow, gradients) via Tailwind utilities.

## 7. Authentication & Authorization (Clerk for Dashboard)

- **Provider:** Clerk (`@clerk/nextjs`).
- **Scope:** Protects `/dashboard` routes ONLY. Main purchase flow can be guest.
- **Linking:** Email address from Polar order is the key to link a `purchase` record to a `profile` record (which holds the `clerkUserId`) upon first dashboard login/signup. `linkClerkUserAction` handles this logic.
- **UI:** Use Clerk components (`<UserButton>`, `<SignIn>`, `<SignUp>`) within the `/dashboard` layout and potentially `/login`, `/signup` routes structured like `o1-pro`.

## 8. Data Flow Diagram (Hybrid Polar Flow)

[Polar `order.succeeded` Webhook] -> [Webhook Handler (Verify, Parse, Get TempCart?)] -> [Supabase (Save Purchase)] -> [Trigger PDF Gen (AI -> PDF -> Storage)] -> [Supabase (Save Output, Update Status)] -> [Resend Email]
                                                                                                                                    |
                                                                                                                                    | (User Clicks Link/Login)
                                                                                                                                    V
[User -> /dashboard (Clerk Auth)] --(First Login?)--> [linkClerkUserAction] --> [Fetch Outputs from Supabase (via linked userId)] --> [Display Data/Upsells]
                                                                                                                                          | (Upsell Click)
                                                                                                                                          V
                                                                                                                            [createPolarCheckoutAction (Upsell)] -> ...

## 9. [Polar.sh](http://polar.sh/) Integration Details

- **Products:** Define Base Kit, Full Stack, Upsells (Competitor Matrix, Threat Scanner, Monthly Subscription) in Polar Dashboard. Get Product IDs.
- **Checkout API:** Use `polar.checkouts.create`, passing `line_items` (product ID, quantity) and `metadata` (containing URL or tempCartId). Configure `success_url` to point to `/success?polar_order_id={CHECKOUT_SESSION_ID}` (or similar identifier).
- **Metadata Handling:** Confirm if Polar supports per-line-item metadata. If not, implement the Supabase `temp_carts` workaround.
- **Webhooks:** Configure `order.succeeded` endpoint in Polar dashboard. Implement secure signature verification in the handler.
- **SDK:** Use `@polar.sh/sdk` (or their recommended JS/TS SDK).

## 10. Key Changes Summary

- Using Next.js Commerce starter as the base for UI/Cart structure.
- Replacing Shopify backend entirely with [Polar.sh](http://polar.sh/)'s backend simplicity/MoR.
- Integrating Supabase (DB/Storage), Clerk (Dashboard Auth), Shadcn UI, and action patterns from `o1-pro`.
- Adapting cart state management to work locally within the Next.js app.
- Implementing custom logic for URL input capture and passing it via Polar metadata.
- Triggering AI/PDF generation via Polar webhooks.
- Building a custom, Clerk-authenticated dashboard separate from the main purchase flow.

# Final Notes

This specification details the hybrid approach, aiming to combine the strengths of the Next.js Commerce frontend, [Polar.sh](http://polar.sh/)'s backend simplicity/MoR benefits, and `o1-pro`'s robust patterns for custom logic, DB, and auth. The core challenges lie in adapting the cart state and ensuring seamless data flow between the local state, Polar checkout, webhooks, Supabase, and Clerk.