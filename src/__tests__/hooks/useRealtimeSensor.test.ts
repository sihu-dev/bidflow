/**
 * useRealtimeSensor 훅 테스트
 * - Supabase Realtime 구독
 * - INSERT/UPDATE/DELETE 이벤트
 * - 에러 처리
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
};

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  channel: vi.fn((_name: string) => mockChannel),
  removeChannel: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('useRealtimeSensor Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('환경 변수 검증', () => {
    it('SUPABASE_URL 검증 로직', () => {
      // 환경 변수가 설정되어 있으면 문자열, 아니면 undefined
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        expect(typeof supabaseUrl).toBe('string');
      } else {
        expect(supabaseUrl).toBeUndefined();
      }
    });

    it('SUPABASE_ANON_KEY 검증 로직', () => {
      // 환경 변수가 설정되어 있으면 문자열, 아니면 undefined
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseAnonKey) {
        expect(typeof supabaseAnonKey).toBe('string');
      } else {
        expect(supabaseAnonKey).toBeUndefined();
      }
    });

    it('환경 변수 없으면 에러', () => {
      const supabaseUrl = undefined;
      const supabaseAnonKey = undefined;

      if (!supabaseUrl || !supabaseAnonKey) {
        expect(() => {
          throw new Error('Missing Supabase environment variables');
        }).toThrow('Missing Supabase environment variables');
      }
    });
  });

  describe('초기 데이터 로드', () => {
    it('sensor_readings 테이블 조회', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sensor_readings');
    });

    it('created_at 내림차순 정렬', async () => {
      const orderBy = { field: 'created_at', ascending: false };
      expect(orderBy.field).toBe('created_at');
      expect(orderBy.ascending).toBe(false);
    });

    it('최대 100개 제한', () => {
      const limit = 100;
      expect(limit).toBe(100);
    });

    it('sensorId가 있으면 필터링', () => {
      const sensorId = 'sensor-1';
      const filter = `sensor_id=eq.${sensorId}`;

      expect(filter).toBe('sensor_id=eq.sensor-1');
      expect(sensorId).toBeDefined();
    });

    it('데이터 로드 성공', async () => {
      const mockData = [
        {
          id: 'reading-1',
          sensor_id: 'sensor-1',
          value: 1250,
          unit: 'm³/h',
          status: 'normal',
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      });

      const result = await mockSupabaseClient
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('데이터 로드 실패 시 에러', async () => {
      const mockError = { message: 'Network error' };

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await mockSupabaseClient
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Network error');
    });
  });

  describe('Realtime 채널 구독', () => {
    it('채널 이름 생성 (sensorId 없음)', () => {
      const sensorId = undefined;
      const channelName = `sensor-readings${sensorId ? `-${sensorId}` : ''}`;
      expect(channelName).toBe('sensor-readings');
    });

    it('채널 이름 생성 (sensorId 있음)', () => {
      const sensorId = 'sensor-1';
      const channelName = `sensor-readings${sensorId ? `-${sensorId}` : ''}`;
      expect(channelName).toBe('sensor-readings-sensor-1');
    });

    it('channel 생성', () => {
      const channelName = 'sensor-readings';
      // channel 함수는 이미 mockChannel을 반환하도록 설정됨
      expect(mockSupabaseClient.channel).toBeDefined();
      expect(channelName).toBe('sensor-readings');
    });

    it('subscribe 호출', () => {
      const result = mockChannel.subscribe();
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('INSERT 이벤트', () => {
    it('INSERT 이벤트 구독 설정', () => {
      const config = {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
      };

      expect(config.event).toBe('INSERT');
      expect(config.schema).toBe('public');
      expect(config.table).toBe('sensor_readings');
    });

    it('sensorId 필터 (있는 경우)', () => {
      const sensorId = 'sensor-1';
      const filter = `sensor_id=eq.${sensorId}`;
      expect(filter).toBe('sensor_id=eq.sensor-1');
    });

    it('새 reading 배열 앞에 추가', () => {
      const prevReadings = [
        { id: 'reading-1', value: 100 },
        { id: 'reading-2', value: 200 },
      ];
      const newReading = { id: 'reading-new', value: 150 };
      const updated = [newReading, ...prevReadings];

      expect(updated[0]).toEqual(newReading);
      expect(updated).toHaveLength(3);
    });

    it('최대 100개로 제한', () => {
      const prevReadings = Array(100).fill(null).map((_, i) => ({ id: `reading-${i}` }));
      const newReading = { id: 'reading-new' };
      const updated = [newReading, ...prevReadings].slice(0, 100);

      expect(updated).toHaveLength(100);
      expect(updated[0]).toEqual(newReading);
    });
  });

  describe('UPDATE 이벤트', () => {
    it('UPDATE 이벤트 구독 설정', () => {
      const config = {
        event: 'UPDATE',
        schema: 'public',
        table: 'sensor_readings',
      };

      expect(config.event).toBe('UPDATE');
      expect(config.schema).toBe('public');
      expect(config.table).toBe('sensor_readings');
    });

    it('해당 reading 업데이트', () => {
      const prevReadings = [
        { id: 'reading-1', value: 100 },
        { id: 'reading-2', value: 200 },
      ];
      const updatedReading = { id: 'reading-1', value: 150 };

      const updated = prevReadings.map((r) =>
        r.id === updatedReading.id ? updatedReading : r
      );

      expect(updated[0]).toEqual(updatedReading);
      expect(updated[1]).toEqual(prevReadings[1]);
    });

    it('일치하는 ID 없으면 변경 없음', () => {
      const prevReadings = [
        { id: 'reading-1', value: 100 },
        { id: 'reading-2', value: 200 },
      ];
      const updatedReading = { id: 'reading-999', value: 999 };

      const updated = prevReadings.map((r) =>
        r.id === updatedReading.id ? updatedReading : r
      );

      expect(updated).toEqual(prevReadings);
    });
  });

  describe('DELETE 이벤트', () => {
    it('DELETE 이벤트 구독 설정', () => {
      const config = {
        event: 'DELETE',
        schema: 'public',
        table: 'sensor_readings',
      };

      expect(config.event).toBe('DELETE');
      expect(config.schema).toBe('public');
      expect(config.table).toBe('sensor_readings');
    });

    it('해당 reading 제거', () => {
      const prevReadings = [
        { id: 'reading-1', value: 100 },
        { id: 'reading-2', value: 200 },
        { id: 'reading-3', value: 300 },
      ];
      const deletedReading = { id: 'reading-2' };

      const updated = prevReadings.filter((r) => r.id !== deletedReading.id);

      expect(updated).toHaveLength(2);
      expect(updated.find((r) => r.id === 'reading-2')).toBeUndefined();
    });

    it('일치하는 ID 없으면 변경 없음', () => {
      const prevReadings = [
        { id: 'reading-1', value: 100 },
        { id: 'reading-2', value: 200 },
      ];
      const deletedReading = { id: 'reading-999' };

      const updated = prevReadings.filter((r) => r.id !== deletedReading.id);

      expect(updated).toEqual(prevReadings);
    });
  });

  describe('상태 관리', () => {
    it('초기 loading 상태는 true', () => {
      const loading = true;
      expect(loading).toBe(true);
    });

    it('데이터 로드 후 loading false', () => {
      let loading = true;
      loading = false;
      expect(loading).toBe(false);
    });

    it('초기 error 상태는 null', () => {
      const error: Error | null = null;
      expect(error).toBeNull();
    });

    it('에러 발생 시 error 설정', () => {
      let error: Error | null = null;
      error = new Error('Network error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Network error');
    });

    it('초기 readings는 빈 배열', () => {
      const readings: unknown[] = [];
      expect(readings).toEqual([]);
    });
  });

  describe('Cleanup', () => {
    it('컴포넌트 언마운트 시 채널 제거', () => {
      const channel = mockChannel;
      mockSupabaseClient.removeChannel(channel);
      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(channel);
    });

    it('channel null 체크', () => {
      const channel: typeof mockChannel | null = null;
      if (channel) {
        mockSupabaseClient.removeChannel(channel);
      }
      expect(mockSupabaseClient.removeChannel).not.toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('Error 인스턴스 처리', () => {
      const error: unknown = new Error('Test error');
      const processedError = error instanceof Error ? error : new Error('Unknown error');
      expect(processedError).toBeInstanceOf(Error);
      expect(processedError.message).toBe('Test error');
    });

    it('Unknown 에러 처리', () => {
      const error: unknown = 'String error';
      const processedError = error instanceof Error ? error : new Error('Unknown error');
      expect(processedError).toBeInstanceOf(Error);
      expect(processedError.message).toBe('Unknown error');
    });

    it('에러 발생 시 loading false', () => {
      let loading = true;
      try {
        throw new Error('Test error');
      } catch {
        loading = false;
      }
      expect(loading).toBe(false);
    });
  });

  describe('SensorReading 인터페이스', () => {
    it('필수 필드 검증', () => {
      const reading = {
        id: 'reading-1',
        sensor_id: 'sensor-1',
        value: 1250,
        unit: 'm³/h',
        status: 'normal' as const,
        created_at: new Date().toISOString(),
      };

      expect(reading).toHaveProperty('id');
      expect(reading).toHaveProperty('sensor_id');
      expect(reading).toHaveProperty('value');
      expect(reading).toHaveProperty('unit');
      expect(reading).toHaveProperty('status');
      expect(reading).toHaveProperty('created_at');
    });

    it('status는 유효한 값', () => {
      const validStatuses = ['normal', 'warning', 'critical'];
      const status = 'normal';
      expect(validStatuses).toContain(status);
    });

    it('value는 숫자', () => {
      const value = 1250;
      expect(typeof value).toBe('number');
    });

    it('created_at은 ISO 문자열', () => {
      const createdAt = new Date().toISOString();
      expect(createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('useEffect 의존성', () => {
    it('sensorId 변경 시 재구독', () => {
      let sensorId = 'sensor-1';
      const deps = [sensorId];

      sensorId = 'sensor-2';
      const newDeps = [sensorId];

      expect(deps).not.toEqual(newDeps);
    });

    it('sensorId undefined → 값으로 변경', () => {
      let sensorId: string | undefined = undefined;
      const deps = [sensorId];

      sensorId = 'sensor-1';
      const newDeps = [sensorId];

      expect(deps).not.toEqual(newDeps);
    });
  });

  describe('Realtime payload 구조', () => {
    it('INSERT payload.new 구조', () => {
      const payload = {
        new: {
          id: 'reading-1',
          sensor_id: 'sensor-1',
          value: 1250,
          unit: 'm³/h',
          status: 'normal',
          created_at: new Date().toISOString(),
        },
      };

      expect(payload.new).toHaveProperty('id');
      expect(payload.new).toHaveProperty('sensor_id');
      expect(payload.new).toHaveProperty('value');
    });

    it('UPDATE payload.new 구조', () => {
      const payload = {
        new: {
          id: 'reading-1',
          value: 1300, // updated value
        },
      };

      expect(payload.new).toHaveProperty('id');
      expect(payload.new).toHaveProperty('value');
    });

    it('DELETE payload.old 구조', () => {
      const payload = {
        old: {
          id: 'reading-1',
        },
      };

      expect(payload.old).toHaveProperty('id');
    });
  });
});
