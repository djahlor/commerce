# Implenetation Plan

### Phase 1: Setup

- [x]  **Step 1: Initialize Next.js Commerce & Core Dependencies**
    - **Task**: Clone the Vercel Next.js Commerce starter kit. Install *all* required additional dependencies: Polar SDK (`@polar.sh/sdk` or similar), Supabase (`@supabase/supabase-js`), Clerk (`@clerk/nextjs`), Drizzle (`drizzle-orm`, `postgres`, `drizzle-kit`), OpenAI (`openai`), Resend (`resend`), PDF library (`pdfkit`), state management (`zustand` or `jotai` - choose one for cart), `react-hook-form`, `zod`, **Firecrawl** (`@mendable/firecrawl-js`), **Vercel AI SDK** (`ai`).
    - **Files**: `package.json`
    - **User Instructions**: Follow Next.js Commerce basic setup. Run `npm install ...` or `pnpm add ...` for all listed dependencies. Ensure Node/npm versions are compatible.
    - **Mitigation**: Verify dependency versions for compatibility.
- [x]  **Step 2: Configure Environment Variables**
    - **Task**: Create `.env.local` based on Next.js Commerce `.env.example` AND add keys needed for Polar (API Key), Supabase (URL, Anon Key, Service Role Key), Clerk (Publishable Key, Secret Key), OpenAI (API Key), Resend (API Key), **Firecrawl (API Key)**. Document all keys in `.env.example`.
    - **Files**: `.env.local`, `.env.example`
    - **Step Dependencies**: Step 1
- [x]  **Step 3: Integrate `o1-pro` Supabase/Drizzle Setup**
    - **Task**: Copy the `db/` folder (containing `db.ts`, `schema/`) and `drizzle.config.ts` from `o1-pro` into the project. Adapt `db.ts` connection string if needed. Define initial schemas (`profiles`, `purchases`, `outputs`, `raw_outputs`) based on Tech Spec v2. Run initial Drizzle migration.
    - **Files**: `db/db.ts`, `db/schema/index.ts`, `db/schema/profiles-schema.ts`, `db/schema/purchases-schema.ts`, `db/schema/outputs-schema.ts`, `db/schema/raw-outputs-schema.ts`, `drizzle.config.ts`
    - **User Instructions**: Ensure Supabase project is created. Run `npx drizzle-kit generate` then `npx drizzle-kit migrate` (or `push`).
    - **Step Dependencies**: Steps 1, 2
    - **Mitigation**: Ensure Drizzle setup doesn't conflict with any existing Next.js Commerce DB assumptions (it likely won't, as Shopify was the DB).
- [x]  **Step 4: Integrate `o1-pro` Server Actions Structure**
    - **Task**: Create the `actions/` directory. Copy the `ActionState` type definition from `o1-pro` (`types/server-action-types.ts`) into a suitable location (e.g., `lib/types.ts`). Establish subdirectories like `actions/db/`, `actions/polar/`, etc.
    - **Files**: `actions/` (directory), `lib/types.ts` (or similar)
    - **Step Dependencies**: Step 1
- [x]  **Step 5: Integrate Shadcn UI & `o1-pro` Styling Foundation**
    - **Task**: Run `pnpm dlx shadcn@latest init` in the project root. Configure `components.json` similarly to `o1-pro` (aliases for `components`, `lib`, `hooks`). Manually merge Tailwind theme settings (`colors`, `borderRadius`, `keyframes`/`animation` for Shadcn) from `o1-pro`'s `tailwind.config.ts` into the Next.js Commerce `tailwind.config.ts`. Merge relevant base styles/variables from `o1-pro`'s `globals.css` into the project's `globals.css`. Install core Shadcn components needed early (`button`, `input`, `form`, `label`, `toast`, `card`).
    - **Files**: `components.json`, `tailwind.config.ts` (merge), `app/globals.css` (merge), `postcss.config.mjs` (ensure required plugins listed).
    - **User Instructions**: Carefully merge Tailwind configs and global CSS to avoid breaking Next.js Commerce styles while adding Shadcn support. Run `npx shadcn-ui@latest add button input form label toast card`.
    - **Step Dependencies**: Step 1
    - **Mitigation**: Test basic UI rendering after merge to ensure styles apply correctly. Conflicts in Tailwind config are likely.
