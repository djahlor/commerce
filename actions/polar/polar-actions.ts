'use server';

import { createTempCartAction } from '@/actions/db/temp-carts-actions';
import { polar } from '@/lib/polar';
import { ActionState } from '@/lib/types';
import { generateTempCartId } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

/**
 * Interface for cart items to be passed to the checkout action
 */
interface CartItem {
  productId: string; // Product ID from our local/Polar catalog
  quantity: number;
  price?: number; // Optional price for variable pricing
  url?: string; // Website URL for analysis (if applicable)
}

/**
 * Interface for cart data to be passed to the checkout action
 */
interface CartData {
  items: CartItem[];
  customerEmail?: string; // Optional customer email if known
}

/**
 * Creates a checkout session in Polar and returns the checkout URL
 * Uses temp cart workaround to ensure URL metadata is preserved
 * 
 * @param cartData Cart data with items and optional customer email
 * @returns ActionState with checkout URL in data if successful
 */
export async function createPolarCheckoutAction(
  cartData: CartData
): Promise<ActionState<{ checkoutUrl: string }>> {
  try {
    if (!cartData.items || cartData.items.length === 0) {
      return {
        isSuccess: false,
        message: 'Cart is empty',
      };
    }

    // Generate a unique ID for this cart
    const tempCartId = generateTempCartId();
    
    // Get URL from first item if present (this is the primary website URL for analysis)
    const url = cartData.items[0]?.url || '';
    
    // Store cart data in temp_carts table for persistence
    if (url) {
      const tempCartResult = await createTempCartAction(
        tempCartId,
        url,
        JSON.stringify({ items: cartData.items })
      );
      
      if (!tempCartResult.isSuccess) {
        console.error('Failed to create temp cart:', tempCartResult.message);
        // Continue with checkout, but log the error
      }
    }

    // Get product IDs from cart items
    const productIds = cartData.items.map(item => item.productId);

    // Prepare metadata for the checkout
    // Instead of directly storing the URL, we store the temp cart ID
    // which can be used to retrieve the URL and other metadata later
    const metadata: Record<string, string> = {
      tempCartId // Pass the temp cart ID which can be used to retrieve URL later
    };
    
    // Only add URL directly if temp cart creation failed or URL is very short
    if (url && url.length < 100) {
      metadata.url = url; // Redundant but helps if temp cart fails
    }

    // Success URL for redirecting after checkout
    const successUrl = new URL('/success', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString();

    // Create checkout session using Polar SDK
    const checkout = await polar.checkouts.create({
      products: productIds,
      customerEmail: cartData.customerEmail,
      metadata,
      successUrl,
      allowDiscountCodes: true,
    });

    // Revalidate any relevant paths
    revalidatePath('/cart');

    return {
      isSuccess: true,
      message: 'Checkout created successfully',
      data: {
        checkoutUrl: checkout.url,
      },
    };
  } catch (error) {
    console.error('Error creating Polar checkout:', error);
    return {
      isSuccess: false,
      message: error instanceof Error
        ? `Failed to create checkout: ${error.message}`
        : 'Failed to create checkout due to an unknown error',
    };
  }
} 