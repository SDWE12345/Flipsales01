// next.config.js - Optimized Next.js Configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // API optimizations
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },

  // Performance optimizations
  compress: true,
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      // Add your image hosting domains here
      'example.com',
      'images.example.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Environment variables that should be available on client side
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    poweredByHeader: false,
    generateEtags: true,
  }),
};

module.exports = nextConfig;