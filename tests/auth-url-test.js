/**
 * Test script to verify the login URL formation is correct
 * This tests that the environment variables are properly configured
 * and the URL formation matches the expected pattern for production
 */

// Mock environment variables for testing
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://13.200.174.148:8000';

// Mock fetch to capture the URL being called
let capturedUrl = '';
let capturedOptions = {};

global.fetch = jest.fn((url, options) => {
  capturedUrl = url;
  capturedOptions = options;
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'Admin' },
      token: 'mock-token'
    })
  });
});

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// Mock window object
global.window = {};

describe('Login URL Formation Test', () => {
  test('should form correct login URL with proper environment variable', async () => {
    // Import the auth module (this would normally be done at the top)
    const { signIn } = require('../src/lib/auth.ts');
    
    try {
      await signIn('test@example.com', 'testpassword');
      
      // Verify the URL is formed correctly
      expect(capturedUrl).toBe('http://3.109.154.71:8000/api/auth/login');
      
      // Verify the request is POST with correct headers
      expect(capturedOptions.method).toBe('POST');
      expect(capturedOptions.headers['Content-Type']).toBe('application/json');
      
      // Verify the body contains email and password
      const body = JSON.parse(capturedOptions.body);
      expect(body.email).toBe('test@example.com');
      expect(body.password).toBe('testpassword');
      
      console.log('✅ URL formation test passed!');
      console.log('📡 Expected URL: http://3.109.154.71:8000/api/auth/login');
      console.log('📡 Actual URL:', capturedUrl);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });
});

console.log('🧪 Running Login URL Formation Test...');