#!/usr/bin/env node

/**
 * StoreFlow MongoDB ID Handling Demo
 * 
 * This script demonstrates how the improved ID handling works with both
 * MongoDB ObjectIds and simple string IDs from mock data.
 */

console.log('🚀 StoreFlow MongoDB ID Handling Demo\n');

// Simulate the validation logic from our implementation
function validateId(id) {
  if (!id || id.trim() === '' || id === 'undefined') {
    return { valid: false, reason: 'Empty or undefined ID' };
  }

  const trimmedId = id.trim();
  
  // ObjectId format: 24 character hex string
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmedId);
  
  // Simple string format with better validation
  const looksLikeObjectId = trimmedId.length === 24 && /^[0-9a-fA-F]{20,}/.test(trimmedId);
  const isSimpleString = !looksLikeObjectId && 
                         /^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$/.test(trimmedId) && 
                         trimmedId !== 'undefined';

  if (isObjectId) {
    return { valid: true, type: 'MongoDB ObjectId', reason: 'Valid 24-character hex string' };
  } else if (isSimpleString) {
    return { valid: true, type: 'Simple String ID', reason: 'Valid alphanumeric with hyphens/underscores' };
  } else {
    return { valid: false, reason: 'Invalid format' };
  }
}

// Test cases demonstrating the solution
const testCases = [
  // Valid MongoDB ObjectIds
  { id: '507f1f77bcf86cd799439011', description: 'Valid MongoDB ObjectId from database' },
  { id: '64f8a1b2c3d4e5f6a7b8c9d0', description: 'Another valid ObjectId' },
  
  // Valid simple string IDs (mock data)
  { id: 'project-1', description: 'Mock project ID' },
  { id: 'store-2', description: 'Mock store ID' },
  { id: 'user123', description: 'Simple user ID' },
  
  // Invalid IDs that caused the original problem
  { id: 'undefined', description: 'String "undefined" that caused URL issues' },
  { id: '', description: 'Empty string' },
  { id: '507f1f77bcf86cd79943901z', description: 'Invalid ObjectId (bad character)' },
  { id: '-invalid-start', description: 'Invalid: starts with hyphen' },
  { id: 'invalid-end-', description: 'Invalid: ends with hyphen' },
  { id: 'has spaces', description: 'Invalid: contains spaces' },
  { id: 'special@chars!', description: 'Invalid: special characters' },
];

console.log('📋 Testing ID Validation:');
console.log('═'.repeat(80));

testCases.forEach(({ id, description }) => {
  const result = validateId(id);
  const status = result.valid ? '✅' : '❌';
  const type = result.type ? ` (${result.type})` : '';
  
  console.log(`${status} "${id}"`);
  console.log(`   ${description}`);
  console.log(`   Result: ${result.reason}${type}\n`);
});

console.log('🔧 How the Solution Works:');
console.log('═'.repeat(50));
console.log(`
1. **Frontend Validation**: Pages validate IDs before making API calls
   - Supports MongoDB ObjectId format (24-char hex)
   - Supports simple string format for mock data
   - Rejects "undefined" strings and invalid formats

2. **API Route Enhancement**: Routes handle both MongoDB and mock data
   - Try MongoDB first if ID looks like ObjectId
   - Fall back to mock data for simple string IDs
   - Graceful error handling

3. **Document Transformation**: MongoDB docs converted to frontend format
   - _id field → id field
   - ObjectId → string conversion
   - Consistent data structure

4. **Error Prevention**: Multiple layers of validation
   - Frontend: ID format validation
   - API: Parameter validation
   - Database: ObjectId validation
`);

console.log('🎯 Benefits:');
console.log('═'.repeat(30));
console.log(`
✅ No more "undefined" in URLs
✅ Proper MongoDB ObjectId support
✅ Backward compatibility with mock data
✅ Type-safe ID validation
✅ Graceful error handling
✅ Clear error messages for debugging
`);

console.log('🚀 Demo completed successfully!');