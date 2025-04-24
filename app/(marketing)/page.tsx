import { Button } from "@/components/ui/button";
import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import Link from "next/link";

export const metadata = {
  description: 'High-performance analytics for e-commerce.',
  openGraph: {
    type: 'website'
  }
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-background w-full flex justify-center">
        <div className="max-w-[1400px] w-full px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  E-commerce Analytics Simplified
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Analyze and optimize your online store with our suite of powerful tools.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild className="px-8">
                  <Link href="/search">
                    Browse Products
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    Dashboard
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-70 blur-3xl"></div>
                <div className="absolute inset-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 opacity-40 blur-2xl"></div>
                <div className="absolute inset-20 rounded-full bg-gradient-to-br from-blue-700 to-purple-800 opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products Grid */}
      <section className="py-12 bg-background w-full flex justify-center">
        <div className="max-w-[1400px] w-full px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Featured Products</h2>
          <div className="h-[500px] md:h-[600px] lg:h-[700px]">
            <ThreeItemGrid />
          </div>
        </div>
      </section>
      
      {/* Product Carousel */}
      <section className="py-8 bg-background w-full flex justify-center">
        <div className="max-w-[1400px] w-full px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Explore Our Products</h2>
          <Carousel />
        </div>
      </section>
      
      <footer className="border-t py-6 md:py-0 w-full flex justify-center">
        <div className="max-w-[1400px] w-full px-4 md:px-6 flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Commerce. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 