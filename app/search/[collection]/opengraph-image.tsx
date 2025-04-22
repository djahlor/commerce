import OpengraphImage from 'components/opengraph-image';

// Temporary replacement for removed Shopify functionality
export default async function Image({
  params
}: {
  params: { collection: string };
}) {
  // Use collection parameter directly as title
  const title = params.collection.charAt(0).toUpperCase() + params.collection.slice(1).replace(/-/g, ' ');

  return await OpengraphImage({ title });
}
