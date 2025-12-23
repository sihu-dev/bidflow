/**
 * @route /api/v1/export
 * @description 데이터 내보내기 API
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { listBids } from '@/lib/domain/usecases/bid-usecases';
import { z } from 'zod';
import type { ApiResponse, BidData } from '@forge-labs/types/bidding';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 요청 스키마
// ============================================================================

const exportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  columns: z.array(z.string()).optional(),
  filters: z.object({
    status: z.string().optional(),
    source: z.string().optional(),
    priority: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
  }).optional(),
  limit: z.coerce.number().min(1).max(10000).default(1000),
});

// ============================================================================
// 유틸리티 함수
// ============================================================================

function bidToRow(bid: BidData, columns: string[]): Record<string, string> {
  const row: Record<string, string> = {};

  for (const col of columns) {
    switch (col) {
      case 'id':
        row[col] = bid.id;
        break;
      case 'title':
        row[col] = bid.title;
        break;
      case 'organization':
        row[col] = bid.organization;
        break;
      case 'source':
        row[col] = bid.source;
        break;
      case 'status':
        row[col] = bid.status;
        break;
      case 'priority':
        row[col] = bid.priority ?? '';
        break;
      case 'deadline':
        row[col] = bid.deadline;
        break;
      case 'estimatedAmount':
        row[col] = bid.estimatedAmount?.toString() ?? '';
        break;
      case 'type':
        row[col] = bid.type;
        break;
      case 'keywords':
        row[col] = bid.keywords?.join(', ') ?? '';
        break;
      case 'url':
        row[col] = bid.url ?? '';
        break;
      case 'createdAt':
        row[col] = bid.createdAt;
        break;
      case 'updatedAt':
        row[col] = bid.updatedAt;
        break;
      default:
        row[col] = '';
    }
  }

  return row;
}

function generateCSV(bids: readonly BidData[], columns: string[]): string {
  const headerMap: Record<string, string> = {
    id: 'ID',
    title: '제목',
    organization: '발주기관',
    source: '출처',
    status: '상태',
    priority: '우선순위',
    deadline: '마감일',
    estimatedAmount: '추정가',
    type: '유형',
    keywords: '키워드',
    url: 'URL',
    createdAt: '등록일',
    updatedAt: '수정일',
  };

  const headers = columns.map(col => headerMap[col] || col);
  const rows = bids.map(bid => {
    const row = bidToRow(bid, columns);
    return columns.map(col => {
      const value = row[col] || '';
      // CSV 이스케이프
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// ============================================================================
// POST /api/v1/export - 데이터 내보내기
// ============================================================================

async function handlePost(
  request: AuthenticatedRequest
): Promise<NextResponse<ApiResponse<unknown> | Blob | string>> {
  try {
    const body = await request.json();

    // 입력 검증
    const parseResult = exportSchema.safeParse(body);
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

    const { format, columns, filters, limit } = parseResult.data;

    // 기본 컬럼
    const exportColumns = columns || [
      'title',
      'organization',
      'source',
      'status',
      'priority',
      'deadline',
      'estimatedAmount',
      'type',
    ];

    // 입찰 데이터 조회
    const bidsResult = await listBids({
      filters: filters as Record<string, string> | undefined,
      page: 1,
      limit,
    });

    if (!bidsResult.success) {
      return NextResponse.json(bidsResult, { status: 500 });
    }

    const bids = bidsResult.data.items;

    // 포맷별 처리
    switch (format) {
      case 'csv': {
        const csv = generateCSV(bids, exportColumns);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="bidflow_export_${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }

      case 'json': {
        const jsonData = bids.map(bid => bidToRow(bid, exportColumns));
        return NextResponse.json({
          success: true,
          data: {
            exportedAt: new Date().toISOString(),
            count: jsonData.length,
            items: jsonData,
          },
        });
      }

      case 'xlsx': {
        // XLSX 생성은 클라이언트에서 처리 (JSON 반환)
        const jsonData = bids.map(bid => bidToRow(bid, exportColumns));
        return NextResponse.json({
          success: true,
          data: {
            format: 'xlsx',
            exportedAt: new Date().toISOString(),
            count: jsonData.length,
            columns: exportColumns,
            items: jsonData,
            message: 'XLSX 변환은 클라이언트에서 처리하세요',
          },
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNSUPPORTED_FORMAT',
              message: `지원하지 않는 형식입니다: ${format}`,
            },
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('POST /api/v1/export 오류:', error);
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
// 라우트 익스포트
// ============================================================================

export const POST = withRateLimit(
  withAuth(handlePost, { requireAuth: true, allowedRoles: ['admin', 'user'] }),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
