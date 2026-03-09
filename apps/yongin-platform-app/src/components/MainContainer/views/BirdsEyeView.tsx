/**
 * 조감도 뷰 컴포넌트
 * @see https://github.com/pluxity/pf-frontend/issues/167
 */
import { useState } from "react";
import { useSystemSettings } from "@/hooks/useSystemSetting";

export function BirdsEyeView() {
  const { systemSettings, isLoading: isSettingsLoading } = useSystemSettings();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUrl = systemSettings?.aerialViewFile?.url;
  const imageSrc = imageUrl ? new URL(imageUrl).pathname : undefined;

  if (isSettingsLoading) {
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
        <span>조감도 이미지가 등록되지 않았습니다</span>
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
          alt="현장 조감도"
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
