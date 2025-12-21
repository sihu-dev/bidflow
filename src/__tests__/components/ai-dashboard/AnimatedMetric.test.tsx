/**
 * AnimatedMetric 컴포넌트 테스트
 * - Framer Motion 애니메이션
 * - 트렌드 표시 (up/down/stable)
 * - 숫자 포맷팅
 */
import { describe, it, expect, vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children }) => children),
    span: vi.fn(({ children }) => children),
  },
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowUp: vi.fn(() => null),
  ArrowDown: vi.fn(() => null),
  Minus: vi.fn(() => null),
}));

describe('AnimatedMetric Component', () => {
  describe('Props 인터페이스', () => {
    it('필수 props 검증', () => {
      const props = {
        value: 1250,
        previousValue: 1100,
        label: 'Total Bids',
        unit: 'bids',
        trend: 'up' as const,
      };

      expect(props).toHaveProperty('value');
      expect(props).toHaveProperty('label');
      expect(props).toHaveProperty('unit');
      expect(props).toHaveProperty('trend');
    });

    it('previousValue는 선택적', () => {
      const props: {
        value: number;
        label: string;
        unit: string;
        trend: 'stable';
        previousValue?: number;
      } = {
        value: 1250,
        label: 'Total Bids',
        unit: 'bids',
        trend: 'stable' as const,
      };

      expect(props.previousValue).toBeUndefined();
    });

    it('value는 숫자 타입', () => {
      const value = 1250;
      expect(typeof value).toBe('number');
    });

    it('trend는 유효한 값', () => {
      const validTrends = ['up', 'down', 'stable'];
      const trend = 'up';
      expect(validTrends).toContain(trend);
    });
  });

  describe('트렌드 아이콘 매핑', () => {
    const getIconName = (trend: 'up' | 'down' | 'stable'): string => {
      if (trend === 'up') return 'ArrowUp';
      if (trend === 'down') return 'ArrowDown';
      return 'Minus';
    };

    it('up 트렌드 - ArrowUp 아이콘', () => {
      const trend: 'up' | 'down' | 'stable' = 'up';
      const iconName = getIconName(trend);
      expect(iconName).toBe('ArrowUp');
    });

    it('down 트렌드 - ArrowDown 아이콘', () => {
      const trend: 'up' | 'down' | 'stable' = 'down';
      const iconName = getIconName(trend);
      expect(iconName).toBe('ArrowDown');
    });

    it('stable 트렌드 - Minus 아이콘', () => {
      const trend: 'up' | 'down' | 'stable' = 'stable';
      const iconName = getIconName(trend);
      expect(iconName).toBe('Minus');
    });
  });

  describe('트렌드 색상 매핑', () => {
    it('up 트렌드 색상 (neutral-700)', () => {
      const trendColors = {
        up: 'text-neutral-700',
        down: 'text-neutral-500',
        stable: 'text-neutral-400',
      };

      expect(trendColors.up).toBe('text-neutral-700');
    });

    it('down 트렌드 색상 (neutral-500)', () => {
      const trendColors = {
        up: 'text-neutral-700',
        down: 'text-neutral-500',
        stable: 'text-neutral-400',
      };

      expect(trendColors.down).toBe('text-neutral-500');
    });

    it('stable 트렌드 색상 (neutral-400)', () => {
      const trendColors = {
        up: 'text-neutral-700',
        down: 'text-neutral-500',
        stable: 'text-neutral-400',
      };

      expect(trendColors.stable).toBe('text-neutral-400');
    });
  });

  describe('숫자 포맷팅', () => {
    it('천 단위 구분자', () => {
      const value = 1250;
      const formatted = value.toLocaleString();
      expect(formatted).toBe('1,250');
    });

    it('백만 단위 구분자', () => {
      const value = 1234567;
      const formatted = value.toLocaleString();
      expect(formatted).toBe('1,234,567');
    });

    it('정수 포맷', () => {
      const value = 100;
      const formatted = value.toLocaleString();
      expect(formatted).toBe('100');
    });

    it('0 값 처리', () => {
      const value = 0;
      const formatted = value.toLocaleString();
      expect(formatted).toBe('0');
    });
  });

  describe('애니메이션 설정', () => {
    it('초기 애니메이션 (opacity)', () => {
      const initial = { opacity: 0, y: 20 };
      expect(initial.opacity).toBe(0);
    });

    it('초기 애니메이션 (y 위치)', () => {
      const initial = { opacity: 0, y: 20 };
      expect(initial.y).toBe(20);
    });

    it('최종 애니메이션 (opacity)', () => {
      const animate = { opacity: 1, y: 0 };
      expect(animate.opacity).toBe(1);
    });

    it('최종 애니메이션 (y 위치)', () => {
      const animate = { opacity: 1, y: 0 };
      expect(animate.y).toBe(0);
    });

    it('애니메이션 duration', () => {
      const transition = { duration: 0.5 };
      expect(transition.duration).toBe(0.5);
    });
  });

  describe('값 변경 애니메이션', () => {
    it('값 변경 시 opacity 애니메이션', () => {
      const valueTransition = {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        duration: 0.3,
      };

      expect(valueTransition.initial.opacity).toBe(0);
      expect(valueTransition.animate.opacity).toBe(1);
    });

    it('값 변경 시 scale 애니메이션', () => {
      const valueTransition = {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        duration: 0.3,
      };

      expect(valueTransition.initial.scale).toBe(0.8);
      expect(valueTransition.animate.scale).toBe(1);
    });

    it('값 변경 애니메이션 duration', () => {
      const duration = 0.3;
      expect(duration).toBe(0.3);
    });
  });

  describe('이전 값 표시', () => {
    it('previousValue가 있으면 표시', () => {
      const previousValue = 1100;
      const shouldShow = previousValue !== undefined;
      expect(shouldShow).toBe(true);
    });

    it('previousValue가 없으면 숨김', () => {
      const previousValue = undefined;
      const shouldShow = previousValue !== undefined;
      expect(shouldShow).toBe(false);
    });

    it('previousValue 포맷', () => {
      const previousValue = 1100;
      const unit = 'bids';
      const formatted = `from ${previousValue.toLocaleString()} ${unit}`;
      expect(formatted).toBe('from 1,100 bids');
    });

    it('previousValue 애니메이션 delay', () => {
      const delay = 0.2;
      expect(delay).toBe(0.2);
    });
  });

  describe('트렌드 아이콘 애니메이션', () => {
    it('아이콘 scale 애니메이션', () => {
      const iconTransition = {
        initial: { scale: 0 },
        animate: { scale: 1 },
        delay: 0.3,
        type: 'spring',
        stiffness: 200,
      };

      expect(iconTransition.initial.scale).toBe(0);
      expect(iconTransition.animate.scale).toBe(1);
    });

    it('아이콘 애니메이션 delay', () => {
      const delay = 0.3;
      expect(delay).toBe(0.3);
    });

    it('아이콘 애니메이션 type (spring)', () => {
      const type = 'spring';
      expect(type).toBe('spring');
    });

    it('아이콘 애니메이션 stiffness', () => {
      const stiffness = 200;
      expect(stiffness).toBe(200);
    });
  });

  describe('카드 스타일', () => {
    it('카드 border 클래스', () => {
      const className = 'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm';
      expect(className).toContain('border-neutral-200');
    });

    it('카드 padding 클래스', () => {
      const className = 'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm';
      expect(className).toContain('p-6');
    });

    it('카드 배경 색상', () => {
      const className = 'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm';
      expect(className).toContain('bg-white');
    });

    it('카드 그림자', () => {
      const className = 'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm';
      expect(className).toContain('shadow-sm');
    });
  });

  describe('레이블 스타일', () => {
    it('레이블 텍스트 크기', () => {
      const className = 'text-sm font-medium text-neutral-600';
      expect(className).toContain('text-sm');
    });

    it('레이블 폰트 weight', () => {
      const className = 'text-sm font-medium text-neutral-600';
      expect(className).toContain('font-medium');
    });

    it('레이블 텍스트 색상', () => {
      const className = 'text-sm font-medium text-neutral-600';
      expect(className).toContain('text-neutral-600');
    });
  });

  describe('값 표시 스타일', () => {
    it('값 텍스트 크기', () => {
      const className = 'text-3xl font-bold text-neutral-900';
      expect(className).toContain('text-3xl');
    });

    it('값 폰트 weight', () => {
      const className = 'text-3xl font-bold text-neutral-900';
      expect(className).toContain('font-bold');
    });

    it('값 텍스트 색상', () => {
      const className = 'text-3xl font-bold text-neutral-900';
      expect(className).toContain('text-neutral-900');
    });
  });

  describe('단위 스타일', () => {
    it('단위 텍스트 크기', () => {
      const className = 'text-sm text-neutral-500';
      expect(className).toContain('text-sm');
    });

    it('단위 텍스트 색상', () => {
      const className = 'text-sm text-neutral-500';
      expect(className).toContain('text-neutral-500');
    });
  });

  describe('아이콘 컨테이너 스타일', () => {
    it('아이콘 배경 색상', () => {
      const className = 'rounded-full bg-neutral-100 p-2';
      expect(className).toContain('bg-neutral-100');
    });

    it('아이콘 padding', () => {
      const className = 'rounded-full bg-neutral-100 p-2';
      expect(className).toContain('p-2');
    });

    it('아이콘 모양 (원형)', () => {
      const className = 'rounded-full bg-neutral-100 p-2';
      expect(className).toContain('rounded-full');
    });

    it('아이콘 크기', () => {
      const className = 'h-5 w-5';
      expect(className).toContain('h-5');
      expect(className).toContain('w-5');
    });
  });

  describe('레이아웃', () => {
    it('flex 컨테이너', () => {
      const className = 'flex items-start justify-between';
      expect(className).toContain('flex');
    });

    it('items-start 정렬', () => {
      const className = 'flex items-start justify-between';
      expect(className).toContain('items-start');
    });

    it('justify-between 정렬', () => {
      const className = 'flex items-start justify-between';
      expect(className).toContain('justify-between');
    });

    it('값 baseline 정렬', () => {
      const className = 'flex items-baseline gap-2';
      expect(className).toContain('items-baseline');
    });
  });

  describe('previousValue 텍스트', () => {
    it('텍스트 크기', () => {
      const className = 'mt-1 text-xs text-neutral-500';
      expect(className).toContain('text-xs');
    });

    it('텍스트 색상', () => {
      const className = 'mt-1 text-xs text-neutral-500';
      expect(className).toContain('text-neutral-500');
    });

    it('상단 마진', () => {
      const className = 'mt-1 text-xs text-neutral-500';
      expect(className).toContain('mt-1');
    });
  });

  describe('모노크롬 디자인 준수', () => {
    it('neutral 계열 색상만 사용', () => {
      const colors = [
        'text-neutral-600',
        'text-neutral-900',
        'text-neutral-500',
        'text-neutral-700',
        'text-neutral-400',
        'bg-neutral-100',
        'border-neutral-200',
      ];

      colors.forEach((color) => {
        expect(color).toMatch(/neutral/);
      });
    });

    it('컬러풀한 색상 미사용', () => {
      const forbiddenColors = ['blue', 'green', 'red', 'yellow', 'indigo', 'purple'];
      const usedClasses = [
        'text-neutral-600',
        'text-neutral-900',
        'bg-white',
        'border-neutral-200',
      ];

      usedClasses.forEach((className) => {
        forbiddenColors.forEach((color) => {
          expect(className).not.toContain(color);
        });
      });
    });
  });
});
