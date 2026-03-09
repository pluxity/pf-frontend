/**
 * 시스템설정 이미지 뷰 공통 컴포넌트
 * BIMView, BirdsEyeView에서 공유
 */
import { useState } from "react";

interface SettingsImageViewProps {
  imageUrl: string | undefined;
  isLoading: boolean;
  alt: string;
  emptyMessage: string;
}

function parseImagePath(url: string): string | undefined {
  try {
    return new URL(url).pathname;
  } catch {
    return undefined;
  }
}

export function SettingsImageView({
  imageUrl,
  isLoading,
  alt,
  emptyMessage,
}: SettingsImageViewProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageSrc = imageUrl ? parseImagePath(imageUrl) : undefined;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-neutral-400">
        <svg className="mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isImageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      )}

      {hasError ? (
        <div className="flex h-full flex-col items-center justify-center text-neutral-400">
          <svg className="mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>이미지를 불러올 수 없습니다</span>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={`h-full w-full object-contain ${isImageLoading ? "invisible" : ""}`}
          onLoad={() => setIsImageLoading(false)}
          onError={() => {
            setIsImageLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}
