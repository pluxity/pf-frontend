import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { ThreeOverlayHandle } from "../types";

const CCTV_ICON_SVG = `<svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-right:3px;flex-shrink:0"><path d="M3.77338 2.06961C3.28425 1.93485 2.76349 1.99723 2.31764 2.24398C1.87179 2.49073 1.53456 2.90321 1.37493 3.39702L1.34184 3.51195L0.656853 6.13958C0.570457 6.47085 0.609055 6.82344 0.764915 7.12671C0.920777 7.42998 1.18239 7.66156 1.49737 7.77505L1.59267 7.80497L3.14796 8.23339V9.28064C3.14792 9.4473 3.08831 9.60815 2.98046 9.73263C2.87261 9.85712 2.72402 9.93657 2.56291 9.9559L2.48547 9.96067H1.82365C1.82346 9.78734 1.75887 9.62063 1.64307 9.49459C1.52727 9.36856 1.36901 9.29272 1.20061 9.28256C1.03222 9.2724 0.8664 9.3287 0.737044 9.43994C0.607689 9.55119 0.524557 9.70899 0.504633 9.8811L0.5 9.96067V11.3207C0.500187 11.494 0.564779 11.6608 0.680578 11.7868C0.796376 11.9128 0.954642 11.9887 1.12304 11.9988C1.29143 12.009 1.45725 11.9527 1.5866 11.8414C1.71596 11.7302 1.79909 11.5724 1.81902 11.4003L1.82365 11.3207H2.48547C2.99191 11.3208 3.47921 11.1219 3.84768 10.7649C4.21615 10.408 4.43793 9.91979 4.46764 9.40032L4.47095 9.28064V8.59789L8.78141 9.78386C9.04116 9.85538 9.31595 9.8439 9.5692 9.75097C9.82245 9.65804 10.0421 9.48805 10.199 9.26364L10.2593 9.16911L12.2547 5.75128C12.3299 5.62249 12.3764 5.47822 12.3911 5.32879C12.4057 5.17935 12.3881 5.02843 12.3394 4.88682C12.2907 4.7452 12.2122 4.61637 12.1095 4.50954C12.0067 4.40271 11.8823 4.32052 11.7451 4.26882L11.6603 4.24162L3.77338 2.06961ZM12.2791 6.33339L11.2037 8.20347C11.1188 8.35843 11.0963 8.54141 11.1412 8.71317C11.186 8.88494 11.2945 9.03183 11.4435 9.12237C11.5924 9.21291 11.77 9.23988 11.9381 9.19752C12.1061 9.15516 12.2514 9.04682 12.3427 8.89574L13.4181 7.02566C13.501 6.87082 13.5219 6.68893 13.4765 6.51851C13.4311 6.34809 13.3229 6.20252 13.1749 6.11263C13.0268 6.02273 12.8505 5.99558 12.6834 6.03691C12.5162 6.07825 12.3712 6.18414 12.2791 6.33339Z" fill="currentColor"/></svg>`;

const USER_ICON_SVG = `<svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-right:3px;flex-shrink:0"><path d="M9.188 3.5C9.188 2.2127 8.287 1.3125 7 1.3125C5.713 1.3125 4.812 2.2127 4.812 3.5C4.812 4.7873 5.713 5.6875 7 5.6875C8.287 5.6875 9.188 4.7873 9.188 3.5ZM3.5 3.5C3.5 1.5717 4.869 0 7 0C9.131 0 10.5 1.5717 10.5 3.5C10.5 5.4283 9.131 7 7 7C4.869 7 3.5 5.4283 3.5 3.5ZM2.223 12.6875H11.777C11.534 10.9566 10.046 9.625 8.25 9.625H5.75C3.954 9.625 2.466 10.9566 2.223 12.6875ZM0.875 13.1879C0.875 10.4945 3.057 8.3125 5.75 8.3125H8.25C10.943 8.3125 13.125 10.4945 13.125 13.1879C13.125 13.6363 12.761 14 12.313 14H1.687C1.239 14 0.875 13.6363 0.875 13.1879Z" fill="currentColor"/></svg>`;

interface FeatureLabelOverlayProps {
  showCCTV: boolean;
  showWorker: boolean;
  /** 영역 검색 결과 등 — 칩 토글과 무관하게 항상 라벨 표시 */
  forcedIds?: Set<string>;
  /** 선택된 피처 / CCTV 팝업 등 — 팝업이 열려있으면 라벨 숨김 */
  hiddenIds?: Set<string>;
  workerNames?: Record<string, string>;
  workerLocations?: Record<string, { floor: string }>;
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  mapRef: React.RefObject<MapboxMap | null>;
  renderCallbacksRef: React.RefObject<Set<() => void>>;
  onFeatureClick?: (featureId: string) => void;
}

