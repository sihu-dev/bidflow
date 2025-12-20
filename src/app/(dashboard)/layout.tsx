/**
 * 대시보드 레이아웃
 */

// 정적 생성 비활성화 (Handsontable SSR 호환성)
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
