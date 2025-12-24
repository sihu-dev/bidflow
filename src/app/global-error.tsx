'use client';

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
            <h1 className="text-6xl font-bold text-neutral-700 mb-4">Error</h1>
            <p className="text-xl text-gray-600 mb-4">Something went wrong</p>
            <p className="text-sm text-gray-500 mb-8">{error.message}</p>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
