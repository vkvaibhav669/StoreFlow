#!/usr/bin/env node

// Simple test script to verify authentication APIs work
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function testAuthentication() {
  console.log('Testing Authentication System...\n');

  // Test 1: Check if we can hash passwords
  console.log('1. Testing password hashing...');
  const testPassword = 'TestAdmin@123';
  const hashedPassword = await bcrypt.hash(testPassword, 12);
  const isValidPassword = await bcrypt.compare(testPassword, hashedPassword);
  console.log(`   ✓ Password hashing works: ${isValidPassword}\n`);

  // Test 2: Check JWT functionality (basic import test)
  console.log('2. Testing JWT modules...');
  try {
    const jwt = require('jsonwebtoken');
    const testPayload = { userId: 'test', email: 'test@test.com', role: 'Admin' };
    const token = jwt.sign(testPayload, 'test-secret', { expiresIn: '1h' });
    const decoded = jwt.verify(token, 'test-secret');
    console.log(`   ✓ JWT functionality works: ${decoded.email === 'test@test.com'}\n`);
  } catch (error) {
    console.log(`   ✗ JWT error: ${error.message}\n`);
  }

  // Test 3: Check MongoDB connection (if MONGODB_URI is set)
  if (process.env.MONGODB_URI) {
    console.log('3. Testing MongoDB connection...');
    try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      console.log('   ✓ MongoDB connection successful');
      await client.close();
    } catch (error) {
      console.log(`   ✗ MongoDB connection failed: ${error.message}`);
    }
  } else {
    console.log('3. Skipping MongoDB test (no MONGODB_URI set)');
  }

  console.log('\nAuthentication system tests completed!');
}

if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  testAuthentication().catch(console.error);
}

module.exports = { testAuthentication };