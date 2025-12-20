/**
 * 제안서 자동 생성 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { FileText, Wand2, FileCheck, Edit, Download, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.proposal);

const templates = [
  { name: '기술 제안서', description: '기술적 요구사항 충족 제안', status: 'available' },
  { name: '가격 제안서', description: '가격 산출 및 견적 제안', status: 'available' },
  { name: '사업 수행 계획서', description: '프로젝트 수행 방안', status: 'available' },
  { name: '실적 증명서', description: '유사 실적 정리', status: 'available' },
  { name: '회사 소개서', description: '기업 역량 소개', status: 'beta' },
  { name: '커스텀 템플릿', description: '맞춤 양식 등록', status: 'enterprise' },
];

const generationProcess = [
  {
    icon: FileCheck,
    title: '공고 분석',
    description: '제안서 요구사항, 평가 기준, 배점표를 자동으로 분석합니다.',
  },
  {
    icon: Wand2,
    title: 'AI 초안 생성',
    description: '분석 결과와 회사 정보를 바탕으로 제안서 초안을 작성합니다.',
  },
  {
    icon: Edit,
    title: '사용자 편집',
    description: '생성된 초안을 검토하고 필요한 부분을 수정합니다.',
  },
  {
    icon: Download,
    title: '내보내기',
    description: 'Word, PDF 형식으로 내보내어 제출합니다.',
  },
];

const features = [
  '공고 맞춤 내용 자동 구성',
  '회사 정보 자동 삽입',
  '기술 사양 표 자동 생성',
  '경쟁력 어필 포인트 제안',
  '배점 항목별 최적화',
  '맞춤법/문법 자동 검수',
];

export default function ProposalPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">AI 기능</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              제안서 초안<br />자동 생성
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              공고 분석 결과를 바탕으로 제안서 초안을 AI가 자동으로 작성합니다.
              며칠 걸리던 제안서 작성을 몇 시간으로 단축하세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">모든 기능 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Generation Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">생성 프로세스</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {generationProcess.map((item, index) => (
              <div key={item.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">제공 템플릿</h2>
            <p className="text-muted-foreground text-center mb-12">
              다양한 제안서 템플릿을 제공합니다
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.name} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge
                      variant={
                        template.status === 'available'
                          ? 'default'
                          : template.status === 'beta'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {template.status === 'available'
                        ? '제공'
                        : template.status === 'beta'
                        ? 'Beta'
                        : 'Enterprise'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border flex items-center justify-center order-2 lg:order-1">
                <span className="text-muted-foreground">에디터 스크린샷</span>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold mb-6">주요 기능</h2>
                <ul className="space-y-4">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-neutral-700 mt-0.5 flex-shrink-0" />
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            제안서 작성 시간을 80% 단축하세요
          </h2>
          <p className="opacity-90 mb-8">
            AI가 초안을 작성하면 당신은 검토만 하면 됩니다.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: 'AI 매칭 분석', href: '/features/ai-matching' }}
        next={{ label: '스마트 알림', href: '/features/alerts' }}
      />
    </>
  );
}
