/**
 * @api {post} /api/v1/ai/analyze-pdf PDF 자동 분석
 * @apiName AnalyzePDF
 * @apiGroup AI
 * @apiVersion 1.0.0
 *
 * @apiDescription Claude Vision API로 입찰 공고 PDF를 자동 분석
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeBidPDFFromURL, analyzeBidPDFFromBase64 } from '@/lib/ai/vision-analyzer';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const analyzePDFSchema = z.object({
  url: z.string().url().optional(),
  base64: z.string().optional(),
  bidId: z.string().optional(),
}).refine((data) => data.url || data.base64, {
  message: 'Either url or base64 must be provided',
});

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = analyzePDFSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { url, base64, bidId } = validation.data;

    // PDF 분석
    let analysis;
    if (url) {
      analysis = await analyzeBidPDFFromURL(url);
    } else if (base64) {
      analysis = await analyzeBidPDFFromBase64(base64);
    }

    // Supabase에 저장 (bidId가 있는 경우)
    if (bidId && analysis) {
      // TODO: Supabase 업데이트
      // await supabase
      //   .from('bids')
      //   .update({
      //     title: analysis.basic_info.title,
      //     organization: analysis.basic_info.organization,
      //     deadline: analysis.basic_info.deadline,
      //     estimated_amount: analysis.budget.estimated_amount,
      //     raw_data: analysis,
      //     updated_at: new Date().toISOString(),
      //   })
      //   .eq('id', bidId);
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('[PDF Analysis Error]', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'PDF 분석 실패',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// METADATA
// ============================================================================

export const runtime = 'nodejs';
export const maxDuration = 60; // 60초 timeout (Vision API는 시간 소요)
