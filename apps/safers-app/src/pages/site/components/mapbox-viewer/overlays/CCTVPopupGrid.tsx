import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { ThreeOverlayHandle } from "../types";
import type { CCTVPopupEntry } from "@/stores";
import { CCTVPopupCard } from "./CCTVPopupCard";

const CARD_W_RATIO = 0.2;
const CARD_ASPECT = 16 / 9;
const SLOT_INSET = 0.02;
const SLOT_TOP_RATIO = 0.08;
const SLOT_BOTTOM_RATIO = 0.08;

/** 화면을 1/3/1로 나눈 중간 영역의 4 꼭짓점 좌표 (TL, TR, BL, BR) */
function getSlotPositions(vw: number, vh: number): { x: number; y: number; cardW: number }[] {
  const cardW = Math.round(vw * CARD_W_RATIO);
  const midLeft = vw / 5;
  const midRight = (vw * 4) / 5;
  const inset = Math.round(vw * SLOT_INSET);
  const topY = Math.round(vh * SLOT_TOP_RATIO);
  const cardH = Math.round(cardW / CARD_ASPECT) + 60;
  const bottomY = Math.round(vh - cardH - vh * SLOT_BOTTOM_RATIO);
  return [
    { x: midLeft + inset, y: topY, cardW },
    { x: midRight - cardW - inset, y: topY, cardW },
    { x: midLeft + inset, y: bottomY, cardW },
    { x: midRight - cardW - inset, y: bottomY, cardW },
  ];
}

/** POI 화면 좌표에서 가장 가까운 빈 슬롯 인덱스 반환 */
function findClosestSlot(
  poiX: number,
  poiY: number,
  slots: { x: number; y: number; cardW: number }[],
  usedSlots: Set<number>
): number {
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < slots.length; i++) {
    if (usedSlots.has(i)) continue;
    const s = slots[i]!;
    const cardH = Math.round(s.cardW / CARD_ASPECT) + 60;
    const cx = s.x + s.cardW / 2;
    const cy = s.y + cardH / 2;
    const dist = (poiX - cx) ** 2 + (poiY - cy) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best >= 0 ? best : 0;
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
  const svgElementsRef = useRef<Map<string, { line: SVGLineElement; circle: SVGCircleElement }>>(
    new Map()
  );

  const [positions, setPositions] = useState<Map<string, { x: number; y: number; cardW: number }>>(
    new Map()
  );
  /** featureId → slot index (0~3) */
  const slotAssignRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    const activeIds = new Set(popups.map((p) => p.featureId));

    // 닫힌 팝업 슬롯 해제
    for (const [id] of slotAssignRef.current) {
      if (!activeIds.has(id)) slotAssignRef.current.delete(id);
    }

    setPositions((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const id of next.keys()) {
        if (!activeIds.has(id)) {
          next.delete(id);
          changed = true;
        }
      }

      const newPopups = popups.filter((p) => !next.has(p.featureId));
      if (newPopups.length === 0) return changed ? next : prev;

      const vw = canvas?.clientWidth ?? window.innerWidth;
      const vh = canvas?.clientHeight ?? window.innerHeight;
      const slots = getSlotPositions(vw, vh);
      const usedSlots = new Set(slotAssignRef.current.values());

      for (const p of newPopups) {
        const poi = overlayRef.current?.projectFeatureToScreen(p.featureId, vw, vh);
        const poiX = poi?.x ?? vw / 2;
        const poiY = poi?.y ?? vh / 2;

        const slotIdx = findClosestSlot(poiX, poiY, slots, usedSlots);
        usedSlots.add(slotIdx);
        slotAssignRef.current.set(p.featureId, slotIdx);
        next.set(p.featureId, slots[slotIdx]!);
      }

      return next;
    });
  }, [popups, overlayRef, mapRef]);

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

  // ── 드래그 핸들러 ──

  const handleDragStart = (featureId: string, e: React.PointerEvent) => {
    // 닫기 버튼 클릭은 드래그로 처리하지 않음
    if ((e.target as HTMLElement).closest("button")) return;

    const el = e.currentTarget.closest("[data-cctv-id]") as HTMLElement | null;
    if (!el) return;

    e.preventDefault();
    el.setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    // DOM에서 현재 위치 읽기 (드래그 중 직접 조작한 값 반영)
    const origLeft = parseFloat(el.style.left) || 0;
    const origTop = parseFloat(el.style.top) || 0;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      el.style.left = `${origLeft + dx}px`;
      el.style.top = `${origTop + dy}px`;
    };

    const onUp = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      // 드래그 끝 → state에 반영
      setPositions((prev) => {
        const next = new Map(prev);
        const existing = prev.get(featureId);
        next.set(featureId, {
          x: origLeft + dx,
          y: origTop + dy,
          cardW: existing?.cardW ?? Math.round(window.innerWidth * CARD_W_RATIO),
        });
        return next;
      });
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
  };

  return (
    <>
      {/* SVG layer for leader lines */}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{ overflow: "visible" }}
      />

      {/* 팝업 컨테이너 (전체 영역) */}
      <div ref={gridRef} className="pointer-events-none absolute inset-0 z-[7]">
        {popups.map((p) => {
          const pos = positions.get(p.featureId);
          const cardW = pos?.cardW ?? Math.round(window.innerWidth * CARD_W_RATIO);
          return (
            <div
              key={p.featureId}
              data-cctv-id={p.featureId}
              className="absolute"
              style={{ left: pos?.x ?? 0, top: pos?.y ?? 0, width: cardW }}
            >
              <CCTVPopupCard
                featureId={p.featureId}
                streamUrl={p.streamUrl}
                onHeaderPointerDown={(e) => handleDragStart(p.featureId, e)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
