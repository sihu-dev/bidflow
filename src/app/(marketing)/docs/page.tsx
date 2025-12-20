/**
 * 문서 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Book, Rocket, Code, Lightbulb, FileText, Video, ArrowRight } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.resources.docs);

const quickStart = [
  { title: '계정 만들기', description: '무료로 BIDFLOW 계정을 생성하세요.', time: '2분' },
  { title: '제품 등록', description: '귀사의 제품/서비스 정보를 등록하세요.', time: '5분' },
  { title: '플랫폼 연동', description: '수집할 입찰 플랫폼을 선택하세요.', time: '3분' },
  { title: '알림 설정', description: '키워드 및 알림 조건을 설정하세요.', time: '5분' },
];

const guides = [
  {
    icon: Rocket,
    title: '시작하기',
    description: 'BIDFLOW 첫 사용자를 위한 가이드',
    articles: ['계정 생성', '초기 설정', '첫 공고 확인하기'],
  },
  {
    icon: FileText,
    title: '공고 관리',
    description: '공고 수집 및 관리 방법',
    articles: ['공고 필터링', '상태 관리', '메모 및 태그'],
  },
  {
    icon: Lightbulb,
    title: 'AI 기능',
    description: 'AI 기반 분석 및 자동화 기능',
    articles: ['매칭 분석', '제안서 생성', 'AI 설정'],
  },
  {
    icon: Code,
    title: 'API 가이드',
    description: 'REST API 사용법',
    articles: ['인증', '엔드포인트', '웹훅'],
  },
];

const resources = [
  {
    icon: Book,
    title: 'API 레퍼런스',
    description: 'REST API 전체 문서',
    link: '/docs/api',
  },
  {
    icon: Video,
    title: '튜토리얼 영상',
    description: '단계별 사용법 영상 가이드',
    link: '/docs/tutorials',
  },
  {
    icon: FileText,
    title: 'FAQ',
    description: '자주 묻는 질문과 답변',
    link: '/support',
  },
];

export default function DocsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              문서
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              BIDFLOW 문서
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              BIDFLOW를 시작하고 활용하는 데 필요한<br />
              모든 정보를 찾아보세요.
            </p>
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="search"
                  placeholder="문서 검색..."
                  className="w-full px-4 py-3 rounded-lg border bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">빠른 시작 (~15분)</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {quickStart.map((step, index) => (
                <div key={step.title} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">{step.time}</span>
                  </div>
                  <h3 className="font-medium mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">가이드</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {guides.map((guide) => (
                <div key={guide.title} className="p-6 rounded-xl border bg-card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <guide.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{guide.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                      <ul className="space-y-2">
                        {guide.articles.map((article) => (
                          <li key={article}>
                            <Link
                              href="#"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <ArrowRight className="w-3 h-3" />
                              {article}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">추가 리소스</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.link}
                  className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow text-center"
                >
                  <resource.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            찾으시는 내용이 없나요?
          </h2>
          <p className="text-muted-foreground mb-8">
            고객 지원팀에 문의하시면 도움을 드리겠습니다.
          </p>
          <Button asChild>
            <Link href="/support">고객 지원 문의</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
