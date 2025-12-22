/**
 * @module ai/files-manager
 * @description Files API 통합 - Claude에서 PDF 파일 영구 관리
 *
 * Files API (Beta):
 * - 최대 100MB PDF 지원
 * - 멀티파일 동시 분석
 * - 파일 재사용 가능 (file_id 저장)
 * - 비용 절감: 파일 업로드 1회, 여러 분석에 재사용
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PDFUploadResult {
  file_id: string;
  filename: string;
  size_bytes: number;
  created_at: string;
}

export interface MultiplePDFAnalysisResult {
  basic_info: {
    title: string;
    organization: string;
    bid_type: string;
    deadline: string;
  };
  budget: {
    estimated_amount: number;
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
    participant_requirements: string[];
    required_certifications: string[];
    experience_requirements: string[];
  };
  documents: {
    technical_proposal: string[];
    price_proposal: string[];
    supporting_documents: string[];
  };
  attachments_analyzed: number;
  file_ids: string[];
}

// ============================================================================
// PDF 업로드
// ============================================================================

/**
 * PDF URL에서 다운로드 후 Files API 업로드
 */
export async function uploadBidPDFFromURL(
  pdfUrl: string,
  bidId: string
): Promise<PDFUploadResult> {
  try {
    // PDF 다운로드
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const filename = pdfUrl.split('/').pop() || `bid_${bidId}.pdf`;

    // Files API 업로드
    // @ts-expect-error - Files API is in beta
    const fileUpload = await client.files.create({
      file: Buffer.from(buffer),
      purpose: 'batch' as const, // 'batch' purpose for analysis
    });

    // Supabase에 file_id 저장
    await supabase
      .from('bid_attachments')
      .update({
        anthropic_file_id: fileUpload.id,
        file_size: buffer.byteLength,
        uploaded_at: new Date().toISOString(),
      })
      .eq('bid_id', bidId)
      .eq('url', pdfUrl);

    return {
      file_id: fileUpload.id,
      filename,
      size_bytes: buffer.byteLength,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Files API] Upload failed for ${pdfUrl}:`, error);
    throw error;
  }
}

/**
 * Base64 PDF를 Files API 업로드
 */
export async function uploadBidPDFFromBase64(
  base64Data: string,
  filename: string,
  bidId: string
): Promise<PDFUploadResult> {
  try {
    // Base64 디코딩
    const buffer = Buffer.from(base64Data, 'base64');

    // Files API 업로드
    // @ts-expect-error - Files API is in beta
    const fileUpload = await client.files.create({
      file: buffer,
      purpose: 'batch' as const,
    });

    // Supabase에 file_id 저장
    await supabase
      .from('bid_attachments')
      .insert({
        bid_id: bidId,
        filename,
        anthropic_file_id: fileUpload.id,
        file_size: buffer.byteLength,
        uploaded_at: new Date().toISOString(),
      });

    return {
      file_id: fileUpload.id,
      filename,
      size_bytes: buffer.byteLength,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Files API] Upload failed for ${filename}:`, error);
    throw error;
  }
}

// ============================================================================
// 멀티 PDF 분석
// ============================================================================

/**
 * 여러 PDF를 동시에 분석 (공고문 + 사양서 + 도면 등)
 */
export async function analyzeMultiplePDFs(
  fileIds: string[]
): Promise<MultiplePDFAnalysisResult> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: [
            // 모든 파일 첨부
            ...fileIds.map((id) => ({
              type: 'document' as const,
              source: { type: 'file' as const, file_id: id },
            })),
            {
              type: 'text',
              text: `모든 입찰 문서를 종합 분석하세요.

분석 항목:
1. 기본 정보 (제목, 발주처, 입찰 방식, 마감일)
2. 예산 및 계약 (추정가격, 계약 방식, 납품 기한, 대금 지급)
3. 기술 사양 (제품 카테고리, 수량, 요구사항, 성능 기준)
4. 자격 요건 (참가 자격, 필수 인증서, 실적 요구)
5. 제출 서류 (기술/가격 제안서, 증빙 서류)

JSON 형식으로 응답:
{
  "basic_info": {...},
  "budget": {...},
  "technical_specs": {...},
  "qualifications": {...},
  "documents": {...}
}`,
            },
          ],
        },
      ],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    const analysis = JSON.parse(firstBlock.text);

    return {
      ...analysis,
      attachments_analyzed: fileIds.length,
      file_ids: fileIds,
    };
  } catch (error) {
    console.error(`[Files API] Analysis failed for ${fileIds.length} files:`, error);
    throw error;
  }
}

