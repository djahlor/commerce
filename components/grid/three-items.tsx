import { GridTileImage } from 'components/grid/tile';
// Shopify imports removed in Step 8 - will be replaced with Polar/Supabase/local config
// import { getCollectionProducts } from 'lib/shopify';
// import type { Product } from 'lib/shopify/types';
import { Product } from 'lib/types';
import Link from 'next/link';

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
        url: 'https://placehold.co/800x600',
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

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Product;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/product/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          src={item.featuredImage.url}
          fill
          sizes={
            size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === 'full' ? 'center' : 'bottom',
            title: item.title as string,
            amount: item.priceRange?.maxVariantPrice.amount || '0',
            currencyCode: item.priceRange?.maxVariantPrice.currencyCode || 'USD'
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  // Collections that start with `hidden-*` are hidden from the search page.
  // Shopify call replaced with mock in Step 8
  // const homepageItems = await getCollectionProducts({
  //   collection: 'hidden-homepage-featured-items'
  // });
  const homepageItems = await getMockCollectionProducts({
    collection: 'hidden-homepage-featured-items'
  });

  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) return null;

  const [firstProduct, secondProduct, thirdProduct] = homepageItems;

  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
