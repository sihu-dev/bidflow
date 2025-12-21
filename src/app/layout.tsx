import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'),
  title: {
    default: 'BIDFLOW - AI 입찰 자동화 플랫폼',
    template: '%s | BIDFLOW',
  },
  description: '45개 플랫폼 실시간 모니터링, AI 매칭, 자동 제안서 생성. 제조업 SME를 위한 스마트 입찰 플랫폼 BIDFLOW',
  keywords: [
    '입찰',
    '자동화',
    'AI',
    '나라장터',
    'G2B',
    'TED',
    'SAM.gov',
    '제조업',
    'SME',
    '공공조달',
    '제안서',
    '입찰공고',
    '스마트조달',
  ],
  authors: [{ name: 'BIDFLOW Team' }],
  creator: 'BIDFLOW',
  publisher: 'BIDFLOW',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'BIDFLOW',
    title: 'BIDFLOW - AI 입찰 자동화 플랫폼',
    description: '45개 플랫폼 실시간 모니터링, AI 매칭, 자동 제안서 생성',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIDFLOW - AI 입찰 자동화 플랫폼',
    description: '45개 플랫폼 실시간 모니터링, AI 매칭, 자동 제안서 생성',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexMono.variable} antialiased`} suppressHydrationWarning>
        {/* Aurora Background */}
        <div className="aurora-bg" aria-hidden="true" />

        {/* Noise Overlay */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* Main Content */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
