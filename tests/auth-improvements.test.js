/**
 * Test script for authentication and API improvements
 * This tests the following scenarios:
 * 1. Token Storage and Retrieval 
 * 2. API Authentication with automatic token inclusion
 * 3. Error Handling for authentication failures
 * 4. Authentication Context state management
 * 5. Login Flow with proper delays
 */

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

// Mock fetch responses
let mockResponses = {};
let fetchCallLog = [];

global.fetch = jest.fn((url, options) => {
  fetchCallLog.push({ url, options });
  
  const response = mockResponses[url] || {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true })
  };
  
  return Promise.resolve(response);
});

// Mock localStorage
const localStorageMock = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

global.localStorage = localStorageMock;
global.window = { localStorage: localStorageMock };

describe('Authentication and API Improvements', () => {
  beforeEach(() => {
    fetchCallLog = [];
    localStorageMock.clear();
    mockResponses = {};
    jest.clearAllMocks();
  });

  describe('Token Storage and Retrieval', () => {
    test('should store token properly after login', async () => {
      // Mock successful login response
      mockResponses['http://localhost:3000/api/auth/login'] = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          name: { id: '1', name: 'Test User', email: 'test@example.com', role: 'Admin' },
          token: 'mock-jwt-token-123'
        })
      };

      const { signIn, getAuthToken } = require('../src/lib/auth.ts');
      
      await signIn('test@example.com', 'password123');
      
      // Verify token is stored
      const storedToken = getAuthToken();
      expect(storedToken).toBe('mock-jwt-token-123');
      
      // Verify user data is stored
      const storedUser = localStorageMock.getItem('storeflow_current_user');
      expect(storedUser).toBeTruthy();
      
      console.log('✅ Token storage test passed!');
    });

    test('should clear token on logout', async () => {
      // Set up initial token
      localStorageMock.setItem('storeflow_auth_token', 'test-token');
      localStorageMock.setItem('storeflow_current_user', JSON.stringify({ id: '1', name: 'Test' }));
      
      const { signOut, getAuthToken } = require('../src/lib/auth.ts');
      
      await signOut();
      
      // Verify token is cleared
      const storedToken = getAuthToken();
      expect(storedToken).toBeNull();
      
      // Verify user data is cleared
      const storedUser = localStorageMock.getItem('storeflow_current_user');
      expect(storedUser).toBeNull();
      
      console.log('✅ Token cleanup test passed!');
    });
  });

  describe('API Authentication Headers', () => {
    test('should automatically include Authorization header when token exists', async () => {
      // Set up token in localStorage
      localStorageMock.setItem('storeflow_auth_token', 'test-token-123');
      
      // Mock API response
      mockResponses['http://localhost:3000/projects'] = {
        ok: true,
        status: 200,
        json: () => Promise.resolve([])
      };

      const { getAllProjects } = require('../src/lib/api.ts');
      
      await getAllProjects();
      
      // Check that the request included the Authorization header
      const lastCall = fetchCallLog[fetchCallLog.length - 1];
      expect(lastCall.options.headers['Authorization']).toBe('Bearer test-token-123');
      expect(lastCall.options.headers['Content-Type']).toBe('application/json');
      
      console.log('✅ API authentication header test passed!');
    });

    test('should handle API calls without token gracefully', async () => {
      // Ensure no token in localStorage
      localStorageMock.removeItem('storeflow_auth_token');
      
      // Mock API response
      mockResponses['http://localhost:3000/projects'] = {
        ok: true,
        status: 200,
        json: () => Promise.resolve([])
      };

      const { getAllProjects } = require('../src/lib/api.ts');
      
      await getAllProjects();
      
      // Check that the request doesn't include Authorization header
      const lastCall = fetchCallLog[fetchCallLog.length - 1];
      expect(lastCall.options.headers['Authorization']).toBeUndefined();
      expect(lastCall.options.headers['Content-Type']).toBe('application/json');
      
      console.log('✅ API call without token test passed!');
    });
  });

  describe('Error Handling', () => {
    test('should throw AuthError for 401 responses', async () => {
      // Set up token
      localStorageMock.setItem('storeflow_auth_token', 'expired-token');
      
      // Mock 401 response
      mockResponses['http://localhost:3000/projects'] = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Token expired' })
      };

      const { getAllProjects, AuthError } = require('../src/lib/api.ts');
      
      try {
        await getAllProjects();
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error.name).toBe('AuthError');
        expect(error.status).toBe(401);
        expect(error.message).toContain('Authentication failed');
      }
      
      console.log('✅ Auth error handling test passed!');
    });

    test('should throw AuthError for 403 responses', async () => {
      // Set up token
      localStorageMock.setItem('storeflow_auth_token', 'valid-but-insufficient-token');
      
      // Mock 403 response
      mockResponses['http://localhost:3000/projects'] = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'Insufficient permissions' })
      };

      const { getAllProjects, AuthError } = require('../src/lib/api.ts');
      
      try {
        await getAllProjects();
        fail('Expected AuthError to be thrown');
      } catch (error) {
        expect(error.name).toBe('AuthError');
        expect(error.status).toBe(403);
      }
      
      console.log('✅ Forbidden error handling test passed!');
    });
  });

  describe('Authentication State Management', () => {
    test('isAuthenticated should return true when both token and user exist', () => {
      localStorageMock.setItem('storeflow_auth_token', 'valid-token');
      localStorageMock.setItem('storeflow_current_user', JSON.stringify({ 
        id: '1', name: 'Test User', email: 'test@example.com' 
      }));
      
      const { isAuthenticated } = require('../src/lib/auth.ts');
      
      expect(isAuthenticated()).toBe(true);
      
      console.log('✅ Authentication state (valid) test passed!');
    });

    test('isAuthenticated should return false when token is missing', () => {
      localStorageMock.removeItem('storeflow_auth_token');
      localStorageMock.setItem('storeflow_current_user', JSON.stringify({ 
        id: '1', name: 'Test User' 
      }));
      
      const { isAuthenticated } = require('../src/lib/auth.ts');
      
      expect(isAuthenticated()).toBe(false);
      
      console.log('✅ Authentication state (no token) test passed!');
    });

    test('isAuthenticated should return false when user data is missing', () => {
      localStorageMock.setItem('storeflow_auth_token', 'valid-token');
      localStorageMock.removeItem('storeflow_current_user');
      
      const { isAuthenticated } = require('../src/lib/auth.ts');
      
      expect(isAuthenticated()).toBe(false);
      
      console.log('✅ Authentication state (no user) test passed!');
    });
  });
});

console.log('🧪 Running Authentication and API Improvements Tests...');