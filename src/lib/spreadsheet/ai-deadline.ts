/**
 * AI_DEADLINE() 함수 구현
 * 마감일 분석 및 권장 액션 제안
 * Redis 캐싱 적용 (30일 TTL)
 */

import { getCache, setCache, createCacheKey, CacheTTL } from '@/lib/cache/redis-cache';

/**
 * 마감일 분석 결과
 */
export interface DeadlineAnalysis {
  /** D-Day 숫자 */
  dday: number;
  /** D-Day 표시 문자열 */
  ddayLabel: string;
  /** 긴급도 */
  urgency: 'urgent' | 'normal' | 'relaxed';
  /** 긴급도 라벨 */
  urgencyLabel: string;
  /** 권장 액션 목록 */
  actions: string[];
  /** 알림 발송 여부 */
  shouldNotify: boolean;
  /** 상태 색상 */
  statusColor: 'red' | 'yellow' | 'green';
}

/**
 * 마감일 분석 및 액션 제안
 *
 * 알고리즘:
 * - D-3 이하: 긴급 (즉시 검토)
 * - D-7 이하: 보통 (7일 계획)
 * - D-7 초과: 여유 (장기 계획)
 *
 * @param deadline 마감일
 * @returns 마감일 분석 결과
 *
 * @example
 * ```typescript
 * const analysis = AI_DEADLINE(new Date('2025-02-01'));
 * // → {
 * //   dday: 7,
 * //   ddayLabel: 'D-7',
 * //   urgency: 'normal',
 * //   actions: ['D-7: 내부 검토', 'D-3: 제안서 작성', ...]
 * // }
 * ```
 */
export async function AI_DEADLINE(deadline: Date | string): Promise<DeadlineAnalysis> {
  // Date 객체로 변환
  const deadlineDate = typeof deadline === 'string'
    ? new Date(deadline)
    : deadline;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 정보 제거

  const deadlineNorm = new Date(deadlineDate);
  deadlineNorm.setHours(0, 0, 0, 0);

  // 캐시 키 생성 (deadline + 오늘 날짜 기반)
  const todayStr = today.toISOString().split('T')[0];
  const deadlineStr = deadlineNorm.toISOString().split('T')[0];
  const cacheKey = createCacheKey('ai', 'deadline', deadlineStr, todayStr);

  // 캐시 조회
  const cached = await getCache<DeadlineAnalysis>(cacheKey);
  if (cached) {
    return cached;
  }

  // D-Day 계산
  const diffMs = deadlineNorm.getTime() - today.getTime();
  const dday = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // D-Day 라벨
  const ddayLabel = dday > 0
    ? `D-${dday}`
    : dday === 0
    ? 'D-Day'
    : `D+${Math.abs(dday)}`;

  // 긴급도 및 액션 결정
  let result: DeadlineAnalysis;

  if (dday <= 0) {
    // 마감일 지남
    result = {
      dday,
      ddayLabel,
      urgency: 'urgent',
      urgencyLabel: '마감',
      actions: ['마감일이 지났습니다'],
      shouldNotify: false,
      statusColor: 'red',
    };
  } else if (dday <= 3) {
    // D-3 이하: 긴급
    result = {
      dday,
      ddayLabel,
      urgency: 'urgent',
      urgencyLabel: '긴급',
      actions: [
        '즉시 내부 검토 회의 소집',
        '오늘 중 입찰 참여 여부 최종 결정',
        '기존 제안서 템플릿 활용 (신규 작성 불가)',
        '필수 서류만 준비 (간소화)',
        '담당자 비상 연락망 가동',
      ],
      shouldNotify: true,
      statusColor: 'red',
    };
  } else if (dday <= 7) {
    // D-7 이하: 보통
    result = {
      dday,
      ddayLabel,
      urgency: 'normal',
      urgencyLabel: '보통',
      actions: [
        `오늘 (D-${dday}): 내부 검토 시작 및 참여 여부 의사결정`,
        'D-5: 제안서 초안 작성 시작',
        'D-3: 제안서 작성 완료 및 내부 검토',
        'D-1: 최종 검토 및 제출 준비',
        'D-Day: 오전 중 제출 완료',
      ],
      shouldNotify: dday <= 5, // D-5부터 알림
      statusColor: 'yellow',
    };
  } else if (dday <= 14) {
    // D-14 이하: 여유
    result = {
      dday,
      ddayLabel,
      urgency: 'relaxed',
      urgencyLabel: '여유',
      actions: [
        `오늘 (D-${dday}): 예비 검토 및 정보 수집`,
        `D-${Math.max(dday - 7, 7)}: 내부 검토 회의`,
        'D-7: 제안서 작성 시작',
        'D-3: 제안서 작성 완료',
        'D-2: 최종 검토',
        'D-1: 제출 준비',
      ],
      shouldNotify: false,
      statusColor: 'green',
    };
  } else {
    // D-14 초과: 장기
    result = {
      dday,
      ddayLabel,
      urgency: 'relaxed',
      urgencyLabel: '장기',
      actions: [
        `D-${Math.floor(dday / 2)}: 예비 검토`,
        'D-14: 본격 검토 시작',
        'D-10: 제안서 작성 계획 수립',
        'D-7: 제안서 작성 시작',
        'D-2: 최종 검토 및 제출',
      ],
      shouldNotify: false,
      statusColor: 'green',
    };
  }

  // 캐시 저장 (비동기, 에러 무시)
  setCache(cacheKey, result, CacheTTL.AI_DEADLINE).catch(() => {
    // 캐싱 실패해도 결과는 반환
  });

  return result;
}

/**
 * 간단한 D-Day 문자열 반환
 *
 * @param deadline 마감일
 * @returns "D-7" 형식 문자열
 */
export async function getSimpleDday(deadline: Date | string): Promise<string> {
  const analysis = await AI_DEADLINE(deadline);
  return analysis.ddayLabel;
}

/**
 * 긴급도 확인
 *
 * @param deadline 마감일
 * @returns 긴급 여부
 */
export async function isUrgent(deadline: Date | string): Promise<boolean> {
  const analysis = await AI_DEADLINE(deadline);
  return analysis.urgency === 'urgent';
}

/**
 * 알림 발송 필요 여부
 *
 * @param deadline 마감일
 * @returns 알림 발송 필요 여부
 */
export async function shouldSendReminder(deadline: Date | string): Promise<boolean> {
  const analysis = await AI_DEADLINE(deadline);
  return analysis.shouldNotify;
}

/**
 * 마감일 그룹화
 */
export interface DeadlineGroup {
  urgent: Array<{ id: string; deadline: Date; dday: number }>;  // D-3 이하
  thisWeek: Array<{ id: string; deadline: Date; dday: number }>; // D-7 이하
  nextWeek: Array<{ id: string; deadline: Date; dday: number }>; // D-14 이하
  later: Array<{ id: string; deadline: Date; dday: number }>;    // D-14 초과
}

/**
 * 여러 마감일을 긴급도별로 그룹화
 *
 * @param deadlines 마감일 배열
 * @returns 긴급도별 그룹
 */
export async function groupByDeadline(
  deadlines: Array<{ id: string; deadline: Date | string }>
): Promise<DeadlineGroup> {
  const groups: DeadlineGroup = {
    urgent: [],
    thisWeek: [],
    nextWeek: [],
    later: [],
  };

  for (const item of deadlines) {
    const analysis = await AI_DEADLINE(item.deadline);
    const { dday } = analysis;

    const deadlineDate = typeof item.deadline === 'string'
      ? new Date(item.deadline)
      : item.deadline;

    const entry = { id: item.id, deadline: deadlineDate, dday };

    if (dday <= 3 && dday > 0) {
      groups.urgent.push(entry);
    } else if (dday <= 7 && dday > 0) {
      groups.thisWeek.push(entry);
    } else if (dday <= 14 && dday > 0) {
      groups.nextWeek.push(entry);
    } else if (dday > 0) {
      groups.later.push(entry);
    }
  }

  // 각 그룹 내에서 D-Day 오름차순 정렬
  groups.urgent.sort((a, b) => a.dday - b.dday);
  groups.thisWeek.sort((a, b) => a.dday - b.dday);
  groups.nextWeek.sort((a, b) => a.dday - b.dday);
  groups.later.sort((a, b) => a.dday - b.dday);

  return groups;
}

/**
 * 마감일 포맷팅
 *
 * @param deadline 마감일
 * @param format 포맷 ('short' | 'long')
 * @returns 포맷팅된 문자열
 */
export async function formatDeadline(
  deadline: Date | string,
  format: 'short' | 'long' = 'short'
): Promise<string> {
  const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const analysis = await AI_DEADLINE(deadline);

  if (format === 'short') {
    return `${analysis.ddayLabel} (${date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })})`;
  } else {
    return `${date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} (${analysis.ddayLabel})`;
  }
}
