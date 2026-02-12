import { useRef } from "react";
import { useSitesStore, selectSelectedSiteId, selectSelectSiteAction } from "@/stores";
import Outline1 from "@/assets/images/outline_1.svg";
import Outline2 from "@/assets/images/outline_2.svg";
import Outline3 from "@/assets/images/outline_3.svg";
import type { KoreaMapProps } from "./types";
import { useMapRenderer, usePOILayer, useSelectedPOI } from "./hooks";

/** 대한민국 지도와 POI를 D3.js로 렌더링하는 컴포넌트 */
export function KoreaMap({
  className,
  pois = [],
  onPOIClick,
  onPOIHover,
  onPOIInfoClick,
}: KoreaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const selectSiteAction = useSitesStore(selectSelectSiteAction);

  const { svgRef, mainProjectionRef, jejuProjectionRef, isLoading, coastlineScale } =
    useMapRenderer({
      containerRef,
      onBackgroundClick: () => selectSiteAction(null),
    });

  const handleSelectSite = (siteId: string | null) => {
    selectSiteAction(siteId != null ? Number(siteId) : null);
  };

  const selectedSiteIdStr = selectedSiteId != null ? String(selectedSiteId) : null;

  usePOILayer({
    svgRef,
    mainProjectionRef,
    jejuProjectionRef,
    pois,
    onPOIClick,
    onPOIHover,
    onSelectSite: handleSelectSite,
  });

  useSelectedPOI({
    svgRef,
    mainProjectionRef,
    jejuProjectionRef,
    pois,
    selectedSiteId: selectedSiteIdStr,
    onPOIInfoClick,
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        background: "radial-gradient(ellipse at center, #D8E2ED 0%, #E8EEF5 50%, #F2F5F9 100%)",
      }}
    >
      <CoastlineBackground scale={coastlineScale} />
      {isLoading && <LoadingOverlay />}
    </div>
  );
}

/** 해안선 배경 이미지 */
function CoastlineBackground({ scale }: { scale: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      style={{ transform: `translate(-8rem, 4.875rem) scale(${scale})` }}
    >
      <img src={Outline1} alt="" className="absolute" style={{ opacity: 0.5 }} />
      <img src={Outline2} alt="" className="absolute" style={{ opacity: 0.7 }} />
      <img src={Outline3} alt="" className="absolute" style={{ opacity: 1 }} />
    </div>
  );
}

/** 로딩 오버레이 */
function LoadingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      <div className="flex items-center gap-3 rounded-lg bg-white/80 px-6 py-4 shadow-lg">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <span className="text-sm text-neutral-700">지도 로딩 중...</span>
      </div>
    </div>
  );
}
