// Shopify imports removed in Step 8 - will be replaced with Polar/Supabase/local config
// import { getCollectionProducts } from 'lib/shopify';
import { Product } from 'lib/types';
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

// Mock function to replace getCollectionProducts until we implement our data source
async function getMockCollectionProducts({ collection }: { collection: string }): Promise<Product[]> {
  // This will be replaced with actual product data from Polar/Supabase
  return [
    {
      id: 'mock-product-1',
      handle: 'e-com-edge-kit',
      title: 'E-Com Edge Kit',
      availableForSale: true,
      featuredImage: {
        url: 'https://placehold.co/600x400',
        altText: 'E-Com Edge Kit'
      },
      priceRange: {
        minVariantPrice: {
          amount: '149.00',
          currencyCode: 'USD'
        },
        maxVariantPrice: {
          amount: '149.00',
          currencyCode: 'USD'
        }
      },
      images: [],
      variants: []
    },
    {
      id: 'mock-product-2',
      handle: 'full-edge-stack',
      title: 'Full Edge Stack',
      availableForSale: true,
      featuredImage: {
        url: 'https://placehold.co/600x400',
        altText: 'Full Edge Stack'
      },
      priceRange: {
        minVariantPrice: {
          amount: '399.00',
          currencyCode: 'USD'
        },
        maxVariantPrice: {
          amount: '399.00',
          currencyCode: 'USD'
        }
      },
      images: [],
      variants: []
    },
    {
      id: 'mock-product-3',
      handle: 'competitor-kill-matrix',
      title: 'Competitor Kill Matrix',
      availableForSale: true,
      featuredImage: {
        url: 'https://placehold.co/600x400',
        altText: 'Competitor Kill Matrix'
      },
      priceRange: {
        minVariantPrice: {
          amount: '199.00',
          currencyCode: 'USD'
        },
        maxVariantPrice: {
          amount: '199.00',
          currencyCode: 'USD'
        }
      },
      images: [],
      variants: []
    },
  ];
}

export async function Carousel() {
  // Collections that start with `hidden-*` are hidden from the search page.
  // Shopify call replaced with mock in Step 8
  // const products = await getCollectionProducts({ collection: 'hidden-homepage-carousel' });
  const products = await getMockCollectionProducts({ collection: 'hidden-homepage-carousel' });

  if (!products?.length) return null;

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link href={`/product/${product.handle}`} className="relative h-full w-full">
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange?.maxVariantPrice?.amount || '0',
                  currencyCode: product.priceRange?.maxVariantPrice?.currencyCode || 'USD'
                }}
                src={product.featuredImage?.url || ''}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
