import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BIDFLOW - AI 입찰 자동화 플랫폼',
  description: '제조업 SME를 위한 AI 기반 입찰 자동화 서비스. 나라장터, TED, SAM.gov 공고를 자동 수집하고 분석합니다.',
  keywords: ['입찰', '자동화', 'AI', '나라장터', 'TED', 'SAM.gov', '제조업', 'SME'],
  openGraph: {
    title: 'BIDFLOW - AI 입찰 자동화 플랫폼',
    description: '제조업 SME를 위한 AI 기반 입찰 자동화 서비스',
    type: 'website',
    locale: 'ko_KR',
  },
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
