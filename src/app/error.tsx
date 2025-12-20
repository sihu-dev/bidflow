'use client';

/**
 * 에러 페이지 - App Router
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-700 mb-4">오류</h1>
        <p className="text-xl text-gray-600 mb-4">문제가 발생했습니다</p>
        <p className="text-sm text-gray-500 mb-8">{error.message}</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
