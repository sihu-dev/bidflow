/**
 * 로그인 페이지 - Dynamic Import 최적화
 */
'use client';

import dynamic from 'next/dynamic';
import { AuthFormSkeleton } from '@/components/auth/AuthFormSkeleton';

const LoginForm = dynamic(
  () => import('@/components/auth/LoginForm').then((mod) => ({ default: mod.LoginForm })),
  {
    loading: () => <AuthFormSkeleton />,
    ssr: false,
  }
);

export default function LoginPage() {
  return <LoginForm />;
}
