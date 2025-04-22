import { Providers } from '@/components/utilities/providers';
import { TailwindIndicator } from '@/components/utilities/tailwind-indicator';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { CartProvider } from 'components/cart/cart-context';
import { Navbar } from 'components/layout/navbar';
import { WelcomeToast } from 'components/welcome-toast';
import { GeistSans } from 'geist/font/sans';
// Shopify import removed in Step 8 - will be replaced with local state management
// import { getCart } from 'lib/shopify';
import { baseUrl } from 'lib/utils';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';

const { SITE_NAME } = process.env;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  }
};

// Temporary function to replace getCart until we implement local state
const getDummyCart = () => {
  return Promise.resolve({
    id: undefined,
    checkoutUrl: '',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  });
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  // Shopify cart retrieval removed in Step 8
  // const cart = getCart();
  const cart = getDummyCart();

  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <Providers attribute="class" defaultTheme="system" enableSystem>
            <CartProvider cartPromise={cart}>
              <Navbar />
              <main>
                {children}
                <Toaster closeButton />
                <WelcomeToast />
              </main>
              <TailwindIndicator />
            </CartProvider>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
