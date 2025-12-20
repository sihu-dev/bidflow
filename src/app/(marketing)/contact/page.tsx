/**
 * 문의 페이지
 */
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const contactInfo = [
  {
    icon: Mail,
    label: '이메일',
    value: 'contact@bidflow.io',
    description: '24시간 접수',
  },
  {
    icon: Phone,
    label: '전화',
    value: '02-1234-5678',
    description: '평일 9:00-18:00',
  },
  {
    icon: MapPin,
    label: '주소',
    value: '서울특별시 강남구 테헤란로 123',
    description: 'BIDFLOW 빌딩 5층',
  },
  {
    icon: Clock,
    label: '영업 시간',
    value: '평일 9:00 - 18:00',
    description: '주말/공휴일 휴무',
  },
];

const inquiryTypes = [
  '제품 문의',
  'Enterprise 상담',
  '파트너십 제안',
  '연구 협력',
  '채용 문의',
  '기타',
];

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          inquiryType: '',
          message: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(result.error || '문의 접수에 실패했습니다.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              문의하기
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              무엇이든 물어보세요
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              제품, 요금제, 파트너십 등 궁금한 점이 있으시면<br />
              언제든 문의해주세요. 빠르게 답변드리겠습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <div className="p-8 rounded-2xl border bg-card">
                <h2 className="text-2xl font-bold mb-6">문의 양식</h2>

                {status === 'success' ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">문의가 접수되었습니다</h3>
                    <p className="text-muted-foreground mb-6">
                      빠른 시일 내에 답변드리겠습니다.
                    </p>
                    <Button onClick={() => setStatus('idle')}>새 문의하기</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="flex items-center gap-2 p-3 bg-neutral-50 text-neutral-700 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          이름 <span className="text-neutral-600">*</span>
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="홍길동"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          회사명
                        </label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="(주)예시회사"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        이메일 <span className="text-neutral-600">*</span>
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        전화번호
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="010-1234-5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        문의 유형 <span className="text-neutral-600">*</span>
                      </label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-md border bg-background"
                        required
                      >
                        <option value="">선택해주세요</option>
                        {inquiryTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        문의 내용 <span className="text-neutral-600">*</span>
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="문의하실 내용을 자세히 작성해주세요."
                        rows={5}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          접수 중...
                        </>
                      ) : (
                        '문의하기'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      제출 시 <Link href="/privacy" className="underline">개인정보처리방침</Link>에 동의하는 것으로 간주됩니다.
                    </p>
                  </form>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold mb-6">연락처 정보</h2>
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{info.label}</p>
                        <p className="font-medium">{info.value}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map placeholder */}
                <div className="mt-8 aspect-video rounded-xl bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">지도</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            자주 묻는 질문을 확인해보세요
          </h2>
          <p className="text-muted-foreground mb-6">
            이미 많은 분들이 궁금해하신 내용들을 정리해두었습니다.
          </p>
          <Button variant="outline" asChild>
            <Link href="/support">FAQ 보기</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
