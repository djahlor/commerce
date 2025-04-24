'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/types';
import { useState } from 'react';
import { VariantSelector } from './variant-selector';

export function ProductDescription({ product }: { product: Product }) {
  // Handle different variants structure
  const productVariants = Array.isArray(product.variants) 
    ? product.variants 
    : product.variants.edges.map(edge => edge.node);
    
  // State for website URL
  const [websiteUrl, setWebsiteUrl] = useState('');
    
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
      
      {/* Website URL Input */}
      <div className="mb-6">
        <Label htmlFor="website-url" className="mb-2 block text-sm font-medium">
          Your E-commerce Website URL <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="website-url"
            type="url"
            placeholder="https://your-ecommerce-site.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full"
            required
          />
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          We need your website URL to analyze and generate your custom reports.
        </p>
      </div>
      
      <AddToCart product={product} websiteUrl={websiteUrl} />
    </>
  );
}
