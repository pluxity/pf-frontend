import { Skeleton } from "@pf-dev/ui";
import { useCCTVStreams } from "@/hooks";
import { CCTVViewer } from "@/components/CCTVViewer";

/**
 * CCTV 뷰 컴포넌트
 * @see https://github.com/pluxity/pf-frontend/issues/252
 */
export function CCTVView() {
  const { paths, isLoading, isError, getWHEPUrl } = useCCTVStreams();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-primary-50/30 p-4 gap-4 4k:p-8 4k:gap-8">
        {/* 툴바 스켈레톤 */}
        <Skeleton className="h-12 w-full 4k:h-24" />

        {/* 그리드 스켈레톤 (4x4) */}
        <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-2 4k:gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || paths.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-primary-50/30">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-800 4k:text-5xl">CCTV</h2>
          <p className="mt-2 text-primary-700 4k:text-2xl">
            {isError ? "스트림을 불러올 수 없습니다" : "등록된 CCTV가 없습니다"}
          </p>
        </div>
      </div>
    );
  }

  return <CCTVViewer cctvs={paths} getStreamUrl={getWHEPUrl} />;
}
