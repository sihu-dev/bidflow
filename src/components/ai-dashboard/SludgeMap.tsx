'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface SensorLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'UR-1010PLUS' | 'SL-3000PLUS' | 'EnerRay';
  status: 'normal' | 'warning' | 'critical';
  value: number;
  unit: string;
}

const DEMO_SENSORS: SensorLocation[] = [
  {
    id: 'sensor-1',
    name: '서울 정수장 A',
    lat: 37.5665,
    lng: 126.978,
    type: 'UR-1010PLUS',
    status: 'normal',
    value: 1250,
    unit: 'm³/h',
  },
  {
    id: 'sensor-2',
    name: '부산 하수처리장 B',
    lat: 35.1796,
    lng: 129.0756,
    type: 'SL-3000PLUS',
    status: 'warning',
    value: 890,
    unit: 'm³/h',
  },
  {
    id: 'sensor-3',
    name: '대전 산업단지 C',
    lat: 36.3504,
    lng: 127.3845,
    type: 'EnerRay',
    status: 'critical',
    value: 450,
    unit: 'kW',
  },
  {
    id: 'sensor-4',
    name: '인천 환경시설 D',
    lat: 37.4563,
    lng: 126.7052,
    type: 'UR-1010PLUS',
    status: 'normal',
    value: 1100,
    unit: 'm³/h',
  },
  {
    id: 'sensor-5',
    name: '광주 처리시설 E',
    lat: 35.1595,
    lng: 126.8526,
    type: 'SL-3000PLUS',
    status: 'normal',
    value: 980,
    unit: 'm³/h',
  },
];

const STATUS_COLORS: Record<SensorLocation['status'], string> = {
  normal: '#a3a3a3', // neutral-400 - 정상: 밝음
  warning: '#525252', // neutral-600 - 경고: 중간
  critical: '#171717', // neutral-900 - 위험: 어두움 (강조)
};

export function SludgeMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorLocation | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: {
              'raster-saturation': -1, // Monochrome filter
              'raster-contrast': 0.1,
              'raster-brightness-min': 0.3,
              'raster-brightness-max': 0.8,
            },
          },
        ],
      },
      center: [127.0, 37.5], // Korea center
      zoom: 6.5,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Store event handlers for cleanup
    const markerEventHandlers: Array<{
      element: HTMLElement;
      mouseenterHandler: () => void;
      mouseleaveHandler: () => void;
      clickHandler: () => void;
    }> = [];

    // Add markers and popups
    DEMO_SENSORS.forEach((sensor) => {
      if (!map.current) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'sensor-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = STATUS_COLORS[sensor.status];
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';

      // Event handlers
      const mouseenterHandler = () => {
        el.style.transform = 'scale(1.2)';
      };

      const mouseleaveHandler = () => {
        el.style.transform = 'scale(1)';
      };

      const clickHandler = () => {
        setSelectedSensor(sensor);
      };

      el.addEventListener('mouseenter', mouseenterHandler);
      el.addEventListener('mouseleave', mouseleaveHandler);
      el.addEventListener('click', clickHandler);

      // Store for cleanup
      markerEventHandlers.push({
        element: el,
        mouseenterHandler,
        mouseleaveHandler,
        clickHandler,
      });

      // Create popup
      const popupContent = `
        <div style="padding: 8px; font-family: system-ui, sans-serif;">
          <div style="font-weight: 600; color: #171717; margin-bottom: 4px;">
            ${sensor.name}
          </div>
          <div style="font-size: 12px; color: #525252; margin-bottom: 2px;">
            ${sensor.type}
          </div>
          <div style="font-size: 14px; color: #171717; font-weight: 500;">
            ${sensor.value} ${sensor.unit}
          </div>
          <div style="font-size: 11px; color: ${STATUS_COLORS[sensor.status]}; margin-top: 4px; text-transform: uppercase;">
            ${sensor.status}
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        className: 'sensor-popup',
      }).setHTML(popupContent);

      // Add marker with popup
      new maplibregl.Marker({ element: el })
        .setLngLat([sensor.lng, sensor.lat])
        .setPopup(popup)
        .addTo(map.current);
    });

    return () => {
      // Cleanup event listeners
      markerEventHandlers.forEach(({ element, mouseenterHandler, mouseleaveHandler, clickHandler }) => {
        element.removeEventListener('mouseenter', mouseenterHandler);
        element.removeEventListener('mouseleave', mouseleaveHandler);
        element.removeEventListener('click', clickHandler);
      });

      // Cleanup map
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
        role="img"
        aria-label="Interactive map showing sensor locations across Korea"
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white border border-neutral-200 rounded-lg p-3 shadow-sm">
        <div className="text-xs font-semibold text-neutral-900 mb-2">센서 상태</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-400" />
            <span className="text-xs text-neutral-600">정상</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
            <span className="text-xs text-neutral-600">경고</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-900" />
            <span className="text-xs text-neutral-600">위험</span>
          </div>
        </div>
      </div>

      {/* Selected sensor info panel */}
      {selectedSensor && (
        <div
          className="absolute top-4 right-4 bg-white border border-neutral-200 rounded-lg p-4 shadow-lg max-w-xs"
          role="dialog"
          aria-label="Sensor details"
        >
          <button
            onClick={() => setSelectedSensor(null)}
            className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-900"
            aria-label="Close sensor details"
          >
            ✕
          </button>
          <div className="pr-6">
            <h3 className="font-semibold text-neutral-900 mb-2">
              {selectedSensor.name}
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">모델:</span>
                <span className="text-neutral-900 font-medium">
                  {selectedSensor.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">유량:</span>
                <span className="text-neutral-900 font-medium">
                  {selectedSensor.value} {selectedSensor.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">상태:</span>
                <span
                  className="font-medium uppercase"
                  style={{ color: STATUS_COLORS[selectedSensor.status] }}
                >
                  {selectedSensor.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map attribution override (monochrome style) */}
      <style jsx global>{`
        .maplibregl-ctrl-attrib {
          background-color: rgba(255, 255, 255, 0.8);
          color: #171717;
          font-size: 10px;
        }

        .maplibregl-ctrl-attrib a {
          color: #525252;
        }

        .sensor-popup .maplibregl-popup-content {
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .sensor-popup .maplibregl-popup-tip {
          border-top-color: white;
        }
      `}</style>
    </div>
  );
}