/**
 * 단일 PDF 분석 (간단한 경우)
 */
export async function analyzeSinglePDF(fileId: string): Promise<MultiplePDFAnalysisResult> {
  return await analyzeMultiplePDFs([fileId]);
}

// ============================================================================
// 파일 관리
// ============================================================================

/**
 * Bid의 모든 첨부파일 업로드 및 분석
 */
export async function uploadAndAnalyzeBidAttachments(bidId: string) {
  try {
    // Supabase에서 첨부파일 조회
    const { data: attachments, error } = await supabase
      .from('bid_attachments')
      .select('id, url, anthropic_file_id')
      .eq('bid_id', bidId);

    if (error) {
      throw new Error(`Failed to fetch attachments: ${error.message}`);
    }

    if (!attachments || attachments.length === 0) {
      return null;
    }

    const fileIds: string[] = [];

    // 각 첨부파일 업로드 (이미 업로드된 경우 재사용)
    for (const attachment of attachments) {
      if (attachment.anthropic_file_id) {
        // 이미 업로드됨 - 재사용
        fileIds.push(attachment.anthropic_file_id);
      } else {
        // 새로 업로드
        const uploadResult = await uploadBidPDFFromURL(attachment.url, bidId);
        fileIds.push(uploadResult.file_id);
      }
    }

    // 모든 파일 동시 분석
    const analysis = await analyzeMultiplePDFs(fileIds);

    // Supabase 업데이트
    await supabase
      .from('bids')
      .update({
        description: analysis.basic_info.title,
        organization: analysis.basic_info.organization,
        estimated_amount: analysis.budget.estimated_amount,
        deadline: analysis.basic_info.deadline,
        keywords: analysis.technical_specs.requirements,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bidId);

    return analysis;
  } catch (error) {
    console.error(`[Files API] uploadAndAnalyzeBidAttachments failed for ${bidId}:`, error);
    throw error;
  }
}

/**
 * 파일 삭제 (Files API)
 */
export async function deleteFile(fileId: string) {
  try {
    // @ts-expect-error - Files API is in beta
    await client.files.delete(fileId);
    console.log(`[Files API] Deleted file: ${fileId}`);
  } catch (error) {
    console.error(`[Files API] Delete failed for ${fileId}:`, error);
    throw error;
  }
}

/**
 * 파일 정보 조회
 */
export async function getFileInfo(fileId: string) {
  try {
    // @ts-expect-error - Files API is in beta
    const file = await client.files.retrieve(fileId);
    return file;
  } catch (error) {
    console.error(`[Files API] Retrieve failed for ${fileId}:`, error);
    throw error;
  }
}

// ============================================================================
// 비용 계산
// ============================================================================

/**
 * Files API 비용 계산
 */
export function calculateFilesCost(fileSizeBytes: number, reuses: number = 1): number {
  // Files API pricing (approximate):
  // Upload: negligible
  // Storage: negligible (temporary)
  // Analysis: same as regular Vision API

  // 주요 이점: 파일을 여러 번 재사용 가능
  const baseAnalysisCost = 0.05; // Vision API per analysis
  const totalCost = baseAnalysisCost * reuses;

  return totalCost;
}

/**
 * 파일 재사용 효과 계산
 */
export function calculateReuseSavings(fileSizeBytes: number, timesAnalyzed: number) {
  // Without Files API: Upload PDF every time (bandwidth + time)
  const withoutFilesAPI = timesAnalyzed * 0.05; // Upload + analyze each time

  // With Files API: Upload once, reuse file_id
  const withFilesAPI = 0.05 * timesAnalyzed; // Same analysis cost, but faster

  return {
    without_files_api: `$${withoutFilesAPI.toFixed(2)}`,
    with_files_api: `$${withFilesAPI.toFixed(2)}`,
    savings: '$0.00', // Cost same, but time savings significant
    time_savings: `${(timesAnalyzed - 1) * 5}s`, // 5s per upload saved
  };
}
