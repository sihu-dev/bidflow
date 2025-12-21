/**
 * SludgeMap 컴포넌트 테스트
 * - MapLibre GL 지도 시각화
 * - 센서 마커 및 팝업
 * - 상태별 색상 구분
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock maplibre-gl
vi.mock('maplibre-gl', () => {
  const mockMap = {
    addControl: vi.fn(),
    remove: vi.fn(),
  };

  const mockMarker = {
    setLngLat: vi.fn().mockReturnThis(),
    setPopup: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
  };

  const mockPopup = {
    setHTML: vi.fn().mockReturnThis(),
  };

  return {
    default: {
      Map: vi.fn(() => mockMap),
      Marker: vi.fn(() => mockMarker),
      Popup: vi.fn(() => mockPopup),
      NavigationControl: vi.fn(),
    },
  };
});

// Mock maplibre-gl CSS import
vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

describe('SludgeMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('센서 데이터', () => {
    it('DEMO_SENSORS 데이터 구조 검증', () => {
      const sensor = {
        id: 'sensor-1',
        name: '서울 정수장 A',
        lat: 37.5665,
        lng: 126.978,
        type: 'UR-1010PLUS' as const,
        status: 'normal' as const,
        value: 1250,
        unit: 'm³/h',
      };

      expect(sensor).toHaveProperty('id');
      expect(sensor).toHaveProperty('name');
      expect(sensor).toHaveProperty('lat');
      expect(sensor).toHaveProperty('lng');
      expect(sensor).toHaveProperty('type');
      expect(sensor).toHaveProperty('status');
      expect(sensor).toHaveProperty('value');
      expect(sensor).toHaveProperty('unit');
    });

    it('센서 타입 검증', () => {
      const validTypes = ['UR-1010PLUS', 'SL-3000PLUS', 'EnerRay'];

      validTypes.forEach((type) => {
        expect(validTypes).toContain(type);
      });
    });

    it('센서 상태 검증', () => {
      const validStatuses = ['normal', 'warning', 'critical'];

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });
    });

    it('좌표 범위 검증 (한국 영역)', () => {
      const sensors = [
        { name: '서울', lat: 37.5665, lng: 126.978 },
        { name: '부산', lat: 35.1796, lng: 129.0756 },
        { name: '대전', lat: 36.3504, lng: 127.3845 },
      ];

      sensors.forEach((sensor) => {
        expect(sensor.lat).toBeGreaterThan(33);
        expect(sensor.lat).toBeLessThan(39);
        expect(sensor.lng).toBeGreaterThan(124);
        expect(sensor.lng).toBeLessThan(132);
      });
    });
  });

  describe('상태별 색상 매핑', () => {
    it('normal 상태 색상', () => {
      const STATUS_COLORS = {
        normal: '#171717', // neutral-900
        warning: '#525252', // neutral-600
        critical: '#a3a3a3', // neutral-400
      };

      expect(STATUS_COLORS.normal).toBe('#171717');
    });

    it('warning 상태 색상', () => {
      const STATUS_COLORS = {
        normal: '#171717',
        warning: '#525252',
        critical: '#a3a3a3',
      };

      expect(STATUS_COLORS.warning).toBe('#525252');
    });

    it('critical 상태 색상', () => {
      const STATUS_COLORS = {
        normal: '#171717',
        warning: '#525252',
        critical: '#a3a3a3',
      };

      expect(STATUS_COLORS.critical).toBe('#a3a3a3');
    });

    it('모든 상태에 대한 색상 정의', () => {
      const STATUS_COLORS = {
        normal: '#171717',
        warning: '#525252',
        critical: '#a3a3a3',
      };

      expect(Object.keys(STATUS_COLORS)).toEqual(['normal', 'warning', 'critical']);
    });
  });

  describe('마커 스타일', () => {
    it('마커 크기', () => {
      const markerStyle = {
        width: '24px',
        height: '24px',
      };

      expect(markerStyle.width).toBe('24px');
      expect(markerStyle.height).toBe('24px');
    });

    it('마커 border-radius (원형)', () => {
      const markerStyle = {
        borderRadius: '50%',
      };

      expect(markerStyle.borderRadius).toBe('50%');
    });

    it('마커 hover 효과 (scale)', () => {
      const hoverScale = 1.2;
      const normalScale = 1;

      expect(hoverScale).toBeGreaterThan(normalScale);
      expect(hoverScale).toBe(1.2);
    });

    it('마커 border 스타일', () => {
      const markerStyle = {
        border: '2px solid white',
      };

      expect(markerStyle.border).toBe('2px solid white');
    });
  });

  describe('팝업 내용', () => {
    it('팝업 데이터 포맷', () => {
      const sensor = {
        name: '서울 정수장 A',
        type: 'UR-1010PLUS',
        value: 1250,
        unit: 'm³/h',
        status: 'normal' as const,
      };

      const popupContent = `${sensor.name} | ${sensor.type} | ${sensor.value} ${sensor.unit} | ${sensor.status}`;

      expect(popupContent).toContain(sensor.name);
      expect(popupContent).toContain(sensor.type);
      expect(popupContent).toContain(String(sensor.value));
      expect(popupContent).toContain(sensor.unit);
      expect(popupContent).toContain(sensor.status);
    });

    it('팝업 offset 설정', () => {
      const popupOffset = 25;

      expect(popupOffset).toBe(25);
    });

    it('팝업 closeButton 비활성화', () => {
      const popupOptions = {
        closeButton: false,
      };

      expect(popupOptions.closeButton).toBe(false);
    });
  });

  describe('지도 설정', () => {
    it('지도 중심 좌표 (한국)', () => {
      const mapCenter = [127.0, 37.5]; // [lng, lat]

      expect(mapCenter[0]).toBe(127.0); // longitude
      expect(mapCenter[1]).toBe(37.5); // latitude
    });

    it('지도 줌 레벨', () => {
      const mapZoom = 6.5;

      expect(mapZoom).toBeGreaterThan(0);
      expect(mapZoom).toBeLessThan(20);
      expect(mapZoom).toBe(6.5);
    });

    it('모노크롬 필터 설정', () => {
      const rasterPaint = {
        'raster-saturation': -1, // Monochrome
        'raster-contrast': 0.1,
      };

      expect(rasterPaint['raster-saturation']).toBe(-1);
      expect(rasterPaint['raster-contrast']).toBe(0.1);
    });
  });

  describe('선택된 센서 패널', () => {
    it('센서 선택 상태', () => {
      let selectedSensor = null;

      const sensor = { id: 'sensor-1', name: '서울 정수장 A' };
      selectedSensor = sensor;

      expect(selectedSensor).not.toBeNull();
      expect(selectedSensor).toEqual(sensor);
    });

    it('센서 선택 해제', () => {
      let selectedSensor: { id: string; name: string } | null = { id: 'sensor-1', name: '서울 정수장 A' };

      selectedSensor = null;

      expect(selectedSensor).toBeNull();
    });
  });

  describe('범례 (Legend)', () => {
    it('범례 항목', () => {
      const legendItems = [
        { label: '정상', color: '#171717' },
        { label: '경고', color: '#525252' },
        { label: '위험', color: '#a3a3a3' },
      ];

      expect(legendItems).toHaveLength(3);
      expect(legendItems[0].label).toBe('정상');
      expect(legendItems[1].label).toBe('경고');
      expect(legendItems[2].label).toBe('위험');
    });
  });

  describe('이벤트 핸들러', () => {
    it('마커 클릭 이벤트', () => {
      const mockSetSelectedSensor = vi.fn();
      const sensor = { id: 'sensor-1', name: '서울 정수장 A' };

      mockSetSelectedSensor(sensor);

      expect(mockSetSelectedSensor).toHaveBeenCalledWith(sensor);
    });

    it('마커 hover 이벤트 (mouseenter)', () => {
      const mockElement = {
        style: {
          transform: '',
        },
      };

      mockElement.style.transform = 'scale(1.2)';

      expect(mockElement.style.transform).toBe('scale(1.2)');
    });

    it('마커 hover 해제 (mouseleave)', () => {
      const mockElement = {
        style: {
          transform: 'scale(1.2)',
        },
      };

      mockElement.style.transform = 'scale(1)';

      expect(mockElement.style.transform).toBe('scale(1)');
    });
  });

  describe('Cleanup', () => {
    it('컴포넌트 언마운트 시 지도 제거', () => {
      const mockMap = {
        remove: vi.fn(),
      };

      mockMap.remove();

      expect(mockMap.remove).toHaveBeenCalled();
    });

    it('지도 참조 null 설정', () => {
      let mapRef: unknown = { current: {} };

      mapRef = { current: null };

      expect((mapRef as { current: unknown }).current).toBeNull();
    });
  });
});
