import { Providers } from '@/components/utilities/providers';
import { TailwindIndicator } from '@/components/utilities/tailwind-indicator';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
// Remove Shopify-based cart provider import
// import { CartProvider } from 'components/cart/cart-context';
import { Navbar } from 'components/layout/navbar';
import { WelcomeToast } from 'components/welcome-toast';
import { GeistSans } from 'geist/font/sans';
// Shopify import removed in Step 8
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

// Remove temporary function as it's no longer needed
// We're using Zustand store now which doesn't require initial data

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  // No need to get initial cart, Zustand will handle state persistence

  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <Providers attribute="class" defaultTheme="system" enableSystem>
            {/* No need for the CartProvider wrapper anymore */}
            <Navbar />
            <main>
              {children}
              <Toaster closeButton />
              <WelcomeToast />
            </main>
            <TailwindIndicator />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
