'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useProduct } from 'components/product/product-context';
// Shopify imports removed in Step 8 - will be replaced with custom types
// import { Product, ProductVariant } from 'lib/shopify/types';
import { useCartActions } from '@/lib/store/cart-store';
import { Product, ProductVariant } from 'lib/types';
import { nanoid } from 'nanoid';

function SubmitButton({
  availableForSale,
  selectedVariantId,
  onClick
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  onClick: () => void;
}) {
  const buttonClasses =
    'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white';
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Out Of Stock
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Add To Cart
      </button>
    );
  }

  return (
    <button
      aria-label="Add to cart"
      className={clsx(buttonClasses, {
        'hover:opacity-90': true
      })}
      onClick={onClick}
      type="button"
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addItem } = useCartActions();
  const { state } = useProduct();
  
  // Remove URL input value from state
  
  // Handle different variants structure
  const productVariants = Array.isArray(variants) 
    ? variants 
    : variants.edges.map(edge => edge.node);

  const variant = productVariants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = productVariants.length === 1 ? productVariants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = productVariants.find(
    (variant) => variant.id === selectedVariantId
  );

  const handleAddToCart = () => {
    if (!finalVariant) return;
    
    // Create a cart item from the product and variant data
    addItem({
      id: nanoid(), // Generate a unique ID for the cart item
      productId: product.id,
      handle: product.handle,
      title: product.title,
      variantId: finalVariant.id,
      variantTitle: finalVariant.title,
      price: {
        amount: finalVariant.price.amount,
        currencyCode: finalVariant.price.currencyCode
      },
      image: product.featuredImage && {
        url: product.featuredImage.url,
        altText: product.featuredImage.altText,
        width: typeof product.featuredImage.width === 'number' ? product.featuredImage.width : undefined,
        height: typeof product.featuredImage.height === 'number' ? product.featuredImage.height : undefined
      },
      options: finalVariant.selectedOptions
    });
  };

  return (
    <div>
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
        onClick={handleAddToCart}
      />
    </div>
  );
}
