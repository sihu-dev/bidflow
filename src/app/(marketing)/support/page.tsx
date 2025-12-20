/**
 * 고객 지원 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircle, Mail, Phone, Clock, Book, HelpCircle } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.resources.support);

const contactMethods = [
  {
    icon: MessageCircle,
    title: '실시간 채팅',
    description: '평일 9시-18시 실시간 채팅 상담',
    action: '채팅 시작',
    availability: '평일 9:00-18:00',
  },
  {
    icon: Mail,
    title: '이메일',
    description: 'support@bidflow.io로 문의',
    action: '이메일 보내기',
    availability: '24시간 접수',
  },
  {
    icon: Phone,
    title: '전화 상담',
    description: '02-1234-5678 (Pro/Enterprise)',
    action: '전화하기',
    availability: '평일 9:00-18:00',
  },
];

const faqs = [
  {
    question: '무료 체험 기간에 신용카드가 필요한가요?',
    answer: '아니요, 신용카드 없이 14일 동안 Pro 플랜의 모든 기능을 무료로 사용할 수 있습니다.',
  },
  {
    question: '플랫폼별 공고 수집 주기는 어떻게 되나요?',
    answer: '나라장터, TED, SAM.gov 모두 매일 3회(9시, 15시, 21시) 자동으로 수집됩니다.',
  },
  {
    question: 'API 요청 한도를 초과하면 어떻게 되나요?',
    answer: 'API 한도 초과 시 429 에러가 반환됩니다. Enterprise 플랜으로 업그레이드하시면 무제한 API 접근이 가능합니다.',
  },
  {
    question: '팀원 추가 비용이 있나요?',
    answer: 'Pro 플랜에서는 5명까지 무료, Enterprise 플랜은 무제한입니다. 추가 팀원이 필요하시면 Enterprise 플랜을 추천드립니다.',
  },
  {
    question: '데이터 내보내기 형식은 무엇인가요?',
    answer: 'CSV, Excel(xlsx), JSON 형식을 지원합니다. PDF 내보내기는 Enterprise 플랜에서 제공됩니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '유료 결제 후 7일 이내 요청 시 전액 환불됩니다. 7일 이후에는 잔여 기간에 대해 비례 환불됩니다.',
  },
];

const supportPlans = [
  {
    plan: 'Starter',
    features: ['이메일 지원', '문서 접근', '커뮤니티 포럼'],
    responseTime: '48시간 이내',
  },
  {
    plan: 'Pro',
    features: ['이메일 + 채팅 지원', '우선 처리', '화면 공유 지원'],
    responseTime: '24시간 이내',
  },
  {
    plan: 'Enterprise',
    features: ['전용 지원팀', '전화 지원', 'SLA 보장', '온사이트 교육'],
    responseTime: '4시간 이내',
  },
];

export default function SupportPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              고객 지원
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              무엇을 도와드릴까요?
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              BIDFLOW 팀이 항상 도움을 드릴 준비가 되어 있습니다.<br />
              궁금한 점이 있으시면 언제든 문의해주세요.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method) => (
              <div key={method.title} className="p-6 rounded-xl border bg-card text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3 h-3" />
                  <span>{method.availability}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {method.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-12">
              <HelpCircle className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">자주 묻는 질문</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="p-6 rounded-xl border bg-card">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Plans */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">플랜별 지원</h2>
            <p className="text-muted-foreground text-center mb-12">
              플랜에 따라 다양한 수준의 지원을 제공합니다
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {supportPlans.map((plan) => (
                <div key={plan.plan} className="p-6 rounded-xl border bg-card">
                  <h3 className="text-xl font-bold mb-2">{plan.plan}</h3>
                  <p className="text-sm text-primary mb-4">응답 시간: {plan.responseTime}</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Book className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">셀프 서비스 리소스</h2>
            <p className="text-muted-foreground mb-8">
              문서와 가이드에서 답을 찾아보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/docs">문서 보기</Link>
              </Button>
              <Button asChild>
                <Link href="/docs">API 레퍼런스</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
