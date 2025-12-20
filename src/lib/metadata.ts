/**
 * SEO 메타데이터 유틸리티
 */
import { Metadata } from 'next';

const siteConfig = {
  name: 'BIDFLOW',
  description: '제조업 SME를 위한 AI 입찰 자동화 플랫폼',
  url: 'https://bidflow.io',
  ogImage: 'https://bidflow.io/og-image.png',
  twitter: '@bidflow',
};

interface PageMetadata {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  path = '',
  ogImage,
  noIndex = false,
}: PageMetadata): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const url = `${siteConfig.url}${path}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage || siteConfig.ogImage],
      creator: siteConfig.twitter,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
    },
  };
}

// Pre-defined metadata for common pages
export const pageMetadata = {
  features: {
    main: {
      title: '기능',
      description: 'BIDFLOW의 핵심 기능을 살펴보세요. 공고 수집, AI 매칭, 제안서 자동 생성까지 입찰 업무를 자동화합니다.',
      path: '/features',
    },
    collection: {
      title: '공고 수집',
      description: '나라장터, TED, SAM.gov 등 주요 공공입찰 플랫폼에서 공고를 자동으로 수집합니다.',
      path: '/features/collection',
    },
    aiMatching: {
      title: 'AI 매칭 분석',
      description: 'Claude AI가 귀사 제품과 공고 요구사항을 분석하여 적합도를 자동으로 평가합니다.',
      path: '/features/ai-matching',
    },
    proposal: {
      title: '제안서 자동 생성',
      description: 'AI가 공고 분석 결과를 바탕으로 제안서 초안을 자동으로 작성합니다.',
      path: '/features/proposal',
    },
    alerts: {
      title: '스마트 알림',
      description: '중요 공고의 마감일, 새 공고 발견, 상태 변경 등을 이메일과 Slack으로 알려드립니다.',
      path: '/features/alerts',
    },
    spreadsheet: {
      title: '스프레드시트 뷰',
      description: 'Google Sheets 스타일의 직관적인 UI로 수백 개의 공고를 한눈에 관리하세요.',
      path: '/features/spreadsheet',
    },
    collaboration: {
      title: '팀 협업',
      description: '팀원과 공고를 공유하고 코멘트를 남겨 효율적으로 협업하세요.',
      path: '/features/collaboration',
    },
    api: {
      title: 'REST API',
      description: '강력한 API를 통해 기존 시스템과 통합하거나 자동화 워크플로우를 구축하세요.',
      path: '/features/api',
    },
    security: {
      title: '보안',
      description: '엔터프라이즈급 보안으로 귀사의 데이터를 안전하게 보호합니다.',
      path: '/features/security',
    },
  },
  useCases: {
    main: {
      title: '활용 사례',
      description: '다양한 산업에서 BIDFLOW를 활용하여 입찰 업무를 혁신하고 있습니다.',
      path: '/use-cases',
    },
    manufacturing: {
      title: '제조업 활용 사례',
      description: '산업용 장비, 계측기기, 부품 제조업체를 위한 맞춤형 입찰 자동화 솔루션.',
      path: '/use-cases/manufacturing',
    },
    construction: {
      title: '건설업 활용 사례',
      description: '토목, 건축, 플랜트 등 건설 분야를 위한 맞춤형 입찰 관리 솔루션.',
      path: '/use-cases/construction',
    },
    itServices: {
      title: 'IT 서비스 활용 사례',
      description: 'SI, 소프트웨어 개발, IT 인프라 분야를 위한 맞춤형 입찰 관리 솔루션.',
      path: '/use-cases/it-services',
    },
  },
  integrations: {
    main: {
      title: '연동 플랫폼',
      description: '국내외 주요 공공입찰 플랫폼과 연동하여 모든 공고를 한 곳에서 관리하세요.',
      path: '/integrations',
    },
    narajangto: {
      title: '나라장터 연동',
      description: '대한민국 최대 공공조달 플랫폼 나라장터의 모든 공고를 자동으로 수집합니다.',
      path: '/integrations/narajangto',
    },
    ted: {
      title: 'TED 연동',
      description: '유럽연합 공식 공공조달 플랫폼 TED의 모든 공고를 한국어로 번역하여 제공합니다.',
      path: '/integrations/ted',
    },
    samgov: {
      title: 'SAM.gov 연동',
      description: '미국 연방정부 공공조달 포털 SAM.gov의 모든 계약 기회를 수집합니다.',
      path: '/integrations/samgov',
    },
  },
  resources: {
    docs: {
      title: '문서',
      description: 'BIDFLOW를 시작하고 활용하는 데 필요한 모든 정보를 찾아보세요.',
      path: '/docs',
    },
    support: {
      title: '고객 지원',
      description: 'BIDFLOW 팀이 항상 도움을 드릴 준비가 되어 있습니다.',
      path: '/support',
    },
    about: {
      title: '회사 소개',
      description: 'BIDFLOW는 AI 기술로 중소기업의 공공입찰 참여를 혁신합니다.',
      path: '/about',
    },
    contact: {
      title: '문의하기',
      description: '제품, 요금제, 파트너십 등 궁금한 점이 있으시면 언제든 문의해주세요.',
      path: '/contact',
    },
  },
  pricing: {
    title: '요금제',
    description: '심플하고 투명한 요금제. 숨겨진 비용 없이 필요한 만큼만 사용하세요.',
    path: '/pricing',
  },
};
