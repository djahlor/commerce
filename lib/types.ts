/**
 * @deprecated Import types from '@/types' instead
 * This file is kept for backward compatibility and will be removed in the future
 */

export * from '@/types';

// Server Action Types
export type ActionState<T> = {
  isSuccess: boolean;
  message?: string;
  data?: T;
};

// Temporary Product/Cart Types (Replacing Shopify)
export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
  width?: number;
  height?: number;
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
  // Will add URL field here in Step 18
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  featuredImage: Image;
  images: Image[];
  availableForSale: boolean;
  variants: ProductVariant[] | { edges: { node: ProductVariant }[] };
  options?: { id: string; name: string; values: string[] }[];
  priceRange?: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  seo?: {
    title?: string;
    description?: string;
  };
  tags?: string[];
};

export type Cart = {
  id: string | undefined;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartItem[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  path: string;
  seo?: {
    title?: string;
    description?: string;
  };
  updatedAt?: string;
};

export type Menu = {
  title: string;
  path: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}; 