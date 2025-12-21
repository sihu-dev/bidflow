'use client';

/**
 * @component OptimizedImage
 * @description Lighthouse 최적화된 이미지 컴포넌트
 * - lazy loading
 * - 블러 플레이스홀더
 * - WebP/AVIF 포맷 지원
 */

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className={`
          duration-300 ease-in-out
          ${isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'}
        `}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        loading="lazy"
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
      )}
    </div>
  );
}
