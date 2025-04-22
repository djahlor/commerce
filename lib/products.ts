import { Product } from './types';

// Temporary mock data for products
const mockProducts: Product[] = [
  {
    id: '1',
    handle: 'base-kit',
    title: 'E-commerce Base Kit',
    description: 'Essential analysis for any e-commerce site',
    availableForSale: true,
    featuredImage: {
      url: 'https://placehold.co/600x400?text=Base+Kit',
      altText: 'Base Kit',
      width: 600,
      height: 400
    },
    images: [],
    priceRange: {
      maxVariantPrice: {
        amount: '79.99',
        currencyCode: 'USD'
      },
      minVariantPrice: {
        amount: '79.99',
        currencyCode: 'USD'
      }
    },
    variants: [
      {
        id: '1',
        title: 'Default',
        availableForSale: true,
        selectedOptions: [
          {
            name: 'Type',
            value: 'Default'
          }
        ],
        price: {
          amount: '79.99',
          currencyCode: 'USD'
        }
      }
    ]
  },
  {
    id: '2',
    handle: 'full-stack',
    title: 'Full Stack E-commerce Kit',
    description: 'Complete analysis and strategy for your e-commerce site',
    availableForSale: true,
    featuredImage: {
      url: 'https://placehold.co/600x400?text=Full+Stack',
      altText: 'Full Stack Kit',
      width: 600,
      height: 400
    },
    images: [],
    priceRange: {
      maxVariantPrice: {
        amount: '149.99',
        currencyCode: 'USD'
      },
      minVariantPrice: {
        amount: '149.99',
        currencyCode: 'USD'
      }
    },
    variants: [
      {
        id: '2',
        title: 'Default',
        availableForSale: true,
        selectedOptions: [
          {
            name: 'Type',
            value: 'Default'
          }
        ],
        price: {
          amount: '149.99',
          currencyCode: 'USD'
        }
      }
    ]
  }
];

// Function to get products with filtering and sorting
export async function getProducts({
  sortKey = 'RELEVANCE',
  reverse = false,
  query = ''
}: {
  sortKey?: string;
  reverse?: boolean;
  query?: string;
}) {
  // Filter products by search query if provided
  let filteredProducts = query
    ? mockProducts.filter(
        product =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
      )
    : mockProducts;

  // Sort products
  if (sortKey === 'PRICE') {
    filteredProducts = filteredProducts.sort((a, b) => {
      const aPrice = a.priceRange?.minVariantPrice.amount ? parseFloat(a.priceRange.minVariantPrice.amount) : 0;
      const bPrice = b.priceRange?.minVariantPrice.amount ? parseFloat(b.priceRange.minVariantPrice.amount) : 0;
      return reverse ? bPrice - aPrice : aPrice - bPrice;
    });
  } else if (sortKey === 'TITLE') {
    filteredProducts = filteredProducts.sort((a, b) => {
      return reverse
        ? b.title.localeCompare(a.title)
        : a.title.localeCompare(b.title);
    });
  }

  return filteredProducts;
}

// Function to get a specific product by handle
export async function getProduct(handle: string) {
  return mockProducts.find(product => product.handle === handle) || null;
}

// Function to get related products (excluding the current product)
export async function getRelatedProducts(currentProductId: string) {
  return mockProducts.filter(product => product.id !== currentProductId);
} 