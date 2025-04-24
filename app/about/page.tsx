import Footer from 'components/layout/footer';
import { Navbar } from 'components/layout/navbar';

export const metadata = {
  title: 'About',
  description: 'Learn more about our e-commerce analytics products'
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold">About Us</h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p>
            We provide cutting-edge e-commerce analytics and insights to help businesses
            understand their online presence and optimize their digital storefronts.
          </p>
          
          <h2 className="mt-8 text-2xl font-semibold">Our Mission</h2>
          <p>
            Our mission is to empower e-commerce businesses with data-driven insights
            that help them make better decisions, improve their customer experience,
            and grow their online revenue.
          </p>
          
          <h2 className="mt-8 text-2xl font-semibold">Our Products</h2>
          <p>
            We offer a range of analytics products designed to provide comprehensive
            insights into your e-commerce website:
          </p>
          
          <ul className="list-disc pl-6">
            <li>E-commerce Base Kit - Essential analytics for your online store</li>
            <li>Full Stack E-commerce Kit - Comprehensive analysis and reports</li>
            <li>Premium Analytics - Advanced insights with priority support</li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
} 