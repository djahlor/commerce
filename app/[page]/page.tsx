import Prose from 'components/prose';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Temporary placeholder for page data without Shopify
const getPagePlaceholder = async (slug: string) => {
  // This is a temporary replacement for getPage from Shopify
  // In a real implementation, this would fetch data from your own API/database
  return {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    bodySummary: `This is a placeholder for the ${slug} page.`,
    body: `<p>This is a placeholder for the ${slug} page content.</p>
           <p>The Shopify integration has been removed and this page needs to be updated with your own content source.</p>`,
    seo: {
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')} | Site Name`,
      description: `Placeholder description for ${slug} page.`
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = await getPagePlaceholder(params.page);

  if (!page) return notFound();

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: 'article'
    }
  };
}

export default async function Page(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const page = await getPagePlaceholder(params.page);

  if (!page) return notFound();

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{page.title}</h1>
      <Prose className="mb-8" html={page.body} />
      <p className="text-sm italic">
        {`This document was last updated on ${new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(page.updatedAt))}.`}
      </p>
    </>
  );
}
