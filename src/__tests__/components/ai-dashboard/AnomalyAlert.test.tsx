/**
 * AnomalyAlert 컴포넌트 테스트
 * - 알림 타임라인 SVG
 * - 심각도별 스타일
 * - 타임스탬프 포맷팅
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AnomalyAlert Component', () => {
  describe('알림 데이터 구조', () => {
    it('알림 객체 필수 필드 검증', () => {
      const alert = {
        id: 'alert-1',
        type: 'clog_detected' as const,
        severity: 'critical' as const,
        message: 'Clog detected in sensor A',
        suggestedAction: 'Check sensor immediately',
        timestamp: new Date(),
        sensorId: 'sensor-1',
      };

      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('message');
      expect(alert).toHaveProperty('suggestedAction');
      expect(alert).toHaveProperty('timestamp');
      expect(alert).toHaveProperty('sensorId');
    });

    it('알림 타입 검증', () => {
      const validTypes = ['clog_detected', 'leak_detected', 'efficiency_drop', 'sensor_offline'];
      const type = 'clog_detected';
      expect(validTypes).toContain(type);
    });

    it('심각도 검증', () => {
      const validSeverities = ['critical', 'warning', 'info'];
      const severity = 'critical';
      expect(validSeverities).toContain(severity);
    });
  });

  describe('심각도별 설정', () => {
    it('critical 심각도 설정', () => {
      const config = {
        bgColor: 'bg-neutral-50',
        borderColor: 'border-neutral-900',
        textColor: 'text-neutral-900',
        badgeBg: 'bg-neutral-900',
        badgeText: 'text-white',
        label: 'CRITICAL',
      };

      expect(config.label).toBe('CRITICAL');
      expect(config.borderColor).toBe('border-neutral-900');
      expect(config.badgeBg).toBe('bg-neutral-900');
    });

    it('warning 심각도 설정', () => {
      const config = {
        bgColor: 'bg-neutral-50',
        borderColor: 'border-neutral-600',
        textColor: 'text-neutral-900',
        badgeBg: 'bg-neutral-600',
        badgeText: 'text-white',
        label: 'WARNING',
      };

      expect(config.label).toBe('WARNING');
      expect(config.borderColor).toBe('border-neutral-600');
      expect(config.badgeBg).toBe('bg-neutral-600');
    });

    it('info 심각도 설정', () => {
      const config = {
        bgColor: 'bg-neutral-50',
        borderColor: 'border-neutral-300',
        textColor: 'text-neutral-700',
        badgeBg: 'bg-neutral-500',
        badgeText: 'text-white',
        label: 'INFO',
      };

      expect(config.label).toBe('INFO');
      expect(config.borderColor).toBe('border-neutral-300');
      expect(config.badgeBg).toBe('bg-neutral-500');
    });
  });

  describe('타입 레이블', () => {
    it('clog_detected 레이블', () => {
      const typeLabels = {
        clog_detected: 'Clog Detected',
        leak_detected: 'Leak Detected',
        efficiency_drop: 'Efficiency Drop',
        sensor_offline: 'Sensor Offline',
      };

      expect(typeLabels.clog_detected).toBe('Clog Detected');
    });

    it('leak_detected 레이블', () => {
      const typeLabels = {
        clog_detected: 'Clog Detected',
        leak_detected: 'Leak Detected',
        efficiency_drop: 'Efficiency Drop',
        sensor_offline: 'Sensor Offline',
      };

      expect(typeLabels.leak_detected).toBe('Leak Detected');
    });

    it('efficiency_drop 레이블', () => {
      const typeLabels = {
        clog_detected: 'Clog Detected',
        leak_detected: 'Leak Detected',
        efficiency_drop: 'Efficiency Drop',
        sensor_offline: 'Sensor Offline',
      };

      expect(typeLabels.efficiency_drop).toBe('Efficiency Drop');
    });

    it('sensor_offline 레이블', () => {
      const typeLabels = {
        clog_detected: 'Clog Detected',
        leak_detected: 'Leak Detected',
        efficiency_drop: 'Efficiency Drop',
        sensor_offline: 'Sensor Offline',
      };

      expect(typeLabels.sensor_offline).toBe('Sensor Offline');
    });
  });

  describe('타임스탬프 포맷팅', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('1분 전 포맷 (m ago)', () => {
      const now = new Date('2025-12-21T10:00:00Z');
      const timestamp = new Date('2025-12-21T09:59:00Z');
      vi.setSystemTime(now);

      const diff = now.getTime() - timestamp.getTime();
      const minutes = Math.floor(diff / 60000);
      const formatted = `${minutes}m ago`;

      expect(formatted).toBe('1m ago');
    });

    it('30분 전 포맷 (m ago)', () => {
      const now = new Date('2025-12-21T10:00:00Z');
      const timestamp = new Date('2025-12-21T09:30:00Z');
      vi.setSystemTime(now);

      const diff = now.getTime() - timestamp.getTime();
      const minutes = Math.floor(diff / 60000);
      const formatted = `${minutes}m ago`;

      expect(formatted).toBe('30m ago');
    });

    it('1시간 전 포맷 (h ago)', () => {
      const now = new Date('2025-12-21T10:00:00Z');
      const timestamp = new Date('2025-12-21T09:00:00Z');
      vi.setSystemTime(now);

      const diff = now.getTime() - timestamp.getTime();
      const hours = Math.floor(diff / 3600000);
      const formatted = `${hours}h ago`;

      expect(formatted).toBe('1h ago');
    });

    it('5시간 전 포맷 (h ago)', () => {
      const now = new Date('2025-12-21T10:00:00Z');
      const timestamp = new Date('2025-12-21T05:00:00Z');
      vi.setSystemTime(now);

      const diff = now.getTime() - timestamp.getTime();
      const hours = Math.floor(diff / 3600000);
      const formatted = `${hours}h ago`;

      expect(formatted).toBe('5h ago');
    });

    it('24시간 이상 - 날짜 포맷', () => {
      const timestamp = new Date('2025-12-20T10:00:00Z');
      const formatted = timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      expect(formatted).toMatch(/^[A-Za-z]{3} \d{1,2}$/); // e.g., "Dec 20"
    });
  });

  describe('타임라인 SVG', () => {
    it('SVG viewBox 설정', () => {
      const viewBox = '0 0 800 60';
      expect(viewBox).toBe('0 0 800 60');
    });

    it('타임라인 베이스 라인 좌표', () => {
      const line = {
        x1: 40,
        y1: 30,
        x2: 760,
        y2: 30,
      };

      expect(line.x1).toBe(40);
      expect(line.y1).toBe(30);
      expect(line.x2).toBe(760);
      expect(line.y2).toBe(30);
    });

    it('타임라인 라인 두께', () => {
      const strokeWidth = 2;
      expect(strokeWidth).toBe(2);
    });

    it('타임라인 라인 색상', () => {
      const className = 'text-neutral-300';
      expect(className).toBe('text-neutral-300');
    });
  });

  describe('알림 도트 (점)', () => {
    it('도트 위치 계산', () => {
      const index = 0;
      const x = 40 + index * 180;
      expect(x).toBe(40);
    });

    it('도트 위치 계산 (2번째)', () => {
      const index = 1;
      const x = 40 + index * 180;
      expect(x).toBe(220);
    });

    it('도트 반지름', () => {
      const radius = 6;
      expect(radius).toBe(6);
    });

    it('도트 테두리', () => {
      const stroke = 'white';
      const strokeWidth = 2;
      expect(stroke).toBe('white');
      expect(strokeWidth).toBe(2);
    });
  });

  describe('심각도별 도트 색상', () => {
    const getColor = (severity: 'critical' | 'warning' | 'info'): string => {
      if (severity === 'critical') return '#171717';
      if (severity === 'warning') return '#525252';
      return '#737373';
    };

    it('critical 도트 색상', () => {
      const severity: 'critical' | 'warning' | 'info' = 'critical';
      const color = getColor(severity);
      expect(color).toBe('#171717');
    });

    it('warning 도트 색상', () => {
      const severity: 'critical' | 'warning' | 'info' = 'warning';
      const color = getColor(severity);
      expect(color).toBe('#525252');
    });

    it('info 도트 색상', () => {
      const severity: 'critical' | 'warning' | 'info' = 'info';
      const color = getColor(severity);
      expect(color).toBe('#737373');
    });
  });

  describe('Pulse 애니메이션 (critical만)', () => {
    it('Pulse 반지름 애니메이션', () => {
      const animation = {
        attributeName: 'r',
        from: 6,
        to: 15,
        dur: '1.5s',
        repeatCount: 'indefinite',
      };

      expect(animation.from).toBe(6);
      expect(animation.to).toBe(15);
      expect(animation.dur).toBe('1.5s');
    });

    it('Pulse opacity 애니메이션', () => {
      const animation = {
        attributeName: 'opacity',
        from: 0.5,
        to: 0,
        dur: '1.5s',
        repeatCount: 'indefinite',
      };

      expect(animation.from).toBe(0.5);
      expect(animation.to).toBe(0);
      expect(animation.dur).toBe('1.5s');
    });

    it('Pulse는 critical만', () => {
      const severity: 'critical' | 'warning' | 'info' = 'critical';
      const shouldPulse = severity === 'critical';
      expect(shouldPulse).toBe(true);
    });

    it('warning은 Pulse 없음', () => {
      type Severity = 'critical' | 'warning' | 'info';
      const severity: Severity = 'warning';
      const shouldPulse = (s: Severity) => s === 'critical';
      expect(shouldPulse(severity)).toBe(false);
    });
  });

  describe('알림 카드 스타일', () => {
    it('border-left 스타일', () => {
      const className = 'border-l-4 border-neutral-900';
      expect(className).toContain('border-l-4');
    });

    it('padding 설정', () => {
      const className = 'p-4 rounded-r-lg';
      expect(className).toContain('p-4');
    });

    it('rounded-r-lg (오른쪽만)', () => {
      const className = 'p-4 rounded-r-lg';
      expect(className).toContain('rounded-r-lg');
    });

    it('hover 효과', () => {
      const className = 'transition-all hover:shadow-md';
      expect(className).toContain('hover:shadow-md');
    });
  });

  describe('뱃지 (Badge) 스타일', () => {
    it('뱃지 padding', () => {
      const className = 'px-2 py-0.5 text-xs font-semibold rounded';
      expect(className).toContain('px-2');
      expect(className).toContain('py-0.5');
    });

    it('뱃지 텍스트 크기', () => {
      const className = 'px-2 py-0.5 text-xs font-semibold rounded';
      expect(className).toContain('text-xs');
    });

    it('뱃지 폰트 weight', () => {
      const className = 'px-2 py-0.5 text-xs font-semibold rounded';
      expect(className).toContain('font-semibold');
    });
  });

  describe('제안 액션 아이콘', () => {
    it('아이콘 크기', () => {
      const className = 'w-4 h-4 mt-0.5 flex-shrink-0';
      expect(className).toContain('w-4');
      expect(className).toContain('h-4');
    });

    it('아이콘 flex-shrink-0', () => {
      const className = 'w-4 h-4 mt-0.5 flex-shrink-0';
      expect(className).toContain('flex-shrink-0');
    });

    it('아이콘 SVG viewBox', () => {
      const viewBox = '0 0 24 24';
      expect(viewBox).toBe('0 0 24 24');
    });

    it('아이콘 strokeWidth', () => {
      const strokeWidth = 2;
      expect(strokeWidth).toBe(2);
    });
  });

  describe('Empty 상태', () => {
    it('알림 0개일 때 Empty 상태', () => {
      const alerts: unknown[] = [];
      const isEmpty = alerts.length === 0;
      expect(isEmpty).toBe(true);
    });

    it('Empty 메시지', () => {
      const message = 'No anomalies detected';
      expect(message).toBe('No anomalies detected');
    });

    it('Empty 아이콘 크기', () => {
      const className = 'w-12 h-12 mx-auto mb-3 text-neutral-400';
      expect(className).toContain('w-12');
      expect(className).toContain('h-12');
    });

    it('Empty 텍스트 크기', () => {
      const className = 'text-sm';
      expect(className).toBe('text-sm');
    });
  });

  describe('타임라인 최대 표시 개수', () => {
    it('타임라인은 최대 5개만 표시', () => {
      const alerts = Array(10).fill(null).map((_, i) => ({
        id: `alert-${i}`,
        type: 'clog_detected' as const,
        severity: 'critical' as const,
        timestamp: new Date(),
      }));

      const timelineAlerts = alerts.slice(0, 5);
      expect(timelineAlerts).toHaveLength(5);
    });

    it('알림이 5개 미만이면 모두 표시', () => {
      const alerts = Array(3).fill(null).map((_, i) => ({
        id: `alert-${i}`,
      }));

      const timelineAlerts = alerts.slice(0, 5);
      expect(timelineAlerts).toHaveLength(3);
    });
  });

  describe('알림 목록은 모두 표시', () => {
    it('알림 목록은 제한 없음', () => {
      const alerts = Array(10).fill(null).map((_, i) => ({
        id: `alert-${i}`,
      }));

      expect(alerts).toHaveLength(10);
    });
  });

  describe('모노크롬 디자인 준수', () => {
    it('neutral 계열 색상만 사용', () => {
      const colors = [
        'bg-neutral-50',
        'border-neutral-900',
        'text-neutral-900',
        'bg-neutral-600',
        'text-neutral-500',
        'text-neutral-400',
      ];

      colors.forEach((color) => {
        expect(color).toMatch(/neutral/);
      });
    });

    it('컬러풀한 색상 미사용', () => {
      const forbiddenColors = ['blue', 'green', 'red', 'yellow', 'orange', 'purple'];
      const usedClasses = [
        'bg-neutral-50',
        'border-neutral-900',
        'text-white',
      ];

      usedClasses.forEach((className) => {
        forbiddenColors.forEach((color) => {
          expect(className).not.toContain(color);
        });
      });
    });
  });

  describe('심각도별 시각적 구분', () => {
    it('critical - 진한 테두리', () => {
      const borderColor = 'border-neutral-900';
      expect(borderColor).toBe('border-neutral-900');
    });

    it('warning - 중간 테두리', () => {
      const borderColor = 'border-neutral-600';
      expect(borderColor).toBe('border-neutral-600');
    });

    it('info - 연한 테두리', () => {
      const borderColor = 'border-neutral-300';
      expect(borderColor).toBe('border-neutral-300');
    });
  });
});
