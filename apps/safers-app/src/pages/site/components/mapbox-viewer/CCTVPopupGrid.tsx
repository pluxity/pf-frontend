import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { ThreeOverlayHandle } from "./types";
import type { CCTVPopupEntry } from "@/stores";
import { useCCTVPopupStore } from "@/stores";
import { CCTVPopupCard } from "./CCTVPopupCard";

interface CCTVPopupGridProps {
  popups: CCTVPopupEntry[];
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  mapRef: React.RefObject<MapboxMap | null>;
  renderCallbacksRef: React.RefObject<Set<() => void>>;
}

export function CCTVPopupGrid({
  popups,
  overlayRef,
  mapRef,
  renderCallbacksRef,
}: CCTVPopupGridProps) {
  const closeAll = useCCTVPopupStore((s) => s.closeAll);
  const svgRef = useRef<SVGSVGElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  /** featureId → SVG elements { line, circle } */
  const svgElementsRef = useRef<Map<string, { line: SVGLineElement; circle: SVGCircleElement }>>(
    new Map()
  );

  // Sync SVG elements with popups list
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const current = svgElementsRef.current;
    const activeIds = new Set(popups.map((p) => p.featureId));

    // Remove old
    for (const [id, els] of current) {
      if (!activeIds.has(id)) {
        els.line.remove();
        els.circle.remove();
        current.delete(id);
      }
    }

    // Create new
    for (const p of popups) {
      if (!current.has(p.featureId)) {
        const ns = "http://www.w3.org/2000/svg";

        const line = document.createElementNS(ns, "line");
        line.setAttribute("stroke", "#00C48C");
        line.setAttribute("stroke-width", "1.5");
        line.setAttribute("stroke-dasharray", "6 4");
        line.setAttribute("stroke-opacity", "0.8");

        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute("r", "4");
        circle.setAttribute("fill", "#00C48C");
        circle.setAttribute("stroke", "#ffffff");
        circle.setAttribute("stroke-width", "1.5");

        svg.appendChild(line);
        svg.appendChild(circle);
        current.set(p.featureId, { line, circle });
      }
    }
  }, [popups]);

  // Register render callback for leader line position updates
  useEffect(() => {
    const updateLeaderLines = () => {
      const canvas = mapRef.current?.getCanvas();
      if (!canvas || !overlayRef.current || !gridRef.current) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const grid = gridRef.current;
      const cards = grid.querySelectorAll<HTMLElement>("[data-cctv-id]");

      for (const card of cards) {
        const featureId = card.dataset.cctvId;
        if (!featureId) continue;

        const els = svgElementsRef.current.get(featureId);
        if (!els) continue;

        const screenPos = overlayRef.current.projectFeatureToScreen(featureId, w, h);
        if (!screenPos) {
          els.line.setAttribute("display", "none");
          els.circle.setAttribute("display", "none");
          continue;
        }

        // Card center-bottom position (relative to MapboxViewer container)
        const cardRect = card.getBoundingClientRect();
        const containerRect = grid.closest(".relative")?.getBoundingClientRect();
        if (!containerRect) continue;

        const cardCx = cardRect.left + cardRect.width / 2 - containerRect.left;
        const cardCy = cardRect.bottom - containerRect.top;

        els.line.setAttribute("x1", String(cardCx));
        els.line.setAttribute("y1", String(cardCy));
        els.line.setAttribute("x2", String(screenPos.x));
        els.line.setAttribute("y2", String(screenPos.y));
        els.line.setAttribute("display", "");

        els.circle.setAttribute("cx", String(screenPos.x));
        els.circle.setAttribute("cy", String(screenPos.y));
        els.circle.setAttribute("display", "");
      }
    };

    const callbacks = renderCallbacksRef.current;
    callbacks.add(updateLeaderLines);
    return () => {
      callbacks.delete(updateLeaderLines);
    };
  }, [popups, overlayRef, mapRef, renderCallbacksRef]);

  // Grid layout: 1 card = 1x1, 2 cards = 1x2, 3-4 cards = 2x2
  const cols = popups.length <= 2 ? popups.length : 2;

  return (
    <>
      {/* SVG layer for leader lines */}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{ overflow: "visible" }}
      />

      {/* Grid container — centered, avoiding left/right panels */}
      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-0 z-[7] flex items-center justify-center"
      >
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${cols}, 16rem)`,
            maxWidth: "calc(100% - 24rem)",
          }}
        >
          {popups.map((p) => (
            <div key={p.featureId} data-cctv-id={p.featureId}>
              <CCTVPopupCard featureId={p.featureId} streamUrl={p.streamUrl} />
            </div>
          ))}
        </div>

        {/* 전체 닫기 버튼 */}
        {popups.length > 1 && (
          <button
            onClick={closeAll}
            className="pointer-events-auto absolute right-[13rem] top-[calc(50%-8rem)] rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white/80 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
          >
            모두 닫기
          </button>
        )}
      </div>
    </>
  );
}
