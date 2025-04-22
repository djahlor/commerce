import { getProducts } from 'lib/products';
import { baseUrl } from 'lib/utils';
import { MetadataRoute } from 'next';

type Route = {
  url: string;
  lastModified: string;
};

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routesMap = [''].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString()
  }));

  // We only have products for now, no collections or pages yet
  const productsPromise = getProducts({}).then((products) =>
    products.map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: new Date().toISOString() // Use current date since we don't have updatedAt
    }))
  );

  let fetchedRoutes: Route[] = [];

  try {
    fetchedRoutes = (await Promise.all([productsPromise])).flat();
  } catch (error) {
    throw JSON.stringify(error, null, 2);
  }

  return [...routesMap, ...fetchedRoutes];
}
