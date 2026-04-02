'use client';
import React, { ImgHTMLAttributes, useEffect, useMemo, useState } from 'react';

const DEFAULT_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#111827"/><rect x="40" y="40" width="520" height="320" rx="18" fill="#1f2937" stroke="#374151" stroke-width="4"/><text x="300" y="210" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="28">Imagem indisponivel</text></svg>'
)}`;

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
};

export default function SafeImage({ src, fallbackSrc, onError, ...props }: SafeImageProps) {
  const normalizedSrc = useMemo(() => {
    const value = typeof src === 'string' ? src.trim() : '';
    return value || '';
  }, [src]);

  const resolvedFallback = fallbackSrc || DEFAULT_FALLBACK;
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc || resolvedFallback);

  useEffect(() => {
    setCurrentSrc(normalizedSrc || resolvedFallback);
  }, [normalizedSrc, resolvedFallback]);

  return (
    <img
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== resolvedFallback) {
          setCurrentSrc(resolvedFallback);
        }
        onError?.(event);
      }}
    />
  );
}
