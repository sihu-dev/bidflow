/**
 * 인증 페이지 레이아웃
 */
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto">
          <Logo showBeta={false} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} BIDFLOW.{' '}
          <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
          {' · '}
          <Link href="/terms" className="hover:underline">이용약관</Link>
        </p>
      </footer>
    </div>
  );
}
