/**
 * Mock useRealtimePortfolio hook for BIDFLOW/CMNTECH
 */
export function useRealtimePortfolio() {
  return {
    portfolio: {
      totalValue: 0,
      change: 0,
      changePercent: 0,
      sparklineData: [],
    },
    isConnected: false,
    isLoading: false,
  }
}
