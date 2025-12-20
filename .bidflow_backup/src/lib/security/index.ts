/**
 * @module security
 * @description 보안 모듈 통합 익스포트
 */

// 인증 미들웨어
export {
  withAuth,
  withApiKey,
  hasRole,
  type AuthenticatedRequest,
} from './auth-middleware';

// Rate Limiting
export {
  checkRateLimit,
  withRateLimit,
  checkAIRateLimit,
  checkCrawlingRateLimit,
  checkAuthRateLimit,
  getUserIdentifier,
  getEndpointIdentifier,
} from './rate-limiter';

// CSRF 보호
export {
  generateCSRFToken,
  hashCSRFToken,
  verifyCSRFToken,
  withCSRF,
  createCSRFResponse,
  validateOrigin,
} from './csrf';

// Prompt Injection 방어
export {
  validatePromptInput,
  sanitizeInput,
  sanitizeForSQL,
  wrapUserInput,
  sanitizeAIResponse,
  validateAIFormula,
  validateRequestBody,
} from './prompt-guard';
