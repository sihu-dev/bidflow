/**
 * 연구팀 포트폴리오 페이지
 * Supabase 스타일 미니멀 디자인
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '연구팀 | BIDFLOW',
  description: 'KAIST 연계 데이터 분석 및 예측 전문 연구팀',
};

// 연구 분야
const researchAreas = [
  {
    title: '확률적 미래 예측',
    description: 'Probabilistic Forecasting Methods',
    applications: ['입찰 낙찰률 예측', '시장 수요 예측', '가격 변동 분석'],
  },
  {
    title: '통계적 리스크 추정',
    description: 'Statistical Risk Estimation',
    applications: ['입찰 리스크 평가', '경쟁사 분석', '의사결정 지원'],
  },
  {
    title: '데이터 기반 의사결정',
    description: 'Data-Driven Decision Making',
    applications: ['공고 매칭', '우선순위 도출', '자동화 시스템'],
  },
  {
    title: '시계열 분석 & 예측',
    description: 'Time Series & Forecasting',
    applications: ['공고 트렌드 분석', '예산 사이클 예측', '시장 동향 파악'],
  },
];

// 연구 프로젝트
const projects = [
  {
    title: '2차시장 가치평가모형 개발',
    partner: '차란-마인이즈',
    type: '산학협력',
    status: 'active',
  },
  {
    title: '풍력발전량 예측 기반 VPP 플랫폼',
    partner: '중소벤처기업부, 브이피피랩',
    type: '정부과제',
    status: 'active',
  },
  {
    title: '생명보험 시장 예측',
    partner: '교보생명, 디플래닉스',
    type: '산학협력',
    status: 'active',
  },
  {
    title: '관세청 조기경보시스템 고도화',
    partner: '관세청',
    type: '정부과제',
    status: 'active',
  },
  {
    title: '안구건조증 진단 시스템',
    partner: '삼성의료원',
    type: '의료AI',
    status: 'active',
  },
];

// 교육 프로그램
const courses = [
  {
    code: 'GFS701',
    title: 'Quantitative Research Methodology',
    description: '정량적 연구 방법론',
  },
  {
    code: 'FS693',
    title: 'Time Series & AI Forecasting',
    description: '시계열 분석 및 예측',
  },
];

// 연구팀 현황
const teamStats = [
  { label: 'PhD 졸업', value: 3 },
  { label: 'PhD 재학', value: 9 },
  { label: 'MSc 졸업', value: 12 },
  { label: 'MSc 재학', value: 13 },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">Research Team</Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              데이터 분석 & 예측 전문 연구팀
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              KAIST 문술대학원 연계 연구팀으로, 확률적 예측 모형과
              데이터 기반 의사결정 시스템을 개발합니다.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Seoul National University</span>
              <span className="text-slate-300">|</span>
              <span>London Business School</span>
              <span className="text-slate-300">|</span>
              <span>University of Oxford</span>
            </div>
          </div>
        </div>
      </section>

      {/* 팀 현황 */}
      <section className="border-b bg-slate-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-slate-900 font-mono">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 연구 분야 */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">연구 분야</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {researchAreas.map((area) => (
              <div key={area.title} className="p-6 border rounded-lg hover:border-slate-400 transition-colors">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{area.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{area.description}</p>
                <div className="flex flex-wrap gap-2">
                  {area.applications.map((app) => (
                    <Badge key={app} variant="outline" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 연구 프로젝트 */}
      <section className="border-b bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">연구 프로젝트</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.title} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900">{project.title}</h3>
                  <p className="text-sm text-slate-500">{project.partner}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{project.type}</Badge>
                  <span className="w-2 h-2 bg-neutral-500 rounded-full" title="Active"></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 교육 과정 */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">교육 과정</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.code} className="p-6 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-sm font-mono text-slate-500">{course.code}</code>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                <p className="text-sm text-slate-500">{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIDFLOW 적용 */}
      <section className="border-b bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">BIDFLOW에 적용된 연구 역량</h2>
            <p className="text-slate-400 mb-8">
              입찰 시장 예측, 경쟁 분석, 낙찰률 예측 등 핵심 기능에
              연구팀의 통계적 모형과 데이터 분석 역량이 적용되었습니다.
            </p>
            <div className="grid grid-cols-3 gap-4 text-left mb-8">
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-2xl font-bold font-mono text-neutral-300">87%</div>
                <div className="text-sm text-slate-400">예측 정확도</div>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-2xl font-bold font-mono text-neutral-300">32%</div>
                <div className="text-sm text-slate-400">낙찰률 향상</div>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-2xl font-bold font-mono text-neutral-300">5x</div>
                <div className="text-sm text-slate-400">분석 속도</div>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/features/ai-matching">분석 기능 살펴보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">연구 협력 문의</h2>
            <p className="text-slate-600 mb-6">
              산학협력, 공동연구, 기술이전 등 다양한 형태의 협력을 환영합니다.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild>
                <Link href="/contact">연구 협력 문의</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="http://forecasting.kaist.ac.kr" target="_blank" rel="noopener noreferrer">
                  연구 포털
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
