/**
 * Mock useStrategies hook for BIDFLOW
 */
export interface Strategy {
  id: string
  name: string
  status: 'running' | 'paused' | 'stopped' | 'active'
  pnl: number
  winRate: number
  performance?: {
    totalReturn?: number
    totalTrades?: number
    winRate?: number
    maxDrawdown?: number
    sharpeRatio?: number
  }
  trades?: number
}

export function useStrategies(_params?: unknown) {
  return {
    strategies: [] as Strategy[],
    isLoading: false,
    updateStrategy: async (_id: string, _data: Partial<Strategy>) => {
      // Mock implementation
      return Promise.resolve()
    },
  }
}
