/**
 * Mock usePortfolioMetrics hook for BIDFLOW/CMNTECH
 */
export function usePortfolioMetrics() {
  return {
    metrics: {
      todayPnl: 0,
      vsYesterday: 0,
      winRate: 0,
      vsLastWeek: 0,
      sharpeRatio: 0,
      vsLastMonth: 0,
      maxDrawdown: 0,
    },
    isLoading: false,
  }
}
