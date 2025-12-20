import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// 정적 생성 비활성화 (Handsontable SSR 호환성)
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BIDFLOW - 입찰 자동화 시스템',
  description: '제조업 SME를 위한 입찰 자동화 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
