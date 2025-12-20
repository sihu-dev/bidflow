'use client';

/**
 * 전역 에러 핸들러 - App Router
 * 이 파일은 root layout에서 발생하는 에러를 처리합니다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-600 mb-4">오류</h1>
            <p className="text-xl text-gray-600 mb-4">심각한 오류가 발생했습니다</p>
            <p className="text-sm text-gray-500 mb-8">{error.message}</p>
            <button
              onClick={() => reset()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
