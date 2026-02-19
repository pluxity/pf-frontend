import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { ThreeOverlayHandle } from "./types";
import type { CCTVPopupEntry } from "@/stores";
import { CCTVPopupCard } from "./CCTVPopupCard";

// 슬롯 4개: 좌상(0), 우상(1), 좌하(2), 우하(3)
const SLOT_CLASSES = [
  "top-[4.75rem] left-0", // 좌상 (헤더 3.75rem + 여백 1rem)
  "top-[4.75rem] right-0", // 우상
  "bottom-[4.75rem] left-0", // 좌하
  "bottom-[4.75rem] right-0", // 우하
];

/**
 * CCTV 화면 좌표 기반으로 가장 가까운 모서리 슬롯에 매핑.
 * 화면 중심을 기준으로 사분면 판별 후, 충돌 시 가장 가까운 빈 슬롯으로 폴백.
 */
function assignSlots(
  popups: CCTVPopupEntry[],
  screenPositions: Map<string, { x: number; y: number }>,
  viewportW: number,
  viewportH: number
): number[] {
  const midX = viewportW / 2;
  const midY = viewportH / 2;

  // 슬롯 중심점 (뷰포트 기준 — 1:3:1 비율의 중앙 영역)
  const areaLeft = viewportW * 0.2;
  const areaRight = viewportW * 0.8;
  const areaTop = 76; // 4.75rem
  const areaBottom = viewportH - 76;

  const slotCenters = [
    { x: areaLeft, y: areaTop }, // 좌상
    { x: areaRight, y: areaTop }, // 우상
    { x: areaLeft, y: areaBottom }, // 좌하
    { x: areaRight, y: areaBottom }, // 우하
  ];

  const assignments = new Array<number>(popups.length).fill(-1);
  const usedSlots = new Set<number>();

  // 1차: 사분면 기반 매핑
  for (let i = 0; i < popups.length; i++) {
    const pos = screenPositions.get(popups[i]!.featureId);
    if (!pos) continue;

    const isLeft = pos.x < midX;
    const isTop = pos.y < midY;
    const preferred = isTop ? (isLeft ? 0 : 1) : isLeft ? 2 : 3;

    if (!usedSlots.has(preferred)) {
      assignments[i] = preferred;
      usedSlots.add(preferred);
    }
  }

  // 2차: 미배정 팝업 → 가장 가까운 빈 슬롯
  for (let i = 0; i < popups.length; i++) {
    if (assignments[i] !== -1) continue;

    const pos = screenPositions.get(popups[i]!.featureId);
    const px = pos?.x ?? midX;
    const py = pos?.y ?? midY;

    let bestSlot = -1;
    let bestDist = Infinity;

    for (let s = 0; s < 4; s++) {
      if (usedSlots.has(s)) continue;
      const dx = px - slotCenters[s]!.x;
      const dy = py - slotCenters[s]!.y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestSlot = s;
      }
    }

    if (bestSlot !== -1) {
      assignments[i] = bestSlot;
      usedSlots.add(bestSlot);
    }
  }

  // 3차: 그래도 미배정이면 순서대로 빈 슬롯 할당
  const remaining = [0, 1, 2, 3].filter((s) => !usedSlots.has(s));
  for (let i = 0; i < popups.length; i++) {
    if (assignments[i] === -1 && remaining.length > 0) {
      assignments[i] = remaining.shift()!;
    }
  }

  return assignments;
}

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
  const svgRef = useRef<SVGSVGElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  /** featureId → SVG elements { line, circle } */
  const svgElementsRef = useRef<Map<string, { line: SVGLineElement; circle: SVGCircleElement }>>(
    new Map()
  );

  // 슬롯 배정 결과: popups 인덱스 → 슬롯 인덱스
  // (refs에서 읽는 imperative 데이터로 렌더 중 계산 불가 → effect 사용)
  const [slotMap, setSlotMap] = useState<number[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect -- slot assignment depends on imperative refs (canvas size, screen positions) */
  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    const overlay = overlayRef.current;
    if (!canvas || !overlay) {
      setSlotMap(popups.map((_, i) => i));
      return;
    }

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const positions = new Map<string, { x: number; y: number }>();

    for (const p of popups) {
      const pos = overlay.projectFeatureToScreen(p.featureId, w, h);
      if (pos) positions.set(p.featureId, pos);
    }

    setSlotMap(assignSlots(popups, positions, w, h));
  }, [popups, overlayRef, mapRef]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-dasharray", "6 4");
        line.setAttribute("stroke-opacity", "0.9");

        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "#00C48C");
        circle.setAttribute("stroke", "#ffffff");
        circle.setAttribute("stroke-width", "2");

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

  return (
    <>
      {/* SVG layer for leader lines */}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{ overflow: "visible" }}
      />

      {/* 중앙 3/5 영역 (1:3:1 비율) */}
      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-y-0 left-[20%] right-[20%] z-[7]"
      >
        {popups.map((p, i) => (
          <div
            key={p.featureId}
            data-cctv-id={p.featureId}
            className={`absolute w-[24rem] ${SLOT_CLASSES[slotMap[i] ?? i]}`}
          >
            <CCTVPopupCard featureId={p.featureId} streamUrl={p.streamUrl} />
          </div>
        ))}
      </div>
    </>
  );
}
