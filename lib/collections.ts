import { Collection } from './types';

// Temporary mock data for collections
const mockCollections: Collection[] = [
  {
    handle: 'kits',
    title: 'E-commerce Kits',
    description: 'Complete analysis kits for your e-commerce site',
    path: '/search/kits',
    seo: {
      title: 'E-commerce Analysis Kits',
      description: 'Professional analysis kits for your online store'
    }
  },
  {
    handle: 'reports',
    title: 'Individual Reports',
    description: 'Specialized reports focusing on specific aspects of your business',
    path: '/search/reports',
    seo: {
      title: 'Individual Business Reports',
      description: 'Targeted analysis for specific business needs'
    }
  }
];

/**
 * Get all available collections
 */
export async function getCollections(): Promise<Collection[]> {
  return mockCollections;
}

/**
 * Get a specific collection by handle
 */
export async function getCollection(handle: string): Promise<Collection | undefined> {
  return mockCollections.find(collection => collection.handle === handle);
} 