/**
 * 마케팅 페이지 레이아웃
 */
import { headers, cookies } from 'next/headers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TenantProvider } from '@/contexts/TenantContext';
import { getTenantConfig, extractTenantId, TENANTS } from '@/config/tenants';

const TENANT_COOKIE = 'bidflow_tenant';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 서버에서 테넌트 감지 (쿠키 > 서브도메인 순)
  const cookieStore = await cookies();
  const headersList = await headers();

  // 1. 쿠키에서 테넌트 확인
  const tenantCookie = cookieStore.get(TENANT_COOKIE)?.value;
  if (tenantCookie && TENANTS[tenantCookie]) {
    const tenant = getTenantConfig(tenantCookie);
    return (
      <TenantProvider tenant={tenant}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </TenantProvider>
    );
  }

  // 2. 서브도메인에서 테넌트 확인
  const hostname = headersList.get('host');
  const tenantId = extractTenantId(null, hostname);
  const tenant = getTenantConfig(tenantId);

  return (
    <TenantProvider tenant={tenant}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </TenantProvider>
  );
}
