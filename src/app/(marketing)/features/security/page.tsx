/**
 * 보안 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { Shield, Lock, Key, Eye, Server, FileCheck, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.security);

const securityFeatures = [
  {
    icon: Lock,
    title: '데이터 암호화',
    description: '전송 중(TLS 1.3) 및 저장 중(AES-256) 모든 데이터 암호화',
  },
  {
    icon: Key,
    title: '안전한 인증',
    description: 'OAuth 2.0, API Key, SSO/SAML 지원',
  },
  {
    icon: Eye,
    title: '감사 로그',
    description: '모든 활동에 대한 상세 로그 기록 및 추적',
  },
  {
    icon: Server,
    title: '인프라 보안',
    description: 'AWS/GCP 기반 엔터프라이즈급 인프라',
  },
];

const compliance = [
  { name: 'SOC 2 Type II', status: 'certified', description: '보안 운영 인증' },
  { name: 'ISO 27001', status: 'certified', description: '정보보안 관리체계' },
  { name: 'GDPR', status: 'compliant', description: 'EU 개인정보보호규정 준수' },
  { name: 'KISA ISMS', status: 'in-progress', description: '한국 정보보호관리체계' },
];

const securityPractices = [
  { title: 'Rate Limiting', description: 'API 남용 방지를 위한 요청 제한' },
  { title: 'CSRF 보호', description: '크로스 사이트 요청 위조 방지' },
  { title: 'SQL Injection 방지', description: '파라미터화된 쿼리 사용' },
  { title: 'XSS 방지', description: '입출력 데이터 이스케이프 처리' },
  { title: 'Prompt Injection 방지', description: 'AI 입력값 검증 및 필터링' },
  { title: '정기 보안 감사', description: '외부 전문 기관 취약점 점검' },
];

const enterpriseFeatures = [
  'SSO/SAML 통합 인증',
  'IP 화이트리스팅',
  '역할 기반 접근 제어 (RBAC)',
  '데이터 보존 정책 설정',
  '전용 인프라 옵션',
  '24/7 보안 모니터링',
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">엔터프라이즈</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              보안 & 규정 준수
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              엔터프라이즈급 보안으로 귀사의 데이터를 안전하게 보호합니다.
              글로벌 보안 표준을 준수하며 정기적인 보안 감사를 수행합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/contact">영업팀 문의</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">보안 문서</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">보안 기능</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl bg-card border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">규정 준수</h2>
            <p className="text-muted-foreground text-center mb-12">
              글로벌 보안 표준을 준수합니다
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {compliance.map((item) => (
                <div key={item.name} className="p-6 rounded-xl border bg-card flex items-start gap-4">
                  <FileCheck className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge
                        variant={item.status === 'certified' ? 'default' :
                                 item.status === 'compliant' ? 'secondary' : 'outline'}
                      >
                        {item.status === 'certified' ? '인증' :
                         item.status === 'compliant' ? '준수' : '진행 중'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">보안 실천 사항</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityPractices.map((practice) => (
                <div key={practice.title} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neutral-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{practice.title}</h4>
                      <p className="text-sm text-muted-foreground">{practice.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4">Enterprise</Badge>
                <h2 className="text-3xl font-bold mb-4">엔터프라이즈 보안</h2>
                <p className="text-muted-foreground mb-6">
                  대규모 조직을 위한 고급 보안 기능을 제공합니다.
                  전담 보안팀과 함께 귀사의 보안 요구사항을 충족시킵니다.
                </p>
                <ul className="space-y-3">
                  {enterpriseFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-neutral-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8" asChild>
                  <Link href="/contact">Enterprise 문의</Link>
                </Button>
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">99.9%</h3>
                  <p className="text-muted-foreground">SLA 가용성 보장</p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xl font-bold">24/7</p>
                    <p className="text-xs text-muted-foreground">모니터링</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xl font-bold">&lt;1h</p>
                    <p className="text-xs text-muted-foreground">응답 시간</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: 'REST API', href: '/features/api' }}
        next={{ label: '모든 기능 보기', href: '/features' }}
      />
    </>
  );
}