- [x]  **Step 6: Integrate `o1-pro` Utilities & Hooks**
    - **Task**: Copy useful hooks (`useToast`, `useIsMobile`, `useCopyToClipboard`) and utilities (`cn`, potentially `ThemeSwitcher`, `TailwindIndicator`) from `o1-pro`'s `lib/hooks/`, `lib/utils.ts`, `components/utilities/` into the project's `lib/` and `components/` structure. Adapt imports as needed.
    - **Files**: `lib/utils.ts` (merge `cn`), `lib/hooks/`, `components/utilities/`
    - **Step Dependencies**: Step 1, 5
- [x]  **Step 7: Integrate Clerk Provider & Basic Setup**
    - **Task**: Wrap the root layout (`app/layout.tsx`) with `<ClerkProvider>`. Add necessary Clerk env vars to `.env.local`. Configure basic Clerk appearance if desired (e.g., dark theme support using `next-themes` from `o1-pro` utilities).
    - **Files**: `app/layout.tsx`, `.env.local`
    - **Step Dependencies**: Steps 1, 2
- [x]  **Step 8: Initial Code Cleanup (Shopify Removal - Phase 1)**
    - **Task**: Delete the `lib/shopify/` directory. Search the codebase for imports from `lib/shopify` and remove/comment out the code sections that directly use them (expect errors). Remove Shopify-specific env vars from `.env.example`. This is just the initial rip-out; fixing errors comes later.
    - **Files**: `lib/shopify/` (delete), Various files using Shopify imports. `.env.example`.
    - **Step Dependencies**: Step 1
    - **Mitigation**: This will break parts of the app (product fetching, cart logic). That's expected at this stage. Focus on removing the dependency first.

---

### Phase 2: Database Implementation & Backend Actions (Steps 9-13)

*Goal: Set up data persistence and core backend logic structures.*

- [x]  **Step 9: Finalize Database Schemas & Migrations**
    - **Task**: Review and finalize all required Drizzle schemas (`profiles`, `purchases`, `outputs`, `raw_outputs`, `temp_carts` if using workaround) based on Tech @2-spec.md. Run migrations to sync the database.
    - **Files**: `db/schema/*.ts`, `drizzle.config.ts`
    - **User Instructions**: Run `npx drizzle-kit generate` then `npx drizzle-kit migrate`. Verify schema in Supabase UI.
    - **Step Dependencies**: Step 3
- [x]  **Step 9.1: Define Scraped Data Schema**
    - **Task**: Create the `scraped_data` schema in Drizzle to store data extracted from customer websites. Include fields for storing URL, scraped content (jsonb), content type, status, and error messages.
    - **Files**: `db/schema/scraped-data-schema.ts`, `db/schema/index.ts`
    - **User Instructions**: Follow the schema design from the Tech Spec (v2.1). Run `npx drizzle-kit generate` then `npx drizzle-kit migrate` after creating the schema.
    - **Step Dependencies**: Steps 3, 9
- [x]  **Step 10: Implement DB Actions for Purchases & Outputs**
    - **Task**: Create server actions (`actions/db/purchases-actions.ts`, `actions/db/outputs-actions.ts`) for CRUD operations on `purchases` and `outputs` tables using Drizzle and the `ActionState` pattern. Include functions like `createPurchaseAction`, `updatePurchaseStatusAction` (with extended status values for scraping), `createOutputAction`, `getUserOutputsAction`.
    - **Files**: `actions/db/purchases-actions.ts`, `actions/db/outputs-actions.ts`, `lib/types.ts`
    - **Step Dependencies**: Steps 4, 9
