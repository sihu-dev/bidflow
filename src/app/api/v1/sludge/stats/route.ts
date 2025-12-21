/**
 * Sludge Stats API
 * GET /api/v1/sludge/stats - 대시보드 통계 조회
 */

import { NextResponse } from 'next/server';
import { getMonitoringStats } from '@/lib/sludge';

export async function GET() {
  try {
    const stats = await getMonitoringStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Sludge Stats API]', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
