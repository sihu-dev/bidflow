/**
 * Auth 폼 로딩 Skeleton
 */
import { Skeleton } from '@/components/ui/skeleton';

export function AuthFormSkeleton() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Demo Button Skeleton */}
      <Skeleton className="h-10 w-full mb-4" />

      {/* Separator */}
      <div className="my-4">
        <Skeleton className="h-px w-full" />
      </div>

      {/* Social Buttons Skeleton */}
      <div className="space-y-3 mb-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Separator */}
      <div className="my-6">
        <Skeleton className="h-px w-full" />
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>

      <Skeleton className="h-4 w-48 mx-auto mt-6" />
    </div>
  );
}
