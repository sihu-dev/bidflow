/**
 * @module supabase/realtime
 * @description Supabase Realtime 훅 (실시간 협업)
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import type { Tables, RealtimePayload } from './types';

// ============================================================================
// 실시간 입찰 목록 훅
// ============================================================================

export interface UseRealtimeBidsOptions {
  onInsert?: (bid: Tables<'bids'>) => void;
  onUpdate?: (bid: Tables<'bids'>) => void;
  onDelete?: (bid: Tables<'bids'>) => void;
  enabled?: boolean;
}

/**
 * 입찰 목록 실시간 구독 훅
 */
export function useRealtimeBids(options: UseRealtimeBidsOptions = {}) {
  const { onInsert, onUpdate, onDelete, enabled = true } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleChange = useCallback(
    (payload: RealtimePayload<Tables<'bids'>>) => {
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) onInsert?.(payload.new);
          break;
        case 'UPDATE':
          if (payload.new) onUpdate?.(payload.new);
          break;
        case 'DELETE':
          if (payload.old) onDelete?.(payload.old);
          break;
      }
    },
    [onInsert, onUpdate, onDelete]
  );

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      console.warn('[Realtime] Supabase 클라이언트 없음 - 실시간 기능 비활성화');
      return;
    }

    // 채널 생성 및 구독
    const channel = supabase
      .channel('bids-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
        },
        (payload) => {
          handleChange(payload as unknown as RealtimePayload<Tables<'bids'>>);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
          console.log('[Realtime] 입찰 테이블 구독 시작');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError(new Error('채널 연결 오류'));
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [enabled, handleChange]);

  return { isConnected, error };
}

// ============================================================================
// 실시간 셀 편집 훅 (충돌 방지)
// ============================================================================

export interface CellLock {
  bidId: string;
  column: string;
  userId: string;
  userName: string;
  lockedAt: string;
}

export interface UseRealtimeCellEditOptions {
  userId: string;
  userName: string;
  onCellLocked?: (lock: CellLock) => void;
  onCellUnlocked?: (lock: CellLock) => void;
}

/**
 * 실시간 셀 편집 충돌 방지 훅
 */
export function useRealtimeCellEdit(options: UseRealtimeCellEditOptions) {
  const { userId, userName, onCellLocked, onCellUnlocked } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [activeLocks, setActiveLocks] = useState<Map<string, CellLock>>(new Map());

  // 셀 잠금 요청
  const lockCell = useCallback(
    async (bidId: string, column: string) => {
      const channel = channelRef.current;
      if (!channel) return false;

      const lockKey = `${bidId}:${column}`;
      const existingLock = activeLocks.get(lockKey);

      // 이미 다른 사용자가 잠금 중
      if (existingLock && existingLock.userId !== userId) {
        return false;
      }

      const lock: CellLock = {
        bidId,
        column,
        userId,
        userName,
        lockedAt: new Date().toISOString(),
      };

      // 브로드캐스트
      await channel.send({
        type: 'broadcast',
        event: 'cell-lock',
        payload: lock,
      });

      setActiveLocks((prev) => new Map(prev).set(lockKey, lock));
      return true;
    },
    [userId, userName, activeLocks]
  );

  // 셀 잠금 해제
  const unlockCell = useCallback(
    async (bidId: string, column: string) => {
      const channel = channelRef.current;
      if (!channel) return;

      const lockKey = `${bidId}:${column}`;
      const existingLock = activeLocks.get(lockKey);

      if (existingLock?.userId !== userId) return;

      await channel.send({
        type: 'broadcast',
        event: 'cell-unlock',
        payload: existingLock,
      });

      setActiveLocks((prev) => {
        const next = new Map(prev);
        next.delete(lockKey);
        return next;
      });
    },
    [userId, activeLocks]
  );

  // 셀이 잠겨있는지 확인
  const isCellLocked = useCallback(
    (bidId: string, column: string): CellLock | null => {
      const lockKey = `${bidId}:${column}`;
      const lock = activeLocks.get(lockKey);
      if (lock && lock.userId !== userId) {
        return lock;
      }
      return null;
    },
    [userId, activeLocks]
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel('cell-editing')
      .on('broadcast', { event: 'cell-lock' }, ({ payload }) => {
        const lock = payload as CellLock;
        if (lock.userId !== userId) {
          const lockKey = `${lock.bidId}:${lock.column}`;
          setActiveLocks((prev) => new Map(prev).set(lockKey, lock));
          onCellLocked?.(lock);
        }
      })
      .on('broadcast', { event: 'cell-unlock' }, ({ payload }) => {
        const lock = payload as CellLock;
        if (lock.userId !== userId) {
          const lockKey = `${lock.bidId}:${lock.column}`;
          setActiveLocks((prev) => {
            const next = new Map(prev);
            next.delete(lockKey);
            return next;
          });
          onCellUnlocked?.(lock);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, onCellLocked, onCellUnlocked]);

  return {
    lockCell,
    unlockCell,
    isCellLocked,
    activeLocks: Array.from(activeLocks.values()),
  };
}

// ============================================================================
// Presence (접속자 표시) 훅
// ============================================================================

export interface UserPresence {
  id: string;
  name: string;
  color: string;
  lastSeen: string;
  currentCell?: { bidId: string; column: string };
}

/**
 * 실시간 접속자 표시 훅
 */
export function usePresence(userId: string, userName: string) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 사용자 색상 생성 (ID 기반)
  const userColor = `hsl(${Math.abs(userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 360}, 70%, 50%)`;

  const updatePresence = useCallback(
    async (currentCell?: { bidId: string; column: string }) => {
      const channel = channelRef.current;
      if (!channel) return;

      await channel.track({
        id: userId,
        name: userName,
        color: userColor,
        lastSeen: new Date().toISOString(),
        currentCell,
      });
    },
    [userId, userName, userColor]
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase.channel('presence', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<UserPresence>();
        const users = Object.values(state)
          .flat()
          .filter((u) => u.id !== userId);
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: userId,
            name: userName,
            color: userColor,
            lastSeen: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, userName, userColor]);

  return { onlineUsers, updatePresence };
}

const realtimeHooks = {
  useRealtimeBids,
  useRealtimeCellEdit,
  usePresence,
};

export default realtimeHooks;
