/**
 * 데이터 레이어 Barrel Export
 * 랜딩 페이지용 목업 데이터 모음
 */

// 제품 카탈로그
export {
  CMNTECH_PRODUCTS,
  getProductById,
  getProductsByCategory,
  getConfidenceLevel,
  type CMNTechProduct,
} from './products';

// 입찰 목업 데이터
export {
  MOCK_BIDS,
  MOCK_STATS,
  formatAmount,
  type MockBid,
} from './mock-bids';

// AI 스마트 함수
export {
  AI_SMART_FUNCTIONS,
  AI_EXTENDED_FUNCTIONS,
  getFunctionsByCategory,
  getAIFunction,
  type AIFunction,
} from './ai-functions';
