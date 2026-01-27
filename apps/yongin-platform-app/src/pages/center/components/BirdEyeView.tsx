import { useState } from "react";
import { Widget, cn } from "@pf-dev/ui";
import { BirdEyeViewProps } from "./types";

// TODO: 실제 조감도 이미지 경로로 변경
const BIRD_EYE_IMAGE_URL = "/images/bird-eye-view.png";

export function BirdEyeView({ id, className }: BirdEyeViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Widget
      id={id}
      title="조감도"
      className={cn(className, "4k:text-4xl")}
      contentClassName="h-full relative"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent 4k:h-16 4k:w-16 4k:border-4" />
        </div>
      )}

      {hasError ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-400 4k:text-2xl">
          <svg
            className="w-12 h-12 mb-2 4k:w-24 4k:h-24 4k:mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
          src={BIRD_EYE_IMAGE_URL}
          alt="현장 조감도"
          className={cn("w-full h-full object-contain", isLoading && "invisible")}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </Widget>
  );
}
