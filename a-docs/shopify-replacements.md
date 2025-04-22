# Shopify Replacement Notes

## Overview
This document outlines the Shopify functionality that was removed and will need to be replaced with local state management, Polar.sh integration, and Supabase/Drizzle for data storage.

## Cart Functionality
- **Creating carts**: Previously used `createCart()` from `lib/shopify` - will be replaced with local state management
- **Adding items**: Previously used `addToCart()` - will be replaced with local state updates
- **Removing items**: Previously used `removeFromCart()` - will be replaced with local state updates
- **Updating quantities**: Previously used `updateCart()` - will be replaced with local state updates
- **Cart retrieval**: Previously used `getCart()` - will be replaced with local state retrieval
- **Checkout redirection**: Previously redirected to Shopify checkout - will be replaced with Polar checkout

## Product Data
- **Product details**: Previously fetched with `getProduct()` - will be replaced with Polar/Supabase/local config
- **Product listings**: Previously fetched with `getProducts()` - will be replaced with Polar/Supabase/local config
- **Product recommendations**: Previously used `getProductRecommendations()` - will be implemented with custom logic if needed

## Collections & Navigation
- **Collection data**: Previously used `getCollection()` and `getCollections()` - will be replaced with custom implementation if needed
- **Menu structure**: Previously used `getMenu()` - will be replaced with static/local config

## Key Files Requiring Modifications
1. **Cart Actions**: `components/cart/actions.ts` - All server actions for cart management
2. **Cart Context**: `components/cart/cart-context.tsx` - Client-side cart state management
3. **Add to Cart**: `components/cart/add-to-cart.tsx` - Add to cart button functionality
4. **Cart Item Management**: `components/cart/delete-item-button.tsx` and `components/cart/edit-item-quantity-button.tsx`
5. **Product Page**: `app/product/[handle]/page.tsx` - Product detail page, needs URL input field
6. **Layout/Navigation**: `app/layout.tsx` - Cart initialization
7. **Search Pages**: `app/search/page.tsx` and `app/search/[collection]/page.tsx` - Product listings

## Data Types to Replace
Key types defined in `lib/shopify/types.ts` that will need custom implementations:
- `Cart`, `CartItem` - Local cart state structure
- `Product`, `ProductVariant` - Product data structure
- `Collection` - Collection data structure (if needed)
- `Menu` - Navigation menu structure

## Implementation Strategy
According to the project plan:
1. First, simply remove/comment out Shopify code (Step 8)
2. Implement local cart state with React Context or Zustand (Step 18)
3. Adapt cart UI components to use local state (Step 19)
4. Implement cart actions for local state (Step 20)
5. Connect cart to Polar checkout (Step 21)
6. Add URL input field to product page (Step 22) 