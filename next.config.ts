
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: [
    'local-origin.dev', 
    '*.local-origin.dev', 
    '8000-firebase-studio-1746690261773.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev',
    '6000-firebase-studio-1746690261773.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev',
    'http://0.0.0.0:8000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ], 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
