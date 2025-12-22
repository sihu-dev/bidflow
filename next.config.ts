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
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Webpack 설정 - 번들 최적화
  webpack: (config, { isServer }) => {
    // Radix UI 선택적 임포트 최적화
    config.resolve.alias = {
      ...config.resolve.alias,
      '@radix-ui/react-icons': '@radix-ui/react-icons/dist/react-icons.esm.js',
    };

    // 클라이언트 번들 최적화
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Radix UI 분리
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              priority: 10,
            },
            // ECharts 분리
            echarts: {
              test: /[\\/]node_modules[\\/]echarts/,
              name: 'echarts',
              priority: 10,
            },
            // Supabase 분리
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 10,
            },
          },
        },
      };
    }

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
