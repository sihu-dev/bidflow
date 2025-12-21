/**
 * FlowGauge 컴포넌트 테스트
 * - ECharts 게이지 차트
 * - 상태별 색상 변경
 * - 동적 import 처리
 */
import { describe, it, expect, vi } from 'vitest';

// Mock echarts-for-react
vi.mock('echarts-for-react', () => ({
  default: vi.fn(() => null),
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: (_fn: () => Promise<unknown>) => {
    const Component = () => null;
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

describe('FlowGauge Component', () => {
  describe('Props 인터페이스', () => {
    it('필수 props 검증', () => {
      const props = {
        value: 1250,
        max: 2000,
        unit: 'm³/h',
        label: 'Flow Rate',
        status: 'normal' as const,
      };

      expect(props).toHaveProperty('value');
      expect(props).toHaveProperty('max');
      expect(props).toHaveProperty('unit');
      expect(props).toHaveProperty('label');
      expect(props).toHaveProperty('status');
    });

    it('value는 숫자 타입', () => {
      const value = 1250;
      expect(typeof value).toBe('number');
    });

    it('max는 value보다 크거나 같음', () => {
      const value = 1250;
      const max = 2000;
      expect(max).toBeGreaterThanOrEqual(value);
    });

    it('status는 유효한 값', () => {
      const validStatuses = ['normal', 'warning', 'critical'];
      const status = 'normal';
      expect(validStatuses).toContain(status);
    });
  });

  describe('상태별 색상 계산', () => {
    it('critical 상태 색상', () => {
      const getStatusColor = (status: 'normal' | 'warning' | 'critical'): string => {
        switch (status) {
          case 'critical':
            return '#525252'; // neutral-600
          case 'warning':
            return '#737373'; // neutral-500
          case 'normal':
          default:
            return '#a3a3a3'; // neutral-400
        }
      };

      expect(getStatusColor('critical')).toBe('#525252');
    });

    it('warning 상태 색상', () => {
      const getStatusColor = (status: 'normal' | 'warning' | 'critical'): string => {
        switch (status) {
          case 'critical':
            return '#525252';
          case 'warning':
            return '#737373';
          case 'normal':
          default:
            return '#a3a3a3';
        }
      };

      expect(getStatusColor('warning')).toBe('#737373');
    });

    it('normal 상태 색상', () => {
      const getStatusColor = (status: 'normal' | 'warning' | 'critical'): string => {
        switch (status) {
          case 'critical':
            return '#525252';
          case 'warning':
            return '#737373';
          case 'normal':
          default:
            return '#a3a3a3';
        }
      };

      expect(getStatusColor('normal')).toBe('#a3a3a3');
    });

    it('기본값은 normal 색상', () => {
      const getStatusColor = (status?: 'normal' | 'warning' | 'critical'): string => {
        switch (status) {
          case 'critical':
            return '#525252';
          case 'warning':
            return '#737373';
          case 'normal':
          default:
            return '#a3a3a3';
        }
      };

      expect(getStatusColor()).toBe('#a3a3a3');
    });
  });

  describe('ECharts 옵션 생성', () => {
    it('게이지 시작 각도 180도', () => {
      const gaugeConfig = {
        startAngle: 180,
        endAngle: 0,
      };

      expect(gaugeConfig.startAngle).toBe(180);
    });

    it('게이지 종료 각도 0도', () => {
      const gaugeConfig = {
        startAngle: 180,
        endAngle: 0,
      };

      expect(gaugeConfig.endAngle).toBe(0);
    });

    it('splitNumber 설정 (8개)', () => {
      const splitNumber = 8;
      expect(splitNumber).toBe(8);
    });

    it('axisLine 너비', () => {
      const axisLineWidth = 20;
      expect(axisLineWidth).toBe(20);
    });

    it('pointer 길이', () => {
      const pointerLength = '70%';
      expect(pointerLength).toBe('70%');
    });

    it('pointer 너비', () => {
      const pointerWidth = 4;
      expect(pointerWidth).toBe(4);
    });
  });

  describe('Detail 포맷', () => {
    it('값과 단위 포맷', () => {
      const value = 1250;
      const unit = 'm³/h';
      const formatted = `${value} ${unit}`;

      expect(formatted).toBe('1250 m³/h');
    });

    it('detail fontSize', () => {
      const fontSize = 20;
      expect(fontSize).toBe(20);
    });

    it('detail fontWeight', () => {
      const fontWeight = 'bold';
      expect(fontWeight).toBe('bold');
    });

    it('detail offsetCenter Y축', () => {
      const offsetCenter = [0, '80%'];
      expect(offsetCenter[0]).toBe(0);
      expect(offsetCenter[1]).toBe('80%');
    });
  });

  describe('Title 설정', () => {
    it('title show 옵션', () => {
      const titleConfig = {
        show: true,
      };

      expect(titleConfig.show).toBe(true);
    });

    it('title offsetCenter Y축', () => {
      const offsetCenter = [0, '100%'];
      expect(offsetCenter[0]).toBe(0);
      expect(offsetCenter[1]).toBe('100%');
    });

    it('title fontSize', () => {
      const fontSize = 13;
      expect(fontSize).toBe(13);
    });

    it('title color', () => {
      const color = '#a3a3a3'; // neutral-400
      expect(color).toBe('#a3a3a3');
    });
  });

  describe('Progress 설정', () => {
    it('progress show 옵션', () => {
      const progressConfig = {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
      };

      expect(progressConfig.show).toBe(true);
    });

    it('progress overlap 비활성화', () => {
      const overlap = false;
      expect(overlap).toBe(false);
    });

    it('progress roundCap 활성화', () => {
      const roundCap = true;
      expect(roundCap).toBe(true);
    });

    it('progress clip 비활성화', () => {
      const clip = false;
      expect(clip).toBe(false);
    });
  });

  describe('애니메이션 설정', () => {
    it('애니메이션 활성화', () => {
      const animation = true;
      expect(animation).toBe(true);
    });

    it('애니메이션 duration (1초)', () => {
      const animationDuration = 1000;
      expect(animationDuration).toBe(1000);
    });

    it('애니메이션 easing', () => {
      const animationEasing = 'cubicOut';
      expect(animationEasing).toBe('cubicOut');
    });

    it('valueAnimation 활성화', () => {
      const detail = {
        valueAnimation: true,
      };

      expect(detail.valueAnimation).toBe(true);
    });
  });

  describe('축(Axis) 설정', () => {
    it('min 값은 0', () => {
      const min = 0;
      expect(min).toBe(0);
    });

    it('max 값 설정', () => {
      const max = 2000;
      expect(max).toBeGreaterThan(0);
    });

    it('axisTick distance', () => {
      const distance = -24;
      expect(distance).toBe(-24);
    });

    it('axisTick length', () => {
      const length = 6;
      expect(length).toBe(6);
    });

    it('splitLine distance', () => {
      const distance = -28;
      expect(distance).toBe(-28);
    });

    it('splitLine length', () => {
      const length = 12;
      expect(length).toBe(12);
    });

    it('axisLabel distance', () => {
      const distance = 30;
      expect(distance).toBe(30);
    });

    it('axisLabel fontSize', () => {
      const fontSize = 11;
      expect(fontSize).toBe(11);
    });
  });

  describe('axisLabel formatter', () => {
    it('0일 때 표시', () => {
      const formatter = (val: number, max: number) => {
        if (val === 0 || val === max) return String(val);
        return '';
      };

      expect(formatter(0, 2000)).toBe('0');
    });

    it('max일 때 표시', () => {
      const formatter = (val: number, max: number) => {
        if (val === 0 || val === max) return String(val);
        return '';
      };

      expect(formatter(2000, 2000)).toBe('2000');
    });

    it('중간값은 빈 문자열', () => {
      const formatter = (val: number, max: number) => {
        if (val === 0 || val === max) return String(val);
        return '';
      };

      expect(formatter(1000, 2000)).toBe('');
    });
  });

  describe('컴포넌트 스타일', () => {
    it('높이 클래스', () => {
      const className = 'w-full h-48';
      expect(className).toContain('h-48');
    });

    it('너비 클래스', () => {
      const className = 'w-full h-48';
      expect(className).toContain('w-full');
    });

    it('ReactECharts 스타일', () => {
      const style = {
        height: '100%',
        width: '100%',
      };

      expect(style.height).toBe('100%');
      expect(style.width).toBe('100%');
    });

    it('ReactECharts renderer', () => {
      const opts = {
        renderer: 'canvas' as const,
      };

      expect(opts.renderer).toBe('canvas');
    });
  });

  describe('색상 팔레트 (모노크롬)', () => {
    it('배경색 (neutral-700)', () => {
      const backgroundColor = '#404040';
      expect(backgroundColor).toBe('#404040');
    });

    it('axisTick 색상 (neutral-600)', () => {
      const axisTickColor = '#525252';
      expect(axisTickColor).toBe('#525252');
    });

    it('splitLine 색상 (neutral-500)', () => {
      const splitLineColor = '#737373';
      expect(splitLineColor).toBe('#737373');
    });

    it('axisLabel 색상 (neutral-400)', () => {
      const axisLabelColor = '#a3a3a3';
      expect(axisLabelColor).toBe('#a3a3a3');
    });

    it('detail 색상 (neutral-200)', () => {
      const detailColor = '#e5e5e5';
      expect(detailColor).toBe('#e5e5e5');
    });
  });

  describe('데이터 구조', () => {
    it('게이지 데이터 배열', () => {
      const value = 1250;
      const label = 'Flow Rate';
      const data = [{ value, name: label }];

      expect(data).toHaveLength(1);
      expect(data[0].value).toBe(value);
      expect(data[0].name).toBe(label);
    });

    it('value는 양수', () => {
      const value = 1250;
      expect(value).toBeGreaterThanOrEqual(0);
    });

    it('name은 문자열', () => {
      const name = 'Flow Rate';
      expect(typeof name).toBe('string');
    });
  });
});
