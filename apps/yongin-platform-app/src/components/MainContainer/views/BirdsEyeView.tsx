/**
 * 조감도 뷰 컴포넌트
 * @see https://github.com/pluxity/pf-frontend/issues/167
 */
import { useState } from "react";

const BIRDS_EYE_IMAGE_URL = `${import.meta.env.BASE_URL}assets/images/birdsvieweye.png`;

export function BirdsEyeView() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
        </div>
      )}

      {hasError ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-400">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          src={BIRDS_EYE_IMAGE_URL}
          alt="현장 조감도"
          className={`w-full h-full object-contain ${isLoading ? "invisible" : ""}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}
