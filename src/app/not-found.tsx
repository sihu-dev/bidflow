import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
