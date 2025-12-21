import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { SupabaseClientType } from '@/lib/supabase/client';

interface SensorReading {
  id: string;
  sensor_id: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  created_at: string;
}

// Type guard for SensorReading
function isSensorReading(obj: unknown): obj is SensorReading {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.sensor_id === 'string' &&
    typeof record.value === 'number' &&
    typeof record.unit === 'string' &&
    (record.status === 'normal' || record.status === 'warning' || record.status === 'critical') &&
    typeof record.created_at === 'string'
  );
}

export function useRealtimeSensor(sensorId?: string) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: ReturnType<NonNullable<SupabaseClientType>['channel']> | null = null;

    async function initialize() {
      try {
        // Get singleton Supabase client
        const supabase = getSupabaseBrowserClient();

        if (!supabase) {
          console.warn('[DEV] Supabase client not available - skipping realtime');
          setLoading(false);
          return;
        }

        // Initial data load
        const query = supabase
          .from('sensor_readings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (sensorId) {
          query.eq('sensor_id', sensorId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Validate data
        const validReadings = (data ?? []).filter(isSensorReading);
        setReadings(validReadings);
        setLoading(false);

        // Subscribe to realtime changes
        channel = supabase
          .channel(`sensor-readings${sensorId ? `-${sensorId}` : ''}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'sensor_readings',
              ...(sensorId && { filter: `sensor_id=eq.${sensorId}` }),
            },
            (payload) => {
              if (isSensorReading(payload.new)) {
                setReadings((prev) => [payload.new as SensorReading, ...prev].slice(0, 100));
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'sensor_readings',
              ...(sensorId && { filter: `sensor_id=eq.${sensorId}` }),
            },
            (payload) => {
              if (isSensorReading(payload.new)) {
                const updated = payload.new as SensorReading;
                setReadings((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'sensor_readings',
              ...(sensorId && { filter: `sensor_id=eq.${sensorId}` }),
            },
            (payload) => {
              if (isSensorReading(payload.old)) {
                const deleted = payload.old as SensorReading;
                setReadings((prev) => prev.filter((r) => r.id !== deleted.id));
              }
            }
          )
          .subscribe();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }

    initialize();

    // Cleanup
    return () => {
      if (channel) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          supabase.removeChannel(channel);
        }
      }
    };
  }, [sensorId]);

  return { readings, loading, error };
}
