/**
 * Sludge Site API
 * GET /api/v1/sludge/sites/[id] - 사이트 상세 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSiteDetails } from '@/lib/sludge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;

    const site = await getSiteDetails(siteId as any);

    if (!site) {
      return NextResponse.json(
        {
          success: false,
          error: 'Site not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: site,
    });
  } catch (error) {
    console.error('[Sludge Site API]', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
