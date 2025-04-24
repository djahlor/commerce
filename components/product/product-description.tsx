import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/types';
import { UrlInput } from './url-input';
import { VariantSelector } from './variant-selector';

export function ProductDescription({ product }: { product: Product }) {
  // Handle different variants structure
  const productVariants = Array.isArray(product.variants) 
    ? product.variants 
    : product.variants.edges.map(edge => edge.node);
    
  // Determine if this product requires URL input
  // We could make this more sophisticated by checking product tags or metadata
  const requiresUrlInput = true; // For now, assume all products need URL
    
  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
          <Price
            amount={product.priceRange?.maxVariantPrice.amount || '0'}
            currencyCode={product.priceRange?.maxVariantPrice.currencyCode || 'USD'}
          />
        </div>
      </div>
      <VariantSelector options={product.options || []} variants={productVariants} />
      {product.descriptionHtml ? (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.descriptionHtml}
        />
      ) : null}
      
      {/* Add URL input for products that require website analysis */}
      {requiresUrlInput && <UrlInput />}
      
      <AddToCart product={product} />
    </>
  );
}
