import OpengraphImage from 'components/opengraph-image';

// Temporary replacement for removed Shopify functionality
export default async function Image({ params }: { params: { page: string } }) {
  // Use page parameter directly as title 
  const title = params.page.charAt(0).toUpperCase() + params.page.slice(1).replace(/-/g, ' ');

  return await OpengraphImage({ title });
}
