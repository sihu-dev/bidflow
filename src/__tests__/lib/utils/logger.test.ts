/**
 * Logger 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/utils/logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // ============================================================================
  // info 테스트 (테스트 환경에서는 프로덕션 모드로 동작)
  // ============================================================================
  describe('info', () => {
    it('메시지를 JSON 형식으로 출력', () => {
      logger.info('정보 메시지');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify({ level: 'info', message: '정보 메시지' })
      );
    });

    it('메타데이터 포함 info 로그', () => {
      logger.info('메시지', { key: 'value', num: 42 });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify({ level: 'info', message: '메시지', key: 'value', num: 42 })
      );
    });

    it('복잡한 메타데이터 처리', () => {
      logger.info('메시지', {
        userId: '123',
        action: 'create',
        count: 5,
        nested: { prop: 'value' },
      });

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('메시지');
      expect(parsed.userId).toBe('123');
      expect(parsed.action).toBe('create');
      expect(parsed.count).toBe(5);
      expect(parsed.nested).toEqual({ prop: 'value' });
    });
  });

  // ============================================================================
  // warn 테스트
  // ============================================================================
  describe('warn', () => {
    it('경고 메시지 JSON 출력', () => {
      logger.warn('경고 메시지');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify({ level: 'warn', message: '경고 메시지' })
      );
    });

    it('메타데이터 포함 warn 로그', () => {
      logger.warn('경고', { reason: 'test', severity: 'medium' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify({ level: 'warn', message: '경고', reason: 'test', severity: 'medium' })
      );
    });

    it('warn 호출 시 console.warn이 아닌 console.log 사용 (프로덕션 모드)', () => {
      logger.warn('경고');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // error 테스트
  // ============================================================================
  describe('error', () => {
    it('에러 메시지 JSON 출력', () => {
      logger.error('에러 메시지');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify({ level: 'error', message: '에러 메시지' })
      );
    });

    it('Error 객체 포함 시 직렬화', () => {
      const testError = new Error('테스트 에러');

      logger.error('에러 발생', testError);

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('에러 발생');
      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('테스트 에러');
      expect(parsed.error.stack).toBeDefined();
    });

    it('Error 객체와 메타데이터 함께 포함', () => {
      const testError = new Error('오류');

      logger.error('에러', testError, { context: 'test', userId: '123' });

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('에러');
      expect(parsed.context).toBe('test');
      expect(parsed.userId).toBe('123');
      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('오류');
    });

    it('문자열 에러 처리', () => {
      logger.error('에러', '단순 문자열 에러');

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('에러');
      expect(parsed.error).toBe('단순 문자열 에러');
    });

    it('객체 에러 처리', () => {
      const errorObj = { code: 500, msg: 'Internal Error' };

      logger.error('에러', errorObj);

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('에러');
      expect(parsed.error).toEqual({ code: 500, msg: 'Internal Error' });
    });

    it('error 호출 시 console.error가 아닌 console.log 사용 (프로덕션 모드)', () => {
      logger.error('에러');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('메타데이터 없이 Error만 전달', () => {
      const testError = new Error('단독 에러');

      logger.error('메시지', testError);

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.error.message).toBe('단독 에러');
    });

    it('복잡한 Error 객체 (커스텀 속성)', () => {
      const customError: Error & { statusCode?: number } = new Error('Custom');
      customError.statusCode = 404;

      logger.error('커스텀 에러', customError);

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Custom');
    });
  });

  // ============================================================================
  // debug 테스트 (테스트 환경에서는 무시됨)
  // ============================================================================
  describe('debug', () => {
    it('테스트 환경에서는 debug 로그 출력하지 않음', () => {
      logger.debug('디버그 메시지');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('메타데이터 포함해도 출력하지 않음', () => {
      logger.debug('디버그', { data: 'test' });

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // 복합 시나리오
  // ============================================================================
  describe('복합 시나리오', () => {
    it('여러 로그 레벨 혼합 사용', () => {
      logger.debug('디버그'); // 무시됨
      logger.info('정보');
      logger.warn('경고');
      logger.error('에러');

      // debug는 호출 안됨, 나머지 3개만 console.log로 출력
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });

    it('연속된 info 로그', () => {
      logger.info('첫 번째');
      logger.info('두 번째');
      logger.info('세 번째');

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);

      const calls = consoleLogSpy.mock.calls;
      const parsed1 = JSON.parse(calls[0][0]);
      const parsed2 = JSON.parse(calls[1][0]);
      const parsed3 = JSON.parse(calls[2][0]);

      expect(parsed1.message).toBe('첫 번째');
      expect(parsed2.message).toBe('두 번째');
      expect(parsed3.message).toBe('세 번째');
    });

    it('다양한 데이터 타입 메타데이터', () => {
      logger.info('메타 테스트', {
        string: 'text',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        nullValue: null,
      });

      const call = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed.string).toBe('text');
      expect(parsed.number).toBe(123);
      expect(parsed.boolean).toBe(true);
      expect(parsed.array).toEqual([1, 2, 3]);
      expect(parsed.object).toEqual({ nested: 'value' });
      expect(parsed.nullValue).toBeNull();
    });
  });
});
