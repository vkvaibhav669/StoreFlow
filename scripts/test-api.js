#!/usr/bin/env node

// Test authentication API endpoints
async function testAuthAPIs() {
  const baseUrl = 'http://localhost:8000';
  
  console.log('Testing Authentication API Endpoints...\n');

  // Test 1: Login API with invalid credentials (should fail gracefully)
  console.log('1. Testing login API with invalid credentials...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      }),
    });

    const data = await response.json();
    
    if (!response.ok && data.error) {
      console.log('   ✓ Login API correctly rejects invalid credentials');
      console.log(`   Response: ${response.status} - ${data.error}\n`);
    } else {
      console.log('   ✗ Login API should have rejected invalid credentials\n');
    }
  } catch (error) {
    console.log(`   ✗ Login API error: ${error.message}\n`);
  }

  // Test 2: Logout API without token (should fail gracefully)
  console.log('2. Testing logout API without token...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok && data.error) {
      console.log('   ✓ Logout API correctly rejects request without token');
      console.log(`   Response: ${response.status} - ${data.error}\n`);
    } else {
      console.log('   ✗ Logout API should have rejected request without token\n');
    }
  } catch (error) {
    console.log(`   ✗ Logout API error: ${error.message}\n`);
  }

  // Test 3: Check if API endpoints are accessible
  console.log('3. Testing API endpoint accessibility...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body to test validation
    });

    if (response.status === 400) {
      console.log('   ✓ API endpoints are accessible and validating input');
    } else {
      console.log(`   ! API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ✗ API endpoint error: ${error.message}`);
  }

  console.log('\nAPI endpoint tests completed!');
}

// Give the server a moment to start up, then run tests
setTimeout(() => {
  testAuthAPIs().catch(console.error);
}, 2000);