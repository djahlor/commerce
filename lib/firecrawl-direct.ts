import { ActionState } from '@/types';

// Interfaces for the scrape functionality
interface MapResult {
    links: string[];
}

interface ScrapeResultMetadata {
    url?: string;
    title?: string;
    description?: string;
    [key: string]: any;
}

interface ScrapeResult {
    markdown: string;
    metadata?: ScrapeResultMetadata;
}

interface BatchScrapeResponse {
    success?: boolean;
    status?: string;
    url?: string;
    data: ScrapeResult[];
    [key: string]: any;
}

// Function to fetch sitemap links
export async function fetchSitemap(url: string): Promise<string[]> {
    try {
        console.log(`[FirecrawlDirect] Fetching sitemap for ${url}`);
        const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`
            },
            body: JSON.stringify({
                url,
                ignoreSitemap: true,
                limit: 50
            }),
            cache: 'no-store'
        });

        if (!mapResponse.ok) {
            console.error(`[FirecrawlDirect] Sitemap fetch failed with status: ${mapResponse.status}`);
            return [url]; // Return just the base URL if sitemap fetch fails
        }

        const mapResult: MapResult = await mapResponse.json();
        const links = mapResult.links || [];
        console.log(`[FirecrawlDirect] Found ${links.length} links in sitemap`);

        return links;
    } catch (error) {
        console.error(`[FirecrawlDirect] Error fetching sitemap:`, error);
        return [url]; // Return just the base URL if there's an error
    }
}

// Function to find important pages
export function findImportantPages(links: string[], baseUrl: string): string[] {
    // Find about pages
    const aboutPage = links.find(link => {
        const lower = link.toLowerCase();
        return (
            lower.includes('/about') ||
            lower.includes('/about-us') ||
            lower.includes('/our-story') ||
            lower.includes('/company')
        );
    });

    // Find product pages
    const productPages = links
        .filter(link => {
            const lower = link.toLowerCase();
            return (
                lower.includes('/products') ||
                lower.includes('/collections') ||
                lower.includes('/shop')
            ) &&
            !lower.includes('?') &&
            !lower.includes('#');
        })
        .slice(0, 3);

    // Combine and deduplicate URLs
    const result = Array.from(new Set([
        baseUrl,
        ...(aboutPage ? [aboutPage] : []),
        ...productPages,
    ])).slice(0, 5);

    console.log(`[FirecrawlDirect] Selected ${result.length} important pages`);
    return result;
}

// Function to batch scrape pages
export async function batchScrapePages(urls: string[]): Promise<BatchScrapeResponse> {
    if (urls.length === 0) {
        return { data: [] };
    }

    try {
        console.log(`[FirecrawlDirect] Batch scraping ${urls.length} URLs`);
        // Initial request to start batch scraping
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/batch/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`
            },
            body: JSON.stringify({
                urls: urls,
                formats: ['markdown', 'html'],
                onlyMainContent: true,
                excludeTags: [
                    'script',
                    'style',
                    'noscript',
                    'nav',
                    'header',
                    'store-header',
                    'footer',
                    'aside',
                    '.sidebar',
                    '.advertisement',
                    '#comments',
                    'img',
                    'picture',
                    'figure',
                    'video',
                    'audio',
                    'iframe',
                ],
                includeTags: [
                    'body',
                    'article',
                    '.content',
                    '.main',
                    '.post',
                    'h1',
                    'h2',
                    'h3',
                    'p',
                    '.product-description',
                    '.about-content'
                ],
                blockAds: true,
                removeBase64Images: true,
                timeout: 30000,
                waitFor: 5000,
                ignoreInvalidURLs: true
            }),
            cache: 'no-store'
        });

        if (!scrapeResponse.ok) {
            console.error(`[FirecrawlDirect] Batch scrape init failed with status: ${scrapeResponse.status}`);
            return { data: [] };
        }

        const batchInitResult = await scrapeResponse.json();
        console.log(`[FirecrawlDirect] Batch scrape initiated successfully: ${batchInitResult.url}`);

        return batchInitResult;
    } catch (error) {
        console.error(`[FirecrawlDirect] Error in batch scrape:`, error);
        return { data: [] };
    }
}

// Function to retrieve results of the scrape API
export async function getBatchScrapeResults(batchInitResult: BatchScrapeResponse): Promise<string> {
    // Maximum number of polling attempts
    const maxAttempts = 6;
    // Delay between polling attempts in milliseconds
    const pollingDelay = 3000;

    let attempts = 0;
    let batchResults: BatchScrapeResponse = { data: [] };
    let content = '';

    // Wait for a short delay before first fetch
    await new Promise(resolve => setTimeout(resolve, pollingDelay));

    while (attempts < maxAttempts) {
        if (!batchInitResult.url) {
            console.error(`[FirecrawlDirect] No URL in batch init result to poll`);
            break;
        }

        console.log(`[FirecrawlDirect] Polling for results: attempt ${attempts + 1}/${maxAttempts}`);
        const response = await fetch(batchInitResult.url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`[FirecrawlDirect] Polling failed with status: ${response.status}`);
            attempts++;
            continue;
        }

        batchResults = await response.json() as BatchScrapeResponse;
        console.log(`[FirecrawlDirect] Received batch results with ${batchResults.data.length} items`);

        content = batchResults.data
            .filter((item: ScrapeResult) => item.markdown)
            .map((item: ScrapeResult) => item.markdown)
            .join('\n\n---\n\n');

        // If we have content, break out of the loop
        if (content) {
            console.log(`[FirecrawlDirect] Successfully retrieved content (${content.length} characters)`);
            break;
        }

        attempts++;

        // Only wait if we're going to make another attempt
        if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollingDelay));
        }
    }

    if (!content) {
        console.warn(`[FirecrawlDirect] No markdown content found after ${attempts} attempts`);
    }

    return content;
}

// Main function to scrape website content
export async function directScrape(url: string): Promise<ActionState<{content: string}>> {
    try {
        console.log(`[FirecrawlDirect] Starting direct scrape for ${url}`);
        
        // get sitemap links
        const links = await fetchSitemap(url);

        // find important pages
        const importantPages = findImportantPages(links, url);

        // scrape important pages
        const scrapeResponse = await batchScrapePages(importantPages) as BatchScrapeResponse;

        // get results from batch scraping
        const content = await getBatchScrapeResults(scrapeResponse);

        if (!content) {
            return {
                isSuccess: false,
                message: 'No markdown content found in scrape result'
            };
        }

        return {
            isSuccess: true,
            message: 'Website scraped successfully',
            data: { content }
        };
    } catch (error: any) {
        console.error("[FirecrawlDirect] Error in direct scrape:", error);
        return {
            isSuccess: false,
            message: `Scraping failed: ${error.message || 'Unknown error'}`
        };
    }
} 