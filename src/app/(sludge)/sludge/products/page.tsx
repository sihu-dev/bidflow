'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Waves,
  Gauge,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Info,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface ProductSpec {
  label: string;
  value: string;
}

interface Product {
  id: string;
  model: string;
  name: string;
  nameEn: string;
  type: 'ultrasonic' | 'electromagnetic';
  pipeType: 'full' | 'non-full' | 'integrated';
  icon: 'waves' | 'gauge' | 'zap';
  diameter: string;
  accuracy: string;
  applications: string[];
  features: string[];
  specs: ProductSpec[];
  recommended?: boolean;
}

// ============================================
// Product Data (씨엠엔텍 유량계)
// ============================================

const products: Product[] = [
  {
    id: 'ur-1000plus',
    model: 'UR-1000PLUS',
    name: '만관형 다회선 초음파 유량계',
    nameEn: 'Full-pipe Multi-path Ultrasonic Flowmeter',
    type: 'ultrasonic',
    pipeType: 'full',
    icon: 'waves',
    diameter: 'DN100 ~ DN4000',
    accuracy: '±0.5%',
    applications: ['상수도', '취수장', '정수장', '송배수관'],
    features: [
      '다회선 측정으로 높은 정확도',
      '비접촉식 측정',
      '유지보수 용이',
      '장기 안정성',
    ],
    specs: [
      { label: '측정 원리', value: '초음파 전파시간차' },
      { label: '회선 수', value: '1~4회선' },
      { label: '유속 범위', value: '0~12 m/s' },
      { label: '통신', value: 'Modbus RTU/TCP' },
      { label: '전원', value: 'AC 220V / DC 24V' },
      { label: '방수등급', value: 'IP68' },
    ],
  },
  {
    id: 'mf-1000c',
    model: 'MF-1000C',
    name: '일체형 전자 유량계',
    nameEn: 'Integrated Electromagnetic Flowmeter',
    type: 'electromagnetic',
    pipeType: 'integrated',
    icon: 'zap',
    diameter: 'DN15 ~ DN2000',
    accuracy: '±0.5%',
    applications: ['공업용수', '상거래 계량', '화학 프로세스', '식품/제약'],
    features: [
      '전자기 유도 원리',
      '이물질 영향 최소',
      '양방향 측정',
      '고정밀 상거래용',
    ],
    specs: [
      { label: '측정 원리', value: '전자기 유도' },
      { label: '도전율', value: '≥5 μS/cm' },
      { label: '유속 범위', value: '0~10 m/s' },
      { label: '통신', value: '4-20mA / HART' },
      { label: '전원', value: 'AC 220V / DC 24V' },
      { label: '방수등급', value: 'IP67' },
    ],
    recommended: true,
  },
  {
    id: 'ur-1010plus',
    model: 'UR-1010PLUS',
    name: '비만관형 초음파 유량계',
    nameEn: 'Non-full Pipe Ultrasonic Flowmeter',
    type: 'ultrasonic',
    pipeType: 'non-full',
    icon: 'gauge',
    diameter: 'DN200 ~ DN3000',
    accuracy: '±1~2%',
    applications: ['하수관로', '우수관로', '방류수', '슬러지 처리'],
    features: [
      '비만관 상태 측정',
      '수위+유속 동시 측정',
      '슬러지/이물질 내성',
      '우수/하수 전용',
    ],
    specs: [
      { label: '측정 원리', value: '초음파 도플러' },
      { label: '수위 측정', value: '압력식/초음파' },
      { label: '유속 범위', value: '-5~+5 m/s' },
      { label: '통신', value: 'Modbus RTU/TCP' },
      { label: '전원', value: 'DC 12V / Solar' },
      { label: '방수등급', value: 'IP68 (침수형)' },
    ],
  },
  {
    id: 'sl-3000plus',
    model: 'SL-3000PLUS',
    name: '슬러리 전용 초음파 유량계',
    nameEn: 'Slurry Ultrasonic Flowmeter',
    type: 'ultrasonic',
    pipeType: 'full',
    icon: 'waves',
    diameter: 'DN80 ~ DN1500',
    accuracy: '±1%',
    applications: ['슬러지 이송', '바이오가스', '폐수처리', '광업'],
    features: [
      '고농도 슬러리 측정',
      '클램프온 설치',
      '무압손실',
      '내마모성',
    ],
    specs: [
      { label: '측정 원리', value: '초음파 전파시간차' },
      { label: '고형물 농도', value: '최대 30%' },
      { label: '유속 범위', value: '0~8 m/s' },
      { label: '통신', value: 'Modbus RTU/TCP' },
      { label: '전원', value: 'AC 220V / DC 24V' },
      { label: '방수등급', value: 'IP66' },
    ],
  },
];

// ============================================
// Components
// ============================================

function ProductIcon({ type }: { type: Product['icon'] }) {
  const icons = {
    waves: Waves,
    gauge: Gauge,
    zap: Zap,
  };
  const Icon = icons[type];
  return <Icon className="h-8 w-8" />;
}

