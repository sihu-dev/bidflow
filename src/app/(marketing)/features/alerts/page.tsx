/**
 * 스마트 알림 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { Bell, Mail, MessageSquare, Calendar, Settings, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.alerts);

const alertTypes = [
  {
    icon: Calendar,
    title: '마감 임박 알림',
    description: 'D-7, D-3, D-1 등 설정한 시점에 마감 알림을 받습니다.',
    timing: 'D-7, D-3, D-1',
  },
  {
    icon: Bell,
    title: '새 공고 알림',
    description: '매칭 조건에 맞는 새 공고가 등록되면 즉시 알려드립니다.',
    timing: '실시간',
  },
  {
    icon: Settings,
    title: '상태 변경 알림',
    description: '추적 중인 공고의 상태가 변경되면 알림을 받습니다.',
    timing: '실시간',
  },
];

const channels = [
  {
    icon: Mail,
    name: '이메일',
    description: '중요 알림을 이메일로 받습니다.',
    status: 'all',
  },
  {
    icon: MessageSquare,
    name: 'Slack',
    description: '팀 채널에 알림을 전송합니다.',
    status: 'pro',
  },
  {
    icon: Bell,
    name: '웹 푸시',
    description: '브라우저 푸시 알림을 받습니다.',
    status: 'all',
  },
];

const customOptions = [
  { label: '알림 시간대 설정', description: '업무 시간에만 알림 수신' },
  { label: '알림 빈도 조절', description: '즉시, 일별, 주간 요약' },
  { label: '우선순위 필터', description: '중요 공고만 알림' },
  { label: '금액 기준 설정', description: '특정 금액 이상만 알림' },
  { label: '지역 필터', description: '특정 지역 공고만 알림' },
  { label: '키워드 알림', description: '특정 키워드 포함 시 알림' },
];

export default function AlertsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">핵심 기능</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              스마트<br />알림 시스템
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              중요 공고의 마감일, 새 공고 발견, 상태 변경 등을
              이메일과 Slack으로 알려드립니다.
              더 이상 중요한 기회를 놓치지 마세요.
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

      {/* Alert Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">알림 종류</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {alertTypes.map((alert) => (
              <div key={alert.title} className="p-6 rounded-xl bg-card border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <alert.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
                <p className="text-muted-foreground mb-4">{alert.description}</p>
                <Badge variant="outline">{alert.timing}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">알림 채널</h2>
            <p className="text-muted-foreground text-center mb-12">
              원하는 채널로 알림을 받으세요
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <div key={channel.name} className="p-6 rounded-xl border bg-card text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <channel.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{channel.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{channel.description}</p>
                  <Badge variant={channel.status === 'all' ? 'default' : 'secondary'}>
                    {channel.status === 'all' ? '전 플랜' : 'Pro 이상'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customization */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">맞춤 설정</h2>
            <p className="text-muted-foreground text-center mb-12">
              세부적인 알림 조건을 설정하세요
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customOptions.map((option) => (
                <div key={option.label} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neutral-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Slack Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4">Slack 연동</Badge>
                <h2 className="text-3xl font-bold mb-4">팀과 함께 알림 받기</h2>
                <p className="text-muted-foreground mb-6">
                  Slack 채널에 알림을 연동하여 팀 전체가 중요 공고를 실시간으로 확인할 수 있습니다.
                  우선순위에 따라 다른 채널로 분기도 가능합니다.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neutral-700" />
                    <span>#bidflow-urgent: 긴급 공고</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neutral-700" />
                    <span>#bidflow-alerts: 중요 공고</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neutral-700" />
                    <span>#bidflow-updates: 일반 업데이트</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-[#1a1d21] text-white">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
                  <div className="w-10 h-10 rounded bg-primary flex items-center justify-center font-bold">
                    B
                  </div>
                  <div>
                    <p className="font-medium">BIDFLOW</p>
                    <p className="text-xs text-gray-400">오늘 오전 9:00</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">🔔 새로운 입찰 공고</p>
                  <p className="text-gray-300">서울시 초음파유량계 구매 입찰</p>
                  <div className="flex gap-4 text-gray-400 text-xs">
                    <span>마감: 2025-01-15</span>
                    <span>추정가: 4.5억원</span>
                  </div>
                  <div className="mt-3 inline-block px-3 py-1 bg-primary/20 rounded text-primary text-xs">
                    상세보기
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: '제안서 생성', href: '/features/proposal' }}
        next={{ label: '스프레드시트', href: '/features/spreadsheet' }}
      />
    </>
  );
}
