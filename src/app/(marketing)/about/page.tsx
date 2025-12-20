/**
 * 회사 소개 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, Users, Zap, Heart, Globe, Award } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.resources.about);

const stats = [
  { value: '500+', label: '활성 기업 고객' },
  { value: '50,000+', label: '월간 처리 공고' },
  { value: '32%', label: '평균 낙찰률 향상' },
  { value: '80%', label: '업무 시간 절감' },
];

const values = [
  {
    icon: Target,
    title: '고객 성공',
    description: '고객의 낙찰 성공이 곧 우리의 성공입니다. 모든 결정을 고객 가치 중심으로 합니다.',
  },
  {
    icon: Zap,
    title: '혁신',
    description: 'AI와 자동화로 입찰 프로세스의 새로운 표준을 만들어갑니다.',
  },
  {
    icon: Heart,
    title: '신뢰',
    description: '투명한 운영과 보안으로 고객의 소중한 데이터를 안전하게 보호합니다.',
  },
  {
    icon: Users,
    title: '협력',
    description: '고객, 파트너, 팀원 모두와 함께 성장하는 생태계를 만듭니다.',
  },
];

const milestones = [
  { year: '2023', event: 'BIDFLOW 서비스 런칭' },
  { year: '2023', event: '나라장터 연동 완료' },
  { year: '2024', event: 'TED, SAM.gov 연동' },
  { year: '2024', event: 'AI 매칭 엔진 출시' },
  { year: '2025', event: 'Claude AI 기반 제안서 생성 출시' },
];

const team = [
  {
    name: '김태훈',
    role: 'CEO & Co-founder',
    description: '10년 이상의 B2B SaaS 경험',
  },
  {
    name: '이수진',
    role: 'CTO & Co-founder',
    description: 'AI/ML 전문가, 전 네이버 리서치',
  },
  {
    name: '박민수',
    role: 'CPO',
    description: '입찰 업계 15년 경력',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              회사 소개
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              입찰의 미래를<br />만들어갑니다
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              BIDFLOW는 AI 기술로 중소기업의 공공입찰 참여를 혁신합니다.<br />
              더 많은 기업이 공정한 기회를 얻을 수 있도록 돕습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-sm opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4">미션</Badge>
                <h2 className="text-3xl font-bold mb-6">
                  모든 기업에게<br />공정한 입찰 기회를
                </h2>
                <p className="text-muted-foreground mb-6">
                  대기업만의 전유물이었던 체계적인 입찰 관리를
                  중소기업도 누릴 수 있게 합니다.
                  AI 기술로 시간과 비용의 벽을 허물고,
                  실력으로 경쟁할 수 있는 환경을 만듭니다.
                </p>
                <p className="text-muted-foreground">
                  2023년 설립 이후, 500개 이상의 기업이 BIDFLOW와 함께
                  입찰 업무를 혁신하고 있습니다.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border">
                <Globe className="w-16 h-16 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-4">글로벌 비전</h3>
                <p className="text-muted-foreground">
                  한국에서 시작해 전 세계 공공조달 시장으로 확장합니다.
                  EU, 미국, UN까지 - 어디서든 BIDFLOW와 함께 입찰에 도전하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">핵심 가치</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value) => (
                <div key={value.title} className="p-6 rounded-xl border bg-card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">여정</h2>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <span className="text-sm font-medium text-primary w-16">{milestone.year}</span>
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="flex-1">{milestone.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">리더십</h2>
            <p className="text-muted-foreground text-center mb-12">
              다양한 분야의 전문가들이 함께합니다
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((member) => (
                <div key={member.name} className="p-6 rounded-xl border bg-card text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-8">수상 및 인증</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="py-2 px-4">
                2024 중소벤처기업부 장관상
              </Badge>
              <Badge variant="outline" className="py-2 px-4">
                K-Startup 그랑프리
              </Badge>
              <Badge variant="outline" className="py-2 px-4">
                벤처기업 인증
              </Badge>
              <Badge variant="outline" className="py-2 px-4">
                ISO 27001 인증
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            함께 성장할 준비가 되셨나요?
          </h2>
          <p className="opacity-90 mb-8">
            BIDFLOW와 함께 입찰의 새로운 표준을 만들어가세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">무료 체험 시작</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/contact">제휴 문의</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