function ProductCard({ product }: { product: Product }) {
  const pipeTypeLabels = {
    full: '만관형',
    'non-full': '비만관형',
    integrated: '일체형',
  };

  const typeLabels = {
    ultrasonic: '초음파',
    electromagnetic: '전자식',
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
        product.recommended
          ? 'border-neutral-900'
          : 'border-neutral-200 hover:border-neutral-400'
      }`}
    >
      {/* Recommended Badge */}
      {product.recommended && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-neutral-900 text-white text-xs font-medium rounded-full">
          추천
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-neutral-100 rounded-xl">
          <ProductIcon type={product.icon} />
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">
            {typeLabels[product.type]}
          </span>
          <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">
            {pipeTypeLabels[product.pipeType]}
          </span>
        </div>
      </div>

      {/* Model Name */}
      <h3 className="text-xl font-bold text-neutral-900 mb-1">
        {product.model}
      </h3>
      <p className="text-sm text-neutral-600 mb-4">{product.name}</p>

      {/* Key Specs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-neutral-50 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">구경</p>
          <p className="font-semibold text-neutral-900">{product.diameter}</p>
        </div>
        <div className="p-3 bg-neutral-50 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">정확도</p>
          <p className="font-semibold text-neutral-900">{product.accuracy}</p>
        </div>
      </div>

      {/* Applications */}
      <div className="mb-4">
        <p className="text-xs text-neutral-500 mb-2">적용 분야</p>
        <div className="flex flex-wrap gap-1">
          {product.applications.map((app) => (
            <span
              key={app}
              className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-700 rounded"
            >
              {app}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        {product.features.slice(0, 3).map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-600">{feature}</span>
          </div>
        ))}
      </div>

      {/* Action */}
      <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
        <span>상세 사양</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">제품 비교</h2>
        <p className="text-sm text-neutral-500 mt-1">
          용도에 맞는 유량계를 선택하세요
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                모델
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                유형
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                구경
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                정확도
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                주요 용도
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      <ProductIcon type={product.icon} />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {product.model}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {product.type === 'ultrasonic' ? '초음파' : '전자식'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">
                    {product.pipeType === 'full'
                      ? '만관형'
                      : product.pipeType === 'non-full'
                        ? '비만관형'
                        : '일체형'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {product.diameter}
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-medium text-neutral-900">
                    {product.accuracy}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-neutral-600">
                    {product.applications.slice(0, 2).join(', ')}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApplicationGuide() {
  const guides = [
    {
      category: '상수도 / 정수장',
      description: '깨끗한 물의 정밀 계량',
      products: ['UR-1000PLUS', 'MF-1000C'],
      icon: Shield,
    },
    {
      category: '하수 / 우수 관로',
      description: '비만관 상태의 유량 측정',
      products: ['UR-1010PLUS'],
      icon: Waves,
    },
    {
      category: '슬러지 / 바이오가스',
      description: '고농도 슬러리 측정',
      products: ['SL-3000PLUS', 'UR-1010PLUS'],
      icon: Gauge,
    },
    {
      category: '공업용수 / 상거래',
      description: '정밀 계량 및 과금',
      products: ['MF-1000C'],
      icon: Zap,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-5 w-5 text-neutral-400" />
        <h2 className="text-lg font-semibold text-neutral-900">
          용도별 추천 제품
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <div
            key={guide.category}
            className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <guide.icon className="h-5 w-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">
                  {guide.category}
                </h3>
                <p className="text-sm text-neutral-500 mb-2">
                  {guide.description}
                </p>
                <div className="flex gap-2">
                  {guide.products.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 text-xs font-medium bg-neutral-900 text-white rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Page
// ============================================

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/sludge"
                className="p-2 text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-semibold text-neutral-900">
                  유량계 제품 카탈로그
                </h1>
                <p className="text-sm text-neutral-500">
                  씨엠엔텍 CMENTECH Flowmeters
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <section className="mb-8">
          <div className="bg-neutral-900 text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              SludgeAI Pro + 씨엠엔텍 유량계
            </h2>
            <p className="text-neutral-300 max-w-2xl mb-6">
              씨엠엔텍의 고정밀 유량계와 AI 기반 슬러지 관리 플랫폼의 완벽한 통합.
              실시간 모니터링부터 예측 분석까지, 스마트 하수처리의 미래를 경험하세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-white/10 rounded-lg">
                <p className="text-sm text-neutral-400">제품 라인업</p>
                <p className="text-xl font-bold">4개 시리즈</p>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg">
                <p className="text-sm text-neutral-400">구경 범위</p>
                <p className="text-xl font-bold">DN15 ~ DN4000</p>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg">
                <p className="text-sm text-neutral-400">정확도</p>
                <p className="text-xl font-bold">±0.5% ~</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Cards */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            제품 라인업
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Application Guide */}
        <section className="mb-12">
          <ApplicationGuide />
        </section>

        {/* Comparison Table */}
        <section>
          <ComparisonTable />
        </section>
      </main>
    </div>
  );
}
