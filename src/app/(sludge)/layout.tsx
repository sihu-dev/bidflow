import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | SludgeAI Pro',
    default: 'SludgeAI Pro - 슬러지 AI 관리 플랫폼',
  },
  description: '씨엠엔텍 유량계 기반 슬러지 처리 시설 AI 모니터링 및 예측 플랫폼',
};

export default function SludgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
    </div>
  );
}
