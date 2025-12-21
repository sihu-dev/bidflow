'use client';

/**
 * @module contexts/TenantContext
 * @description 동적 화이트라벨 테넌트 컨텍스트
 */

import { createContext, useContext, type ReactNode } from 'react';
import { type TenantConfig, DEFAULT_TENANT } from '@/config/tenants';

// ============================================================================
// Context 정의
// ============================================================================

interface TenantContextValue {
  tenant: TenantConfig;
  isDefault: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: DEFAULT_TENANT,
  isDefault: true,
});

// ============================================================================
// Provider
// ============================================================================

interface TenantProviderProps {
  tenant: TenantConfig;
  children: ReactNode;
}

export function TenantProvider({ tenant, children }: TenantProviderProps) {
  const isDefault = tenant.id === 'bidflow';

  return (
    <TenantContext.Provider value={{ tenant, isDefault }}>
      {children}
    </TenantContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * 현재 테넌트 설정 조회
 */
export function useTenant(): TenantConfig {
  const context = useContext(TenantContext);
  return context.tenant;
}

/**
 * 테넌트 컨텍스트 전체 조회
 */
export function useTenantContext(): TenantContextValue {
  return useContext(TenantContext);
}

/**
 * 테넌트 브랜딩 조회
 */
export function useTenantBranding() {
  const { tenant } = useContext(TenantContext);
  return tenant.branding;
}

/**
 * 테넌트 Hero 설정 조회
 */
export function useTenantHero() {
  const { tenant } = useContext(TenantContext);
  return tenant.hero;
}

/**
 * 테넌트 제품 목록 조회
 */
export function useTenantProducts() {
  const { tenant } = useContext(TenantContext);
  return tenant.products || [];
}

/**
 * 테넌트 키워드 조회
 */
export function useTenantKeywords() {
  const { tenant } = useContext(TenantContext);
  return tenant.keywords || [];
}
