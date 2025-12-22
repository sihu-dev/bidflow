/**
 * @module ai/vision-analyzer
 * @description Vision API for PDF/Image analysis
 *
 * Claude Vision:
 * - PDF 지원 (최대 32MB, 100페이지)
 * - 이미지 지원 (PNG, JPEG, WebP, GIF)
 * - 도표, 차트, 스캔 문서 OCR
 */

import { anthropic } from './cached-prompts';
import { createCachedPDFAnalysisPrompt } from './cached-prompts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BidPDFAnalysis {
  basic_info: {
    title: string;
    organization: string;
    bid_type: string;
    deadline: string;
    announcement_date?: string;
  };
  budget: {
    estimated_amount: number | null;
    contract_type: string;
    delivery_period: string;
    payment_terms: string;
  };
  technical_specs: {
    product_category: string;
    quantity: string;
    requirements: string[];
    performance_criteria: string[];
  };
  qualifications: {
    eligibility: string[];
    required_certifications: string[];
    experience_requirements: string[];
  };
  documents: {
    technical_proposal: string[];
    price_proposal: string[];
    supporting_docs: string[];
  };
  extracted_text?: string;
  confidence_score: number;
}

export interface ImageAnalysis {
  type: 'diagram' | 'chart' | 'table' | 'text' | 'mixed';
  description: string;
  extracted_data: Record<string, unknown>;
  confidence: number;
}

// ============================================================================
// PDF ANALYSIS
// ============================================================================

/**
 * PDF 입찰 공고 분석 (URL)
 */
export async function analyzeBidPDFFromURL(pdfUrl: string): Promise<BidPDFAnalysis> {
  const systemPrompt = createCachedPDFAnalysisPrompt();

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'url',
              url: pdfUrl,
            },
          },
          {
            type: 'text',
            text: `이 입찰 공고 PDF를 분석하고 구조화된 JSON으로 정보를 추출하세요.

특히 주의할 점:
1. 금액은 숫자만 추출 (예: "100,000,000원" → 100000000)
2. 날짜는 ISO 형식 (예: "2025-01-15T15:00:00Z")
3. 기술 사양은 모두 나열
4. 필수 서류는 빠짐없이 추출

JSON 형식으로만 응답하세요.`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return JSON.parse(content.text);
}

/**
 * PDF 입찰 공고 분석 (Base64)
 */
export async function analyzeBidPDFFromBase64(
  base64Data: string,
  mediaType: 'application/pdf' = 'application/pdf'
): Promise<BidPDFAnalysis> {
  const systemPrompt = createCachedPDFAnalysisPrompt();

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: '이 입찰 공고 PDF를 분석하고 구조화된 JSON으로 정보를 추출하세요.',
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return JSON.parse(content.text);
}

// ============================================================================
// IMAGE ANALYSIS
// ============================================================================

/**
 * 이미지 분석 (도면, 차트, 표)
 */
export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'url',
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: `이 이미지를 분석하세요:

1. 이미지 유형 (diagram/chart/table/text/mixed)
2. 주요 내용 설명
3. 추출 가능한 데이터 (표, 수치 등)

JSON 형식으로 응답:
{
  "type": "이미지 유형",
  "description": "상세 설명",
  "extracted_data": {},
  "confidence": 0.95
}`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return JSON.parse(content.text);
}

/**
 * 기술 도면 분석 (배관, 설비)
 */
export async function analyzeTechnicalDrawing(imageUrl: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'url',
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: `이 기술 도면을 분석하세요:

추출 정보:
1. 배관 구경 (DN)
2. 유량계 설치 위치
3. 압력 등급
4. 재질 사양
5. 특이사항

JSON으로 응답하세요.`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return JSON.parse(content.text);
}

// ============================================================================
// BATCH ANALYSIS
// ============================================================================

/**
 * 여러 PDF 첨부파일 일괄 분석
 */
export async function analyzeBidAttachments(attachmentUrls: string[]) {
  const results = await Promise.all(
    attachmentUrls.map(async (url) => {
      try {
        if (url.endsWith('.pdf')) {
          return await analyzeBidPDFFromURL(url);
        } else if (url.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
          return await analyzeImage(url);
        } else {
          return { error: 'Unsupported file type' };
        }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Analysis failed',
          url,
        };
      }
    })
  );

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * 파일을 Base64로 변환
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:*/*;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * PDF 페이지 수 추정
 */
export function estimatePDFPages(fileSizeBytes: number): number {
  // 평균 1페이지 = 50KB
  return Math.ceil(fileSizeBytes / 50000);
}

/**
 * Vision API 비용 계산
 */
export function calculateVisionCost(
  fileSizeBytes: number,
  fileType: 'pdf' | 'image'
): number {
  if (fileType === 'pdf') {
    const pages = estimatePDFPages(fileSizeBytes);
    // PDF: 페이지당 토큰 수 추정 (평균 1500 tokens/page)
    const tokens = pages * 1500;
    return (tokens / 1000000) * 0.003; // $3/MTok
  } else {
    // 이미지: 고정 비용 (평균 800 tokens)
    return (800 / 1000000) * 0.003;
  }
}
