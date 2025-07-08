import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  // Your existing Next.js config options here...
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Match any request to /api/...
        destination: 'http://localhost:5000/api/:path*', // Proxy it to your backend
      },
    ];
  },
};

export default nextConfig;
