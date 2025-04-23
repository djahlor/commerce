#!/usr/bin/env node

/**
 * Simple script to test AI analysis functions
 * 
 * Usage:
 *   node scripts/test-ai-analysis.js website
 *   node scripts/test-ai-analysis.js marketing
 *   node scripts/test-ai-analysis.js content
 *   node scripts/test-ai-analysis.js technical
 */

const { execSync } = require('child_process');
const analysisType = process.argv[2] || 'website';

// Check if server is running on port 3000 or 3001
let port = 3000;
try {
  execSync('curl http://localhost:3000 -s -o /dev/null');
} catch (error) {
  port = 3001;
  try {
    execSync('curl http://localhost:3001 -s -o /dev/null');
  } catch (error) {
    console.error('Error: Next.js dev server not running on port 3000 or 3001');
    process.exit(1);
  }
}

// Validate analysis type
const validTypes = ['website', 'marketing', 'content', 'technical'];
if (!validTypes.includes(analysisType)) {
  console.error(`Error: Invalid analysis type. Must be one of: ${validTypes.join(', ')}`);
  process.exit(1);
}

console.log(`Testing ${analysisType} analysis...`);

try {
  // Execute the curl command
  const command = `curl -X POST http://localhost:${port}/api/test/simple-pdf -H "Content-Type: application/json" -d '{"analysisType": "${analysisType}"}'`;
  
  console.log(`Executing: ${command}`);
  const result = execSync(command, { stdio: 'pipe' }).toString();
  
  // Parse and display the result
  try {
    const parsedResult = JSON.parse(result);
    
    if (parsedResult.success) {
      console.log(`\n✅ ${analysisType.toUpperCase()} analysis successful!`);
      console.log(`Duration: ${parsedResult.duration}`);
      console.log('\nResult:');
      console.log(JSON.stringify(parsedResult.result, null, 2));
    } else {
      console.log(`\n❌ ${analysisType.toUpperCase()} analysis failed!`);
      console.log(`Error: ${parsedResult.error}`);
      console.log('\nStack Trace:');
      console.log(parsedResult.stack);
    }
  } catch (parseError) {
    console.error('Error parsing response:', parseError);
    console.log('Raw Response:');
    console.log(result);
  }
} catch (error) {
  console.error('Error executing request:', error.message);
} 