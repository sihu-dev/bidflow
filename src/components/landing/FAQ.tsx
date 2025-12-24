/**
 * FAQ 섹션 - 모노크롬
 */
'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'CMNTech 5개 제품이 기본으로 등록되어 있나요?',
    answer: 'UR-1000PLUS, MF-1000C, UR-1010PLUS, SL-3000PLUS, EnerRay 5개 제품이 기본 등록되어 있습니다. 각 제품의 사양, 적용 분야, 키워드가 사전 설정되어 바로 사용 가능합니다.',
  },
  {
    question: 'AI 매칭 점수는 어떻게 계산되나요?',
    answer: '공고의 요구사양(구경, 정확도, 적용분야)과 제품 스펙을 비교하여 0-100% 점수를 산출합니다. 키워드 일치도, 발주기관 이력, 납품 조건도 반영됩니다.',
  },
  {
    question: '=AI_MATCH() 함수는 어떻게 사용하나요?',
    answer: '스프레드시트에서 =AI_MATCH(공고ID)를 입력하면 가장 적합한 CMNTech 제품과 신뢰도를 반환합니다. =AI_SCORE(), =AI_SUMMARY() 등 5가지 AI 함수를 지원합니다.',
  },
  {
    question: '추가 제품도 등록할 수 있나요?',
    answer: 'Pro 플랜부터 무제한 제품 등록이 가능합니다. 제품명, 사양, 키워드를 입력하면 AI가 관련 공고를 자동 매칭합니다.',
  },
  {
    question: 'TED, SAM.gov 해외 입찰도 지원하나요?',
    answer: 'TED(EU), SAM.gov(미국), 한전 등 국내외 45개 이상의 입찰 플랫폼을 지원합니다. 해외 공고도 한국어로 AI 요약을 제공합니다.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
            자주 묻는 질문
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            궁금한 점이 있으신가요?
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-neutral-200">
              <button
                type="button"
                className="w-full py-6 flex items-center justify-between text-left group"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-medium text-neutral-900 pr-8 group-hover:text-neutral-600 transition-colors">
                  {faq.question}
                </span>
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                  openIndex === index ? 'bg-neutral-900' : 'bg-neutral-100'
                )}>
                  {openIndex === index ? (
                    <Minus className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-neutral-600" aria-hidden="true" />
                  )}
                </div>
              </button>
              <div
                id={`faq-answer-${index}`}
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                )}
              >
                <p className="text-neutral-500 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
