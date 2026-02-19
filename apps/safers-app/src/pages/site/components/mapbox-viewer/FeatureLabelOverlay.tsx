import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { ThreeOverlayHandle } from "./types";

interface FeatureLabelOverlayProps {
  showCCTV: boolean;
  showWorker: boolean;
  /** 영역 검색 결과 등 — 칩 토글과 무관하게 항상 라벨 표시 */
  forcedIds?: Set<string>;
  workerNames?: Record<string, string>;
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  mapRef: React.RefObject<MapboxMap | null>;
  renderCallbacksRef: React.RefObject<Set<() => void>>;
  onFeatureClick?: (featureId: string) => void;
}

export function FeatureLabelOverlay({
  showCCTV,
  showWorker,
  forcedIds,
  workerNames,
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
  const workerNamesRef = useRef(workerNames);
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
    workerNamesRef.current = workerNames;
  }, [workerNames]);
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

        if (!shouldShow) {
          const existing = labelsRef.current.get(id);
          if (existing) existing.style.display = "none";
          continue;
        }

        visibleIds.add(id);

        let label = labelsRef.current.get(id);
        if (!label) {
          label = document.createElement("div");
          label.className =
            "absolute left-0 top-0 cursor-pointer whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium backdrop-blur-sm transition-opacity hover:opacity-80";
          label.style.willChange = "transform";
          label.dataset.featureId = id;

          if (isCCTV) {
            label.style.backgroundColor = "rgba(0,196,140,0.85)";
            label.style.color = "#fff";
          } else {
            label.style.backgroundColor = "rgba(0,0,0,0.7)";
            label.style.color = "#fff";
          }

          const name = isCCTV ? id : (workerNamesRef.current?.[id] ?? id);
          label.textContent = name;
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