- [x]  **Step 10.1: Implement DB Actions for Scraped Data**
    - **Task**: Create server actions (`actions/db/scraped-data-actions.ts`) for managing the `scraped_data` table. Include functions like `createScrapedDataAction`, `getScrapedDataByPurchaseId`, `updateScrapedDataStatusAction`.
    - **Files**: `actions/db/scraped-data-actions.ts`
    - **Step Dependencies**: Steps 4, 9.1
- [x]  **Step 11: Implement DB Actions for Profiles**
    - **Task**: Adapt/create server actions (`actions/db/profiles-actions.ts`) for managing the `profiles` table (linking `clerkUserId` to `email`, creating profile on first login). Use `o1-pro` actions as a reference.
    - **Files**: `actions/db/profiles-actions.ts`
    - **Step Dependencies**: Steps 4, 9
- [x]  **Step 12: Implement Firecrawl Integration**
    - **Task**: Set up Firecrawl client (`lib/firecrawl.ts`). Create server actions (`actions/scrape-actions.ts`) for scraping websites using Firecrawl. Implement `triggerScrapeAction` that accepts URL and purchaseId, extracts website data, and saves it to the `scraped_data` table.
    - **Files**: `lib/firecrawl.ts`, `actions/scrape-actions.ts`
    - **User Instructions**: Ensure Firecrawl API key is properly set in environment variables. Test with various e-commerce website types.
    - **Step Dependencies**: Steps 1, 2, 10.1
    - **Mitigation**: Implement robust error handling and retry logic. Consider async processing for longer scrapes.
- [x]  **Step 13.1: Set up Vercel AI SDK Client**
    - **Task**: Create `lib/ai.ts` to initialize and configure the Vercel AI SDK client with OpenAI. Configure with API key, set up common parameters (temperature, max tokens), and create helper functions for text generation and analysis.
    - **Files**: `lib/ai.ts`
    - **Step Dependencies**: Steps 1, 2
- [x]  **Step 13.2: Implement PDF Library Setup**
    - **Task**: Set up PDFKit helpers in `lib/pdf.ts`. Create wrapper functions for common PDF operations (document initialization, text formatting, adding images, page management) and specialized functions for different report types.
    - **Files**: `lib/pdf.ts`
    - **Step Dependencies**: Step 1
    - **Note**: ✅ Implemented using `@react-pdf/pdfkit` instead of standard `pdfkit` to solve font bundling issues in serverless environments. This approach ensures proper font loading without filesystem access limitations. Created a robust solution with createPDFDocument for initialization, and specialized functions for Brand Blueprint, Technical Audit, SEO Analysis, Marketing Strategy, Customer Persona, and Content Strategy reports.
- [x]  **Step 13.3: Implement Supabase Storage Actions**
    - **Task**: Create upload helper functions for Supabase Storage in `actions/storage/pdf-storage-actions.ts`. Implement `uploadPdfStorage` action and functions to generate signed URLs for secure downloads.
    - **Files**: `actions/storage/pdf-storage-actions.ts`
    - **Step Dependencies**: Steps 2, 3
- [x]  **Step 13.4: Create Basic PDF Generation Action**
    - **Task**: Implement core structure of `generatePDFAction` with proper parameters (purchaseId, url, tier), basic flow, error handling, and database connections.
    - **Files**: `actions/pdf-actions.ts`
    - **Step Dependencies**: Steps 10, 13.1, 13.2, 13.3
- [x]  **Step 13.5: Implement Full AI-to-PDF Pipeline**
    - **Task**: Complete the full generation pipeline in `generatePDFAction`. Integrate scraped data loading, AI analysis, PDF generation, storage saving, and database updates. Implement basic retry logic for transient errors.
    - **Files**: `actions/pdf-actions.ts` (update)
    - **Step Dependencies**: Steps 12, 13.4
    - **Mitigation**: Test with sample scraped data to ensure consistent AI outputs.
