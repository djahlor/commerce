/**
 * Sample test data for PDF generation
 */

export const SAMPLE_CONTENT = {
  websiteAnalysis: {
    overview: "Example Website Content is a well-structured e-commerce site offering various products with clear navigation and user-friendly interface. The site provides information about products, testimonials, and contact details.",
    strengths: [
      "Clean organization with clear section headers",
      "Prominent product showcase with categorization",
      "Customer testimonials providing social proof",
      "Easy-to-find contact information",
      "Simple and direct navigation structure"
    ],
    weaknesses: [
      "Limited product descriptions",
      "No pricing information readily visible",
      "Missing call-to-action buttons",
      "Basic design without visual elements",
      "No search functionality mentioned"
    ]
  }
};

export const sampleData = {
  basic: {
    title: "Basic Website Analysis Report",
    introduction: "This is a sample basic analysis report for testing PDF generation. It contains a brief overview of the website with minimal details.",
    sections: [
      {
        subtitle: "Website Overview",
        content: "The website appears to be an e-commerce platform focused on selling digital products. Here is a brief analysis of its current state.",
        listItems: [
          "Simple navigation structure",
          "Product listings on the homepage",
          "Basic checkout functionality",
          "Mobile-responsive design"
        ]
      },
      {
        subtitle: "Key Recommendations",
        content: "Based on our analysis, here are some suggestions for improvement:",
        listItems: [
          "Improve page load speed",
          "Add more payment options",
          "Enhance product search functionality",
          "Implement customer reviews"
        ]
      }
    ]
  },
  premium: {
    title: "Premium Website Analysis Report",
    introduction: "This comprehensive premium analysis report provides detailed insights into your website's performance, user experience, and conversion optimization opportunities.",
    sections: [
      {
        subtitle: "Website Overview",
        content: "The e-commerce platform demonstrates good fundamentals but requires optimization in several key areas to maximize conversion rates and improve user experience.",
        listItems: [
          "Clean and modern design aesthetic",
          "Intuitive product categorization",
          "Functional but basic checkout process",
          "Limited payment gateway options",
          "Reasonable but not optimal page load speed"
        ]
      },
      {
        subtitle: "Performance Analysis",
        content: "Our performance tests reveal several opportunities for improvement in site speed and resource optimization:",
        listItems: [
          "Initial page load time: 3.2 seconds (industry benchmark: 2.5 seconds)",
          "First Contentful Paint: 1.8 seconds",
          "Large image files lacking optimization",
          "Render-blocking JavaScript affecting initial load",
          "Missing browser caching implementation"
        ]
      },
      {
        subtitle: "User Experience Assessment",
        content: "The user journey analysis identified these key findings:",
        listItems: [
          "Navigation requires 20% more clicks than optimal",
          "Mobile checkout abandonment rate is 15% higher than desktop",
          "Product filtering options are limited",
          "Search functionality returns imprecise results",
          "Customer account creation process is unnecessarily complex"
        ]
      },
      {
        subtitle: "Conversion Recommendations",
        content: "Based on our analysis, we recommend these high-impact changes to improve conversion rates:",
        listItems: [
          "Implement one-click checkout for returning customers",
          "Add social proof elements near add-to-cart buttons",
          "Create persistent shopping cart that follows users",
          "Add urgency elements like stock levels and limited-time offers",
          "Simplify the checkout form from 3 steps to 1 step"
        ]
      }
    ]
  }
}; 