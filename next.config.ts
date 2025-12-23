import type { NextConfig } from 'next';
import path from 'path';
import bundleAnalyzer from '@next/bundle-analyzer';
// NOTE: next-intl 미들웨어는 app/[locale] 구조 전환 후 활성화
// import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 소스 디렉토리 설정
  distDir: '.next',

  // 현재 디렉토리를 워크스페이스 루트로 명시 (부모 lockfile 무시)
  outputFileTracingRoot: path.resolve(__dirname),

  // 서버 외부 패키지 설정 (Handsontable SSR 호환성)
  serverExternalPackages: ['handsontable', '@handsontable/react'],

  // 실험적 기능
  experimental: {
    // App Router 설정
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 정적 생성 제외 페이지
  generateBuildId: async () => 'bidflow-build',

  // 페이지 최적화 설정 - Handsontable 호환성
  typescript: {
    ignoreBuildErrors: false,
  },
  // NOTE: eslint config moved to eslint.config.mjs in Next.js 16

  // Turbopack 설정 (Next.js 16 기본)
  turbopack: {},

  // Webpack 설정 (fallback)
  webpack: (config) => {
    return config;
  },

  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.upstash.io wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },

  // API 리다이렉트 (레거시)
  async redirects() {
    return [
      {
        source: '/api/bids/:path*',
        destination: '/api/v1/bids/:path*',
        permanent: true,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_APP_NAME: 'BIDFLOW',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },
};

// i18n 미들웨어 비활성화 (app/[locale] 구조 전환 후 활성화)
// export default withNextIntl(withBundleAnalyzer(nextConfig));
export default withBundleAnalyzer(nextConfig);
