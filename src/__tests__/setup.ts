/**
 * Vitest 테스트 환경 설정
 */
import { vi, beforeEach } from 'vitest';

// Mock window object for SSR tests
if (typeof window === 'undefined') {
  global.window = {} as Window & typeof globalThis;
}

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

// Mock DOMPurify
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn((input: string, options?: { ALLOWED_TAGS?: string[]; ALLOWED_ATTR?: string[] }) => {
      if (typeof input !== 'string') return '';

      // If ALLOWED_TAGS is provided and has tags, preserve those tags
      if (options?.ALLOWED_TAGS && options.ALLOWED_TAGS.length > 0) {
        const allowedTagsPattern = options.ALLOWED_TAGS.join('|');
        // Remove tags that are NOT in the allowed list
        const notAllowedRegex = new RegExp(`<(?!/?(?:${allowedTagsPattern})\\b)[^>]*>`, 'gi');
        return input.replace(notAllowedRegex, '').trim();
      }

      // Default: remove all tags
      return input.replace(/<[^>]*>/g, '').trim();
    }),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