- [x]  **Step 14: Implement Email Action**
    - **Task**: Set up Resend client/helpers (`lib/resend.ts` or similar). Create `sendDownloadEmailAction` (`actions/email-actions.ts`) to send confirmation/link emails.
    - **Files**: `lib/resend.ts`, `actions/email-actions.ts`
    - **Step Dependencies**: Steps 1, 2

---

### Phase 3: Polar Integration (Steps 15-18)

*Goal: Integrate the payment and order processing backend.*

- [x]  **Step 15: Setup Polar SDK & Products**
    - **Task**: Initialize Polar SDK client (`lib/polar/index.ts`).
    - **Files**: `lib/polar/index.ts`
    - **User Instructions**: Define your products (Base Kit, Full Stack, Upsells) in the Polar Dashboard. Note down the Product IDs.
    - **Step Dependencies**: Steps 1, 2
- [x]  **Step 16: Implement Polar Checkout Action**
    - **Task**: Create `createPolarCheckoutAction` (`actions/polar/polar-actions.ts`). This action takes formatted cart data (including item details and URL metadata), calls `polar.checkouts.create`, handles potential metadata workaround (saving to `temp_carts` via DB action), and returns the checkout URL.
    - **Files**: `actions/polar/polar-actions.ts`, `actions/db/purchases-actions.ts` (add temp cart actions if needed)
    - **Step Dependencies**: Steps 10, 15
    - **Mitigation**: Thoroughly test metadata passing. If workaround is needed, ensure `temp_carts` cleanup logic exists.
- [x]  **Step 17: Implement Polar Webhook Handler**
    - **Task**: Create the API route `app/api/webhooks/polar/route.ts`. Implement signature verification using Polar SDK. Parse the `order.succeeded` event payload. Extract relevant data (order ID, email, items, metadata/tempCartId).
    - **Files**: `app/api/webhooks/polar/route.ts`, `lib/polar/index.ts` (add webhook helpers if needed)
    - **User Instructions**: Configure the webhook endpoint URL in the Polar Dashboard.
    - **Step Dependencies**: Steps 2, 15
    - **Mitigation**: Test signature verification thoroughly. Log incoming payloads during development.
- [x]  **Step 18: Connect Webhook to Scraping Logic**
    - **Task**: Update the webhook handler to: retrieve full cart details if using workaround, call `createPurchaseAction` to save to Supabase `purchases` (with status 'pending_scrape'), then trigger `triggerScrapeAction` for the customer's URL. Ensure immediate 200 response to Polar after verification/trigger. Implement idempotency check.
    - **Files**: `app/api/webhooks/polar/route.ts` (update), `actions/db/purchases-actions.ts` (call), `actions/scrape-actions.ts` (trigger)
    - **Step Dependencies**: Steps 10, 12, 17
    - **Mitigation**: Consider using a queue system (Vercel KV/Queues or Supabase pg_net) for long-running scraping operations.

---

### Phase 4: Frontend - Cart Adaptation & Checkout Flow (Steps 19-22)

*Goal: Make the Next.js Commerce cart work with local state and Polar.*

- [x]  **Step 19: Implement Local Cart State Management**
    - **Task**: Choose and implement a local state solution (e.g., Zustand store or React Context Provider in `app/layout.tsx` or a dedicated provider). Define the cart state structure (array of items with `productId`, `quantity`, `price`, `url`, etc.). Initialize state potentially from `localStorage` for persistence.
    - **Files**: `lib/store/cart-store.ts` (or similar context file), `app/layout.tsx` (add provider)
    - **Step Dependencies**: Step 1
