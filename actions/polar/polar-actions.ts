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
  // URL removed - will be collected during checkout
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
 * Uses metadata to instruct customers to enter their website URL in the notes field
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
    
    // Store cart data in temp_carts table for persistence (without URL)
    const tempCartResult = await createTempCartAction(
      tempCartId,
      '', // No URL yet - will be collected during checkout
      JSON.stringify({ items: cartData.items })
    );
    
    if (!tempCartResult.isSuccess) {
      console.error('Failed to create temp cart:', tempCartResult.message);
      // Continue with checkout, but log the error
    }

    // Get product IDs from cart items
    const productIds = cartData.items.map(item => item.productId);

    // Prepare metadata for the checkout
    const metadata: Record<string, string> = {
      tempCartId, // Pass the temp cart ID which can be used to retrieve data later
      // Add instructions with stronger emphasis that URL is REQUIRED
      instructions: "⚠️ REQUIRED: You MUST enter your e-commerce website URL in the note field to complete your order and receive your analysis"
    };

    // Success URL for redirecting after checkout
    const successUrl = new URL('/success', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString();

    // Create checkout session using Polar SDK 
    const checkout = await polar.checkouts.create({
      products: productIds,
      customerEmail: cartData.customerEmail,
      metadata,
      successUrl,
      allowDiscountCodes: true
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