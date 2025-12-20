import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@forge-labs/types', '@forge-labs/utils', '@forge-labs/ui'],

  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  // API 리다이렉트 (레거시 지원)
  async redirects() {
    return [
      {
        source: '/api/bids/:path*',
        destination: '/api/v1/bids/:path*',
        permanent: true,
      },
    ];
  },

  // 환경 변수 노출 (클라이언트)
  env: {
    NEXT_PUBLIC_APP_NAME: 'BIDFLOW',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },

  // 실험적 기능
  experimental: {
    // Server Actions 활성화
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
