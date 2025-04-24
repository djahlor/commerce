import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { PRODUCT_IDS } from '@/lib/polar';
import { GridTileImage } from 'components/grid/tile';
import Footer from 'components/layout/footer';
import { Gallery } from 'components/product/gallery';
import { ProductProvider } from 'components/product/product-context';
import { ProductDescription } from 'components/product/product-description';
import { HIDDEN_PRODUCT_TAG } from 'lib/constants';
import { Image } from 'lib/types';
import Link from 'next/link';

// Type for image
type TrustedImage = {
  url: string;
  altText: string;
  width?: number;
  height?: number;
};

// Temporary mock product data until we implement Polar/Supabase integration
const getMockProduct = async (handle: string) => {
  // This will be replaced with actual product data from Polar/Supabase
  let productImage = '/keyboard.png';
  let productTitle = 'E-Com Edge Kit';
  let productPrice = '149.00';
  let productId = PRODUCT_IDS.BASE_KIT;

  // Set different images based on the handle
  if (handle === 'full-edge-stack') {
    productImage = '/webcam-cover.png';
    productTitle = 'Full Edge Stack';
    productPrice = '399.00';
    productId = PRODUCT_IDS.FULL_STACK;
  } else if (handle === 'competitor-kill-matrix') {
    productImage = '/sticker.png';
    productTitle = 'Competitor Kill Matrix';
    productPrice = '199.00';
    productId = PRODUCT_IDS.UPSELLS.SEO_STRATEGY;
  }

  return {
    id: productId, // Using proper Polar product ID
    handle,
    title: productTitle,
    description: 'Comprehensive analysis toolkit for your e-commerce store',
    descriptionHtml: '<p>Comprehensive analysis toolkit for your e-commerce store</p>',
    featuredImage: {
      url: productImage,
      altText: productTitle,
      width: 800,
      height: 800
    },
    images: [
      {
        url: productImage,
        altText: productTitle,
        width: 800,
        height: 800
      }
    ],
    priceRange: {
      minVariantPrice: {
        amount: productPrice,
        currencyCode: 'USD'
      },
      maxVariantPrice: {
        amount: productPrice,
        currencyCode: 'USD'
      }
    },
    seo: {
      title: `${productTitle} - Save Your Store`,
      description: 'AI-generated insights to help your e-commerce business thrive'
    },
    tags: [],
    availableForSale: true,
    variants: {
      edges: [
        {
          node: {
            id: 'mock-variant-id',
            title: 'Default',
            availableForSale: true,
            selectedOptions: [
              {
                name: 'Title',
                value: 'Default'
              }
            ],
            price: {
              amount: productPrice,
              currencyCode: 'USD'
            }
          }
        }
      ]
    },
    options: [
      {
        id: 'option-1',
        name: 'Title',
        values: ['Default']
      }
    ]
  };
};

// Temporary mock for product recommendations until we implement our own logic
const getMockProductRecommendations = async () => {
  // This will be replaced with actual related products
  return [
    {
      id: 'mock-related-1',
      handle: 'competitor-kill-matrix',
      title: 'Competitor Kill Matrix',
      featuredImage: {
        url: '/sticker.png',
        altText: 'Competitor Kill Matrix'
      },
      priceRange: {
        maxVariantPrice: {
          amount: '199.00',
          currencyCode: 'USD'
        }
      }
    },
    {
      id: 'mock-related-2',
      handle: 'threat-scanner',
      title: 'Threat Scanner',
      featuredImage: {
        url: '/sticker-rainbow.png',
        altText: 'Threat Scanner'
      },
      priceRange: {
        maxVariantPrice: {
          amount: '99.00',
          currencyCode: 'USD'
        }
      }
    }
  ];
};

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  // Shopify call replaced with mock in Step 8
  // const product = await getProduct(params.handle);
  const product = await getMockProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG as never);

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable
      }
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt
            }
          ]
        }
      : null
  };
}

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  // Shopify call replaced with mock in Step 8
  // const product = await getProduct(params.handle);
  const product = await getMockProduct(params.handle);

  if (!product) return notFound();

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.featuredImage.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount
    }
  };

  return (
    <ProductProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4">
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-800 dark:bg-black">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              <Gallery
                images={product.images.slice(0, 5).map((image: Image) => ({
                  src: image.url,
                  altText: image.altText
                }))}
              />
            </Suspense>
          </div>

          <div className="basis-full lg:basis-2/6">
            <Suspense fallback={null}>
              <ProductDescription product={product} />
            </Suspense>
          </div>
        </div>
        <RelatedProducts id={product.id} />
      </div>
      <Footer />
    </ProductProvider>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  // Shopify call replaced with mock in Step 8
  // const relatedProducts = await getProductRecommendations(id);
  const relatedProducts = await getMockProductRecommendations();

  if (!relatedProducts.length) return null;

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {relatedProducts.map((product) => (
          <li
            key={product.handle}
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
          >
            <Link
              className="relative h-full w-full"
              href={`/product/${product.handle}`}
              prefetch={true}
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