- [x]  **Step 20: Adapt Cart UI Components**
    - **Task**: Modify `components/cart/modal.tsx` and any related components (item display) to read data from the local cart state hook/context instead of the old Shopify context. Ensure totals are calculated correctly based on local state.
    - **Files**: `components/cart/modal.tsx`, `components/cart/delete-item-button.tsx`, `components/cart/edit-item-quantity-button.tsx`
    - **Step Dependencies**: Step 19
    - **Mitigation**: This requires careful refactoring of data sources within the components. Test UI updates thoroughly.
- [x]  **Step 21: Adapt Cart Actions**
    - **Task**: Refactor the logic inside `components/cart/add-to-cart.tsx` (and potentially separate action functions if preferred) to dispatch updates to the *local* cart state (add item, update quantity, remove item). Remove backend calls previously made to Shopify cart API.
    - **Files**: `components/cart/add-to-cart.tsx`, `lib/store/cart-store.ts` (add actions/reducers)
    - **Step Dependencies**: Step 19, 20
- [ ]  **Step 22: Connect Cart to Polar Checkout Action**
    - **Task**: Modify the "Checkout" button logic (likely within `components/cart/modal.tsx` or related checkout component). On click, it should read the current local cart state, call the `createPolarCheckoutAction` server action, and then perform a client-side redirect (`window.location.href = checkoutUrl`) using the URL returned by the action.
    - **Files**: `components/cart/modal.tsx` (or checkout button component), `actions/polar/polar-actions.ts` (call)
    - **Step Dependencies**: Steps 16, 19

---

### Phase 5: Frontend - Custom Pages & Features (Steps 23-29)

*Goal: Build the unique pages and features of the application.*

- [ ]  **Step 23: Implement URL Input on Product Page**
    - **Task**: Create the `UrlInput` component (`components/product/url-input.tsx`) using Shadcn `Form`, `Input`, `Label` and `react-hook-form`. Integrate this component into the adapted `app/product/[handle]/page.tsx`. Ensure the entered URL is captured and passed correctly when adding the item to the local cart state (Step 21).
    - **Files**: `components/product/url-input.tsx`, `app/product/[handle]/page.tsx` (integrate), `components/cart/add-to-cart.tsx` (adapt to receive URL)
    - **Step Dependencies**: Steps 5, 21
- [ ]  **Step 24: Build Custom Success Page**
    - **Task**: Create `app/(auth)/success/page.tsx`. Implement the initial "Processing..." state with animation (`components/success/processing-spinner.tsx`). Add logic to check purchase status (e.g., poll Supabase based on order ID from query param) showing status updates for scraping and generation progress. Display download links (using signed URLs from Supabase storage via server action) or the dashboard prompt upon completion.
    - **Files**: `app/(auth)/success/page.tsx`, `components/success/processing-spinner.tsx`, `components/success/download-link.tsx` (fetches signed URL), `actions/storage/pdf-storage-actions.ts` (add signed URL generation).
    - **Step Dependencies**: Steps 13, 18
