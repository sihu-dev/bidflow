import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requestPrediction, getSitePredictions } from '@/lib/sludge';
import type { SiteId } from '@/lib/sludge';

// ============================================
// Validation Schema
// ============================================

const PredictionRequestSchema = z.object({
  siteId: z.string().uuid(),
  predictionType: z.enum([
    'sludge_volume',
    'biogas_production',
    'equipment_failure',
    'energy_consumption',
    'water_quality',
  ]),
  targetDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});

// ============================================
// GET /api/v1/sludge/predictions
// ============================================

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const siteId = url.searchParams.get('siteId');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    if (!siteId) {
      return NextResponse.json(
        {
          success: false,
          error: 'siteId is required',
        },
        { status: 400 }
      );
    }

    const predictions = await getSitePredictions(siteId as SiteId, limit);

    return NextResponse.json({
      success: true,
      data: predictions,
      meta: {
        total: predictions.length,
      },
    });
  } catch (error) {
    console.error('[API] GET /sludge/predictions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/v1/sludge/predictions
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = PredictionRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const prediction = await requestPrediction(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: prediction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] POST /sludge/predictions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
