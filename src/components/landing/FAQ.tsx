/**
 * FAQ 섹션
 */
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'BIDFLOW는 어떤 플랫폼의 공고를 수집하나요?',
    answer: '현재 나라장터(G2B), TED(EU 공공입찰), SAM.gov(미국 연방정부), 한국전력(KEPCO) 등 주요 공공입찰 플랫폼을 지원합니다. 요청에 따라 추가 플랫폼 연동도 가능합니다.',
  },
  {
    question: 'AI 매칭 정확도는 어느 정도인가요?',
    answer: '현재 평균 85% 이상의 정확도를 보이고 있으며, 사용할수록 학습하여 정확도가 향상됩니다. 불필요한 공고를 제외 처리하면 더욱 정확한 결과를 얻을 수 있습니다.',
  },
  {
    question: '무료 플랜으로 무엇을 할 수 있나요?',
    answer: '무료 플랜에서는 월 50건의 공고 분석, 1개 플랫폼 연동, 기본 AI 분석, 이메일 알림 기능을 이용할 수 있습니다. 소규모 기업이나 개인 사업자에게 적합합니다.',
  },
  {
    question: '데이터 보안은 어떻게 관리되나요?',
    answer: '모든 데이터는 암호화되어 저장되며, SOC 2 Type II 인증을 받은 클라우드 인프라를 사용합니다. 필요시 온프레미스 배포 옵션도 제공합니다.',
  },
  {
    question: '기존 시스템과 연동이 가능한가요?',
    answer: 'REST API를 통해 대부분의 시스템과 연동할 수 있습니다. Slack, 이메일 외에도 웹훅을 통한 커스텀 연동이 가능합니다.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            자주 묻는 질문
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            궁금한 점이 있으신가요?
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b">
              <button
                className="w-full py-5 flex items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium pr-8">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-muted-foreground transition-transform flex-shrink-0',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all',
                  openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
                )}
              >
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
