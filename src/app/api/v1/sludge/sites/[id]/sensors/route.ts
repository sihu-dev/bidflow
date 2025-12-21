/**
 * Sludge Sensors API
 * GET /api/v1/sludge/sites/[id]/sensors - 사이트별 센서 현황 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSiteSensors, getLatestSensorReadings } from '@/lib/sludge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;

    // 사이트의 센서 목록과 최신 readings 조회
    const sensors = await getSiteSensors(siteId as any);
    const latestReadings = await getLatestSensorReadings(siteId as any);

    // readings를 센서 ID로 매핑
    const readingsMap: Record<string, any> = {};
    for (const reading of latestReadings) {
      readingsMap[reading.sensorId] = reading;
    }

    const alerts: any[] = []; // TODO: 실제 알림 조회

    return NextResponse.json({
      success: true,
      data: {
        sensors,
        readings: readingsMap,
        alerts,
      },
    });
  } catch (error) {
    console.error('[Sludge Sensors API]', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
