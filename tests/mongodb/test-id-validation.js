#!/usr/bin/env node

// Simple test script to verify ID handling
const testValidId = (id, expectedValid) => {
  // ObjectId format: 24 character hex string
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  // Simple string format (fallback for mock data): must start and end with alphanumeric, can contain hyphens/underscores
  // But if it's exactly 24 chars and mostly hex, it should be treated as an invalid ObjectId, not a simple string
  const looksLikeObjectId = id.length === 24 && /^[0-9a-fA-F]{20,}/.test(id);
  const isSimpleString = !looksLikeObjectId && /^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$/.test(id) && id !== 'undefined';
  
  const isValid = isObjectId || isSimpleString;
  const result = isValid === expectedValid ? '✅ PASS' : '❌ FAIL';
  console.log(`${result} ID "${id}" -> valid: ${isValid} (ObjectId: ${isObjectId}, SimpleString: ${isSimpleString}, expected: ${expectedValid})`);
  return isValid === expectedValid;
};

console.log('=== ID Validation Tests ===');
let allPassed = true;

// Test valid IDs
allPassed &= testValidId('507f1f77bcf86cd799439011', true);  // Valid ObjectId
allPassed &= testValidId('project-1', true);                // Valid simple string
allPassed &= testValidId('store-2', true);                  // Valid simple string
allPassed &= testValidId('abc123def456', true);             // Valid simple string

// Test invalid IDs
allPassed &= testValidId('undefined', false);               // String "undefined"
allPassed &= testValidId('', false);                        // Empty string
allPassed &= testValidId('507f1f77bcf86cd79943901z', false); // Invalid ObjectId (invalid char)
allPassed &= testValidId('-starts-with-dash', false);       // Starts with dash
allPassed &= testValidId('ends-with-dash-', false);         // Ends with dash
allPassed &= testValidId('has spaces', false);              // Contains spaces
allPassed &= testValidId('has@special!chars', false);       // Special characters
allPassed &= testValidId('a', false);                       // Too short for simple string validation

console.log(`\n=== Overall Result ===`);
console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed!');

process.exit(allPassed ? 0 : 1);