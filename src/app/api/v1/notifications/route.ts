/**
 * @route /api/v1/notifications
 * @description 알림 관리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { withCSRF } from '@/lib/security/csrf';
import { z } from 'zod';
import type { ApiResponse } from '@forge-labs/types/bidding';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

interface Notification {
  id: string;
  type: 'deadline' | 'new_bid' | 'status_change' | 'match' | 'system';
  title: string;
  message: string;
  bidId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    address: string;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  slack: {
    enabled: boolean;
    webhookUrl?: string;
    channel?: string;
  };
  filters: {
    minAmount?: number;
    sources?: string[];
    priorities?: string[];
  };
}

// ============================================================================
// 스키마
// ============================================================================

const notificationSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    address: z.string().email().optional(),
    frequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
  }).optional(),
  slack: z.object({
    enabled: z.boolean(),
    webhookUrl: z.string().url().optional(),
    channel: z.string().optional(),
  }).optional(),
  filters: z.object({
    minAmount: z.number().min(0).optional(),
    sources: z.array(z.string()).optional(),
    priorities: z.array(z.enum(['high', 'medium', 'low'])).optional(),
  }).optional(),
});

const markReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

// ============================================================================
// Mock 데이터 (실제로는 DB에서 조회)
// ============================================================================

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'deadline',
    title: '마감 임박 알림',
    message: '서울시 초음파유량계 구매 입찰이 3일 후 마감됩니다.',
    bidId: 'bid-001',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-002',
    type: 'new_bid',
    title: '새 입찰 등록',
    message: '새로운 입찰 공고가 등록되었습니다: 부산시 유량계 설치',
    bidId: 'bid-002',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-003',
    type: 'match',
    title: '제품 매칭 완료',
    message: '입찰 "한전 계측기 교체"에 적합한 제품이 발견되었습니다.',
    bidId: 'bid-003',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ============================================================================
// GET /api/v1/notifications - 알림 목록 조회
// ============================================================================

async function handleGet(request: NextRequest): Promise<NextResponse<ApiResponse<Notification[]>>> {
  try {
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unread') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    let notifications = [...mockNotifications];

    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    notifications = notifications.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    logger.error('GET /api/v1/notifications 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/v1/notifications - 알림 읽음 처리
// ============================================================================

async function handlePost(
  request: AuthenticatedRequest
): Promise<NextResponse<ApiResponse<{ updated: number }>>> {
  try {
    const body = await request.json();

    const parseResult = markReadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청 데이터입니다',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { notificationIds } = parseResult.data;

    // Mock: 읽음 처리
    let updated = 0;
    for (const id of notificationIds) {
      const notif = mockNotifications.find(n => n.id === id);
      if (notif && !notif.read) {
        notif.read = true;
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      data: { updated },
    });
  } catch (error) {
    logger.error('POST /api/v1/notifications 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/v1/notifications/settings - 알림 설정 조회
// ============================================================================

// 설정 조회/수정은 별도 라우트로 분리 가능

// ============================================================================
// 라우트 익스포트
// ============================================================================

export const GET = withRateLimit(
  withAuth(handleGet, { requireAuth: true, allowedRoles: ['admin', 'user', 'viewer'] }),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);

export const POST = withRateLimit(
  withCSRF(
    withAuth(handlePost, { requireAuth: true, allowedRoles: ['admin', 'user'] })
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);

// 알림 설정 관련 핸들러 (PUT)
async function handlePut(
  request: AuthenticatedRequest
): Promise<NextResponse<ApiResponse<NotificationSettings>>> {
  try {
    const body = await request.json();

    const parseResult = notificationSettingsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 설정 데이터입니다',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Mock: 설정 저장 (실제로는 DB에 저장)
    const settings: NotificationSettings = {
      email: {
        enabled: parseResult.data.email?.enabled ?? true,
        address: parseResult.data.email?.address ?? '',
        frequency: parseResult.data.email?.frequency ?? 'immediate',
      },
      slack: {
        enabled: parseResult.data.slack?.enabled ?? false,
        webhookUrl: parseResult.data.slack?.webhookUrl,
        channel: parseResult.data.slack?.channel,
      },
      filters: {
        minAmount: parseResult.data.filters?.minAmount,
        sources: parseResult.data.filters?.sources,
        priorities: parseResult.data.filters?.priorities,
      },
    };

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('PUT /api/v1/notifications 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

export const PUT = withRateLimit(
  withCSRF(
    withAuth(handlePut, { requireAuth: true, allowedRoles: ['admin', 'user'] })
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
