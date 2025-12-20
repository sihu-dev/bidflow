/**
 * 팀 협업 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { Users, MessageCircle, UserPlus, Shield, Share2, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.collaboration);

const teamFeatures = [
  {
    icon: UserPlus,
    title: '팀원 초대',
    description: '이메일로 팀원을 초대하고 역할을 부여합니다.',
    plans: ['Pro', 'Enterprise'],
  },
  {
    icon: MessageCircle,
    title: '코멘트',
    description: '공고에 코멘트를 남겨 팀원과 의견을 공유합니다.',
    plans: ['Pro', 'Enterprise'],
  },
  {
    icon: Share2,
    title: '공고 공유',
    description: '중요 공고를 팀원에게 빠르게 공유합니다.',
    plans: ['Pro', 'Enterprise'],
  },
  {
    icon: Shield,
    title: '권한 관리',
    description: '팀원별로 접근 권한을 세밀하게 설정합니다.',
    plans: ['Enterprise'],
  },
];

const roles = [
  {
    name: 'Admin',
    description: '전체 관리 권한',
    permissions: ['모든 기능', '팀원 관리', '설정 변경', '결제 관리'],
  },
  {
    name: 'Manager',
    description: '공고 관리 권한',
    permissions: ['공고 관리', '제안서 작성', '팀원 코멘트', '내보내기'],
  },
  {
    name: 'Member',
    description: '기본 열람 권한',
    permissions: ['공고 열람', '코멘트 작성', '알림 수신'],
  },
];

const planLimits = [
  { plan: 'Starter', members: '1명', description: '개인 사용자' },
  { plan: 'Pro', members: '5명', description: '소규모 팀' },
  { plan: 'Enterprise', members: '무제한', description: '대규모 조직' },
];

export default function CollaborationPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">협업 기능</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              팀 협업
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              팀원과 공고를 공유하고 코멘트를 남겨 효율적으로 협업하세요.
              역할 기반 권한 관리로 안전하게 팀을 운영할 수 있습니다.
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

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">협업 기능</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {teamFeatures.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl bg-card border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <div className="flex gap-1">
                  {feature.plans.map((plan) => (
                    <Badge key={plan} variant="outline" className="text-xs">
                      {plan}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">역할 및 권한</h2>
            <p className="text-muted-foreground text-center mb-12">
              팀원별로 적절한 역할을 부여하세요
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.name} className="p-6 rounded-xl border bg-card">
                  <h3 className="text-xl font-bold mb-1">{role.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                  <ul className="space-y-2">
                    {role.permissions.map((permission) => (
                      <li key={permission} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-neutral-700" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plan Limits */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">플랜별 팀원 수</h2>
            <p className="text-muted-foreground text-center mb-12">
              팀 규모에 맞는 플랜을 선택하세요
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {planLimits.map((item) => (
                <div key={item.plan} className="p-6 rounded-xl border bg-card text-center">
                  <h3 className="text-lg font-semibold mb-2">{item.plan}</h3>
                  <p className="text-3xl font-bold text-primary mb-2">{item.members}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link href="/pricing">요금제 비교하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: '스프레드시트', href: '/features/spreadsheet' }}
        next={{ label: 'REST API', href: '/features/api' }}
      />
    </>
  );
}
