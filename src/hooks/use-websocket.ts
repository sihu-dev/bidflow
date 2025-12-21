/**
 * Mock websocket hooks for BIDFLOW
 */
export function useTickerStream(_params?: { symbols?: string[] }) {
  return {
    tickers: [],
    isConnected: false,
  }
}
