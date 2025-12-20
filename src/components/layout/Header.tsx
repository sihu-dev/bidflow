/**
 * 마케팅 페이지 헤더
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string; description?: string }[];
}

const navLinks: NavItem[] = [
  {
    href: '/features',
    label: '기능',
    children: [
      { href: '/features', label: '기능 개요', description: '모든 기능 한눈에' },
      { href: '/features/collection', label: '공고 수집', description: '멀티 플랫폼 자동 수집' },
      { href: '/features/ai-matching', label: 'AI 매칭', description: 'AI 기반 적합도 분석' },
      { href: '/features/proposal', label: '제안서 생성', description: 'AI 자동 작성' },
      { href: '/features/alerts', label: '스마트 알림', description: '마감 및 새 공고 알림' },
    ],
  },
  {
    href: '/use-cases',
    label: '활용사례',
    children: [
      { href: '/use-cases', label: '산업별 사례', description: '다양한 활용 사례' },
      { href: '/use-cases/manufacturing', label: '제조업', description: '유량계, 장비 제조' },
      { href: '/use-cases/construction', label: '건설업', description: '토목, 건축, 플랜트' },
      { href: '/use-cases/it-services', label: 'IT 서비스', description: 'SI, SW 개발' },
    ],
  },
  {
    href: '/integrations',
    label: '연동',
    children: [
      { href: '/integrations', label: '연동 플랫폼', description: '지원 플랫폼 목록' },
      { href: '/integrations/narajangto', label: '나라장터', description: '한국 G2B' },
      { href: '/integrations/ted', label: 'TED', description: 'EU 공공조달' },
      { href: '/integrations/samgov', label: 'SAM.gov', description: '미국 연방조달' },
    ],
  },
  { href: '/pricing', label: '요금제' },
  {
    href: '/docs',
    label: '리소스',
    children: [
      { href: '/docs', label: '문서', description: '가이드 및 API' },
      { href: '/support', label: '고객 지원', description: 'FAQ 및 문의' },
      { href: '/research', label: '연구팀', description: '데이터 분석 전문팀' },
      { href: '/about', label: '회사 소개', description: 'BIDFLOW 소개' },
    ],
  },
];

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" showBeta />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group">
                {link.children ? (
                  <>
                    <button
                      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      aria-haspopup="true"
                      aria-expanded="false"
                      aria-label={`${link.label} 메뉴 열기`}
                    >
                      {link.label}
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="w-56 p-2 rounded-lg border bg-background shadow-lg">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
                          >
                            <span className="block text-sm font-medium">{child.label}</span>
                            {child.description && (
                              <span className="block text-xs text-muted-foreground">{child.description}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">무료로 시작하기</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t max-h-[70vh] overflow-y-auto">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.href}>
                  {link.children ? (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                        {link.label}
                      </span>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="block px-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">로그인</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/signup">무료로 시작하기</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