- [ ]  **Step 25: Build Dashboard Structure & Layout**
    - **Task**: Create the route group `app/(auth)/dashboard/`. Create `layout.tsx` applying specific dashboard styling/navigation (potentially a sidebar like `o1-pro`'s `components/ui/sidebar.tsx` adapted). Create the main `page.tsx`.
    - **Files**: `app/(auth)/dashboard/layout.tsx`, `app/(auth)/dashboard/page.tsx`, `components/dashboard/sidebar.tsx` (optional)
    - **Step Dependencies**: Steps 5, 7
- [ ]  **Step 26: Implement Dashboard Data Fetching & Display**
    - **Task**: In `app/(auth)/dashboard/page.tsx`, fetch the authenticated user's data (using Clerk `auth()`) and call `getUserOutputsAction` to get their purchased reports from Supabase. Create and use an `OutputList` component (e.g., using Shadcn `Table`) to display the outputs with download links (generating signed URLs).
    - **Files**: `app/(auth)/dashboard/page.tsx` (update), `actions/db/outputs-actions.ts` (call), `components/dashboard/output-list.tsx`
    - **Step Dependencies**: Steps 10, 24 (signed URLs), 25
- [ ]  **Step 27: Implement Dashboard Progress Tracker**
    - **Task**: Create the `ProgressTracker` UI component (`components/dashboard/progress-tracker.tsx` using Shadcn `Progress`). Add logic in the dashboard page to calculate progress based on the fetched outputs (e.g., % of core kit reports generated/available).
    - **Files**: `components/dashboard/progress-tracker.tsx`, `app/(auth)/dashboard/page.tsx` (integrate logic)
    - **Step Dependencies**: Steps 5, 26
- [ ]  **Step 28: Implement Dashboard Upsell Display & Purchase**
    - **Task**: Create `UpsellCard` component (`components/dashboard/upsell-card.tsx` using Shadcn `Card`). Fetch upsell product info (Polar/Supabase/local config). Display cards in the dashboard. Implement "Buy Now" button to call `createPolarCheckoutAction` for the specific upsell Product ID.
    - **Files**: `components/dashboard/upsell-card.tsx`, `app/(auth)/dashboard/page.tsx` (integrate), `actions/polar/polar-actions.ts` (call)
    - **Step Dependencies**: Steps 5, 16, 26
- [ ]  **Step 29: Customize Marketing Pages & Content**
    - **Task**: Adapt the structure of Next.js Commerce marketing pages (`app/(marketing)/*`) or replace with `o1-pro` landing components. Populate with actual product copy, features, benefits, pricing details, and apply final styling. Integrate `ThemeSwitcher`.
    - **Files**: `app/(marketing)/**`, `components/landing/*` (adapt/create), `components/utilities/theme-switcher.tsx` (integrate)
    - **User Instructions**: This is a major step for the user (you!) to focus on content and visual presentation. Finalize all marketing copy, ensure value proposition is clear. Refine UI look and feel based on PRD aesthetic (futuristic, glow, gradients).
    - **Step Dependencies**: Step 5, 6

---

### Phase 6: Authentication & Authorization (Steps 30-32)

*Goal: Secure the dashboard and link user accounts.*

- [ ]  **Step 30: Configure Clerk Authentication Routes & Middleware**
    - **Task**: Create Clerk sign-in/sign-up pages (`app/(auth)/login/[[...login]]/page.tsx`, `app/(auth)/signup/[[...signup]]/page.tsx`) similar to `o1-pro`. Implement Clerk middleware (`middleware.ts`) correctly protecting `/dashboard/**` and handling redirects.
    - **Files**: `app/(auth)/login/[[...login]]/page.tsx`, `app/(auth)/signup/[[...signup]]/page.tsx`, `middleware.ts`
    - **Step Dependencies**: Step 7
- [ ]  **Step 31: Implement Clerk User Linking Logic**
    - **Task**: Create `linkClerkUserAction` (`actions/clerk-actions.ts`). Determine trigger: either webhook handler saves email and linking happens on first dashboard visit, OR trigger action client-side post-login if profile isn't fully linked. Action should find purchase by email, find/create profile, and update `purchases.clerkUserId` and potentially `profiles` table.
    - **Files**: `actions/clerk-actions.ts`, `actions/db/profiles-actions.ts` (call), `app/(auth)/dashboard/layout.tsx` (potential client-side trigger) or `app/api/webhooks/polar/route.ts` (if linking triggered server-side).
    - **Step Dependencies**: Steps 11, 18, 30
    - **Mitigation**: Decide on the linking trigger point carefully based on desired UX and security.
- [ ]  **Step 32: Add User Button & Auth State Handling**
    - **Task**: Integrate Clerk's `<UserButton />` into the main header/navbar (adapted from Next.js Commerce or `o1-pro`). Ensure UI correctly reflects signed-in/signed-out states using `<SignedIn>`/`<SignedOut>`.
    - **Files**: `components/layout/navbar.tsx` (or equivalent header component)
    - **Step Dependencies**: Step 30

---

### Phase 7: Error Handling, Edge Cases & Validation (Steps 33-37)

*Goal: Make the application robust.*

- [ ]  **Step 33: Implement Robust URL Validation**
    - **Task**: Enhance URL validation (`lib/validation.ts`) to check for valid e-commerce site patterns if possible (beyond just URL format). Implement checks both client-side (in `UrlInput`) and server-side (potentially in webhook handler before triggering scraping).
    - **Files**: `lib/validation.ts`, `components/product/url-input.tsx`, `app/api/webhooks/polar/route.ts`
    - **Step Dependencies**: Steps 23, 18
- [ ]  **Step 34: Implement Scraping Error Handling & Retries**
    - **Task**: Add retry logic (e.g., 1-2 retries with exponential backoff) within `triggerScrapeAction` for transient Firecrawl errors. Add validation for the scraped data before passing to AI processing. On persistent failure, update `purchases.status` to 'scrape_failed' and potentially trigger a notification.
    - **Files**: `actions/scrape-actions.ts`, `lib/validation.ts` (add scraped data validation)
    - **Step Dependencies**: Step 12
    - **Mitigation**: Implement detailed logging to identify problematic sites or patterns.
- [ ]  **Step 35: Implement AI/PDF Retry & Failure Handling**
    - **Task**: Add retry logic (e.g., 1-2 retries with exponential backoff) within `generatePDFAction` for transient errors from OpenAI/Vercel AI SDK or PDF library. On persistent failure, update `purchases.status` to 'generation_failed' and potentially trigger a notification (email admin/user).
    - **Files**: `actions/pdf-actions.ts`
    - **Step Dependencies**: Step 13
- [ ]  **Step 36: Enhance Webhook Handler Robustness**
    - **Task**: Ensure webhook handler explicitly checks if `polarOrderId` already exists in `purchases` to prevent duplicate processing (idempotency). Add detailed logging for errors during parsing, DB writes, or scraping trigger. Consider using a queue (`lib/queue.ts` with Supabase pg_net or Vercel KV/Queues) for decoupling scraping if load/latency is a concern.
    - **Files**: `app/api/webhooks/polar/route.ts`, `lib/queue.ts` (optional), `lib/logger.ts` (optional setup)
    - **Step Dependencies**: Step 18
- [ ]  **Step 37: Handle Polar API Errors**
    - **Task**: Add `try...catch` blocks around Polar API calls (`createPolarCheckoutAction`) and provide user-friendly feedback (e.g., using `sonner` toast notifications integrated via `useToast` hook from `o1-pro`).
    - **Files**: `actions/polar/polar-actions.ts`, `lib/hooks/use-toast.ts`, `components/ui/sonner.tsx`
    - **Step Dependencies**: Steps 6, 16, 22

---

### Phase 8: Testing (Steps 38-41)

*Goal: Ensure application quality and reliability.*

- [ ]  **Step 38: Write Unit & Integration Tests**
    - **Task**: Write tests for critical server actions (DB actions, Polar checkout action mock, scraping action mock, AI generation mock), utility functions (validation), and webhook handler logic (mocking Polar event). Use Vitest/Jest.
    - **Files**: `.test.ts` files alongside corresponding action/lib files. `tests/integration/` directory.
    - **Step Dependencies**: Parallel with development of corresponding features.
- [ ]  **Step 39: Implement E2E Tests**
    - **Task**: Set up Playwright or Cypress. Write E2E tests covering the main user flows:
        1. Add Kit (with URL) to cart -> Initiate Polar Checkout (mock success) -> Verify Success Page -> Login -> Verify Dashboard shows output.
        2. Attempt checkout with invalid URL.
        3. Purchase upsell from dashboard -> Initiate Polar Checkout.
        4. Verify PDF content reflects data scraped from a test website.
    - **Files**: `tests/e2e/*.spec.ts`
    - **Step Dependencies**: Most features complete (esp. Phases 4, 5, 6, 7).
- [ ]  **Step 40: Perform Manual QA & Cross-Browser Testing**
    - **Task**: Manually test all user flows on major browsers (Chrome, Firefox, Safari) and different screen sizes (desktop, tablet, mobile). Check for UI glitches, broken links, logical errors. Test with various e-commerce websites to verify scraping reliability.
    - **User Instructions**: Thoroughly test the application as a real user would. Focus on testing different types of e-commerce websites.
    - **Step Dependencies**: Step 39
- [ ]  **Step 41: Stress Test Critical Paths (Optional but Recommended)**
    - **Task**: Simulate high load on the Polar webhook endpoint, scraping process, and the AI/PDF generation pipeline to identify bottlenecks or scaling issues. Use tools like k6 or [artillery.io](http://artillery.io/).
    - **Files**: `tests/stress/*.test.js` (or similar)
    - **Step Dependencies**: Steps 34, 35, 36

---

### Phase 9: Finalization & Deployment (Steps 42-46)

*Goal: Polish, deploy, and prepare for launch.*

- [ ]  **Step 42: UI Polish & Animations**
    - **Task**: Add subtle animations using Framer Motion (as used in `o1-pro`) to key UI elements (page transitions, button interactions, modal popups) for a premium feel. Final review of all styling, spacing, and typography.
    - **Files**: Various component files (`.tsx`), `app/layout.tsx` (page transition wrapper?)
    - **Step Dependencies**: Step 29
- [ ]  **Step 43: Final Copywriting & Content Review**
    - **Task**: Proofread all UI text, product descriptions, email templates, error messages. Ensure clarity, consistency, and brand voice.
    - **User Instructions**: Final check on all user-facing text. Apply the refined copy developed in parallel.
    - **Step Dependencies**: Step 29
- [ ]  **Step 44: Deploy to Vercel Production**
    - **Task**: Configure Vercel project settings (connect Git repo). Deploy the `main` branch. Set up production environment variables in Vercel UI for all required services (Polar, Supabase, Clerk, OpenAI, Resend, **Firecrawl**).
    - **Files**: Vercel Dashboard.
    - **Step Dependencies**: All previous steps.
- [ ]  **Step 45: Configure Production Webhooks & Redirects**
    - **Task**: Update the Polar webhook endpoint URL to point to the Vercel production deployment URL (`https://your-domain.com/api/webhooks/polar`). Update the Polar checkout `success_url` to the production success page URL.
    - **User Instructions**: Update settings in the Polar Dashboard.
    - **Step Dependencies**: Step 44
- [ ]  **Step 46: Setup Monitoring & Logging**
    - **Task**: Ensure Vercel's built-in logging and analytics are active. Consider integrating a dedicated error tracking service (Sentry, Logtail) for production issues. Monitor webhook success rates, **scraping success rates**, and AI generation metrics via Polar/Vercel logs.
    - **Files**: `lib/logger.ts` (optional integration), Vercel Monitoring/Logs UI.
    - **Step Dependencies**: Step 44

---

### Phase 10: Post-Launch (Steps 47-48)

*Goal: Gather feedback and iterate.*

- [ ]  **Step 47: Gather Beta User Feedback**
    - **Task**: Invite a small group of target users (10-20) to test the live application. Collect structured feedback on usability, value, bugs, and overall experience. Pay special attention to the quality of AI outputs based on scraped data from different website types.
    - **User Instructions**: Actively solicit and analyze feedback from beta users.
    - **Step Dependencies**: Step 46
- [ ]  **Step 48: Iterate Based on Feedback**
    - **Task**: Prioritize and implement fixes and improvements based on beta feedback before a wider public launch. Focus on improving scraping reliability and AI output quality if issues are reported.
    - **Files**: TBD based on feedback.
    - **Step Dependencies**: Step 47