/**
 * 회원가입 페이지 - Dynamic Import 최적화
 */
'use client';

import dynamic from 'next/dynamic';
import { AuthFormSkeleton } from '@/components/auth/AuthFormSkeleton';

const SignupForm = dynamic(
  () => import('@/components/auth/SignupForm').then((mod) => ({ default: mod.SignupForm })),
  {
    loading: () => <AuthFormSkeleton />,
    ssr: false,
  }
);

export default function SignupPage() {
  return <SignupForm />;
}
