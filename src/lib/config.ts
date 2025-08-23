/**
 * Configuration utility to get environment-aware API URLs
 * This ensures the correct port (8000) is used depending on NODE_ENV
 */

const getApiBaseUrl = (): string => {
  // In development, use port 8000 (as defined in package.json dev script)
  // In production, use the environment variable or fallback to port 8000
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Development: Use localhost:8000 since that's where the dev server runs
    return 'http://localhost:8000';
  }
  
  // Production/other environments: Use environment variable or fallback to port 8000
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
};

const getApiUrl = (): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api`;
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  apiUrl: getApiUrl(),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export default config;