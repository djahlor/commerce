import Grid from 'components/grid';
import { defaultSort, sorting } from 'lib/constants';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Temporary placeholder functions for removed Shopify functionality
async function getCollectionPlaceholder(slug: string) {
  // This would fetch collection data from your own API/database
  return {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    description: `Placeholder for ${slug} collection description.`,
    seo: {
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')} | Collection`,
      description: `Browse our ${slug} collection products.`
    }
  };
}

async function getCollectionProductsPlaceholder() {
  // This would fetch products from your own API/database
  // Empty array for now as a placeholder
  return [];
}

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollectionPlaceholder(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description || collection.description || `${collection.title} products`
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  const products = await getCollectionProductsPlaceholder();

  return (
    <section>
      <p className="py-3 text-lg">
        Collection: {params.collection.charAt(0).toUpperCase() + params.collection.slice(1).replace(/-/g, ' ')}
      </p>
      <p className="py-3 text-lg">
        The Shopify integration has been removed. This page needs to be updated with your own product data source.
      </p>
      {products.length === 0 ? (
        <p className="py-3 text-lg">{`No products found in this collection`}</p>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* ProductGridItems would be used here when products are available */}
        </Grid>
      )}
    </section>
  );
}