export function FeatureLabelOverlay({
  showCCTV,
  showWorker,
  forcedIds,
  hiddenIds,
  workerNames,
  workerLocations,
  overlayRef,
  mapRef,
  renderCallbacksRef,
  onFeatureClick,
}: FeatureLabelOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Mirror refs — render 콜백에서 stale closure 방지
  const showCCTVRef = useRef(showCCTV);
  const showWorkerRef = useRef(showWorker);
  const forcedIdsRef = useRef(forcedIds);
  const hiddenIdsRef = useRef(hiddenIds);
  const workerNamesRef = useRef(workerNames);
  const workerLocationsRef = useRef(workerLocations);
  const onFeatureClickRef = useRef(onFeatureClick);

  useEffect(() => {
    showCCTVRef.current = showCCTV;
  }, [showCCTV]);
  useEffect(() => {
    showWorkerRef.current = showWorker;
  }, [showWorker]);
  useEffect(() => {
    forcedIdsRef.current = forcedIds;
  }, [forcedIds]);
  useEffect(() => {
    hiddenIdsRef.current = hiddenIds;
  }, [hiddenIds]);
  useEffect(() => {
    workerNamesRef.current = workerNames;
  }, [workerNames]);
  useEffect(() => {
    workerLocationsRef.current = workerLocations;
  }, [workerLocations]);
  useEffect(() => {
    onFeatureClickRef.current = onFeatureClick;
  }, [onFeatureClick]);

  useEffect(() => {
    const updateLabels = () => {
      const canvas = mapRef.current?.getCanvas();
      const container = containerRef.current;
      if (!canvas || !overlayRef.current || !container) return;

      const showC = showCCTVRef.current;
      const showW = showWorkerRef.current;
      const forced = forcedIdsRef.current;
      const hidden = hiddenIdsRef.current;
      const hasForced = forced && forced.size > 0;

      if (!showC && !showW && !hasForced) {
        for (const [, label] of labelsRef.current) {
          label.style.display = "none";
        }
        return;
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const positions = overlayRef.current.getAllFeatureScreenPositions(w, h);
      const visibleIds = new Set<string>();

      for (const [id, pos] of positions) {
        const isCCTV = !!overlayRef.current.getCCTVStreamUrl(id);
        const isForced = hasForced && forced!.has(id);
        const shouldShow = isForced || (isCCTV ? showC : showW);

        // 팝업이 열려있는 피처는 라벨 숨김
        if (!shouldShow || (hidden && hidden.has(id))) {
          const existing = labelsRef.current.get(id);
          if (existing) existing.style.display = "none";
          continue;
        }

        visibleIds.add(id);

        let label = labelsRef.current.get(id);
        if (!label) {
          label = document.createElement("div");
          label.className =
            "absolute left-0 top-0 flex cursor-pointer items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium backdrop-blur-sm transition-opacity hover:opacity-80";
          label.style.willChange = "transform";
          label.dataset.featureId = id;

          if (isCCTV) {
            label.style.backgroundColor = "rgba(0,196,140,0.85)";
            label.style.color = "#fff";
          } else {
            label.style.backgroundColor = "rgba(0,0,0,0.7)";
            label.style.color = "#fff";
          }

          const icon = isCCTV ? CCTV_ICON_SVG : USER_ICON_SVG;
          const workerName = isCCTV ? id : (workerNamesRef.current?.[id] ?? id);
          const floorInfo = !isCCTV ? workerLocationsRef.current?.[id]?.floor : undefined;
          const floorSuffix = floorInfo ? ` ${floorInfo}` : "";
          label.innerHTML = `${icon}<span>${workerName}${floorSuffix}</span>`;
          container.appendChild(label);
          labelsRef.current.set(id, label);
        }

        label.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -100%)`;
        label.style.display = "";
      }

      // 화면 밖 라벨 숨김
      for (const [id, label] of labelsRef.current) {
        if (!visibleIds.has(id)) {
          label.style.display = "none";
        }
      }
    };

    const callbacks = renderCallbacksRef.current;
    const labels = labelsRef.current;
    callbacks.add(updateLabels);
    return () => {
      callbacks.delete(updateLabels);
      for (const [, label] of labels) {
        label.remove();
      }
      labels.clear();
    };
  }, [overlayRef, mapRef, renderCallbacksRef]);

  // 이벤트 위임으로 라벨 클릭 처리
  const handleClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-feature-id]");
    if (target?.dataset.featureId) {
      onFeatureClickRef.current?.(target.dataset.featureId);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden [&>*]:pointer-events-auto"
    />
  );
}
