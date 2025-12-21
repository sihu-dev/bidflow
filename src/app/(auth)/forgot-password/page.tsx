/**
 * 비밀번호 찾기 페이지 - Dynamic Import 최적화
 */
'use client';

import dynamic from 'next/dynamic';
import { AuthFormSkeleton } from '@/components/auth/AuthFormSkeleton';

const ForgotPasswordForm = dynamic(
  () => import('@/components/auth/ForgotPasswordForm').then((mod) => ({ default: mod.ForgotPasswordForm })),
  {
    loading: () => <AuthFormSkeleton />,
    ssr: false,
  }
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
