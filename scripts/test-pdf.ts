import * as fs from 'fs';
import * as path from 'path';
import {
    addList,
    addPageBreak,
    addSpacing,
    addSubtitle,
    addTable,
    addText,
    addTitle,
    createPDFDocument,
    finalizePDF
} from '../lib/pdf';
import { sampleData } from '../lib/test-data';

/**
 * Generate a basic test PDF using the sample data
 */
async function generateBasicPDF() {
  console.log('Generating basic PDF...');
  const doc = createPDFDocument();
  
  // Add title
  addTitle(doc, sampleData.basic.title);
  
  // Add introduction
  addText(doc, sampleData.basic.introduction);
  addSpacing(doc, 10);
  
  // Add sections
  for (const section of sampleData.basic.sections) {
    addSubtitle(doc, section.subtitle);
    addText(doc, section.content);
    if (section.listItems && section.listItems.length > 0) {
      addList(doc, section.listItems);
    }
    addSpacing(doc, 15);
  }
  
  // Add a simple table
  const tableHeaders = ['Feature', 'Status', 'Priority'];
  const tableRows = [
    ['Search Function', 'Needs Improvement', 'High'],
    ['Mobile Responsiveness', 'Good', 'Medium'],
    ['Checkout Process', 'Needs Improvement', 'High'],
    ['Performance', 'Poor', 'Critical']
  ];
  
  addSubtitle(doc, 'Feature Assessment');
  addTable(doc, tableHeaders, tableRows);
  
  // Finalize the PDF
  const pdfBuffer = await finalizePDF(doc);
  
  // Save to disk
  const outputDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'basic-test.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);
  
  console.log(`Basic PDF saved to: ${outputPath}`);
  return outputPath;
}

/**
 * Generate a premium test PDF using the sample data
 */
async function generatePremiumPDF() {
  console.log('Generating premium PDF...');
  const doc = createPDFDocument();
  
  // Add title
  addTitle(doc, sampleData.premium.title);
  
  // Add introduction
  addText(doc, sampleData.premium.introduction);
  addSpacing(doc, 10);
  
  // Add sections
  for (const section of sampleData.premium.sections) {
    addSubtitle(doc, section.subtitle);
    addText(doc, section.content);
    if (section.listItems && section.listItems.length > 0) {
      addList(doc, section.listItems);
    }
    addSpacing(doc, 15);
  }
  
  // Add a more complex table
  const tableHeaders = ['Metric', 'Current Value', 'Industry Benchmark', 'Gap'];
  const tableRows = [
    ['Page Load Time', '3.2s', '2.5s', '-0.7s'],
    ['Conversion Rate', '2.1%', '3.2%', '-1.1%'],
    ['Cart Abandonment', '76%', '69%', '-7%'],
    ['Mobile Bounce Rate', '58%', '51%', '-7%'],
    ['Avg. Session Duration', '2:15', '3:10', '-0:55']
  ];
  
  addSubtitle(doc, 'Performance Metrics');
  addTable(doc, tableHeaders, tableRows);
  
  // Add page break example
  addPageBreak(doc);
  
  // Recommendations summary
  addSubtitle(doc, 'Implementation Roadmap');
  
  const roadmapHeaders = ['Recommendation', 'Effort', 'Impact', 'Timeline'];
  const roadmapRows = [
    ['Image Optimization', 'Low', 'Medium', '1-2 weeks'],
    ['Checkout Simplification', 'Medium', 'High', '2-4 weeks'],
    ['Add Payment Options', 'Medium', 'Medium', '3-4 weeks'],
    ['Improve Search Algorithm', 'High', 'High', '4-6 weeks'],
    ['Mobile UX Redesign', 'High', 'Critical', '6-8 weeks']
  ];
  
  addTable(doc, roadmapHeaders, roadmapRows);
  
  // Finalize the PDF
  const pdfBuffer = await finalizePDF(doc);
  
  // Save to disk
  const outputDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'premium-test.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);
  
  console.log(`Premium PDF saved to: ${outputPath}`);
  return outputPath;
}

/**
 * Main function to run tests
 */
async function main() {
  try {
    console.log('Starting PDF generation tests...');
    
    const basicPath = await generateBasicPDF();
    const premiumPath = await generatePremiumPDF();
    
    console.log('\nPDF Generation Test Results:');
    console.log('----------------------------');
    console.log(`Basic PDF: ${basicPath}`);
    console.log(`Premium PDF: ${premiumPath}`);
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error generating PDFs:', error);
    process.exit(1);
  }
}

// Run the script
main(); 