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

/**
 * POI 화면 좌표에서 겹치지 않는 가장 적절한 빈 슬롯 인덱스 반환.
 * 중앙 패널(1:3:1 비율) 기준으로 사분면을 판단한다.
 * 수평 같은 쪽 + 수직 반대쪽을 우선 배치.
 * 슬롯 순서: 0=TL, 1=TR, 2=BL, 3=BR
 */
function findClosestSlot(
  poiX: number,
  poiY: number,
  _slots: { x: number; y: number; cardW: number }[],
  usedSlots: Set<number>,
  vw: number,
  vh: number
): number {
  // 중앙 패널 (1:3:1) 기준 중심점
  const panelLeft = vw / 5;
  const panelRight = (vw * 4) / 5;
  const panelTop = vh * SLOT_TOP_RATIO;
  const panelBottom = vh * (1 - SLOT_BOTTOM_RATIO);
  const cx = (panelLeft + panelRight) / 2;
  const cy = (panelTop + panelBottom) / 2;

  const isLeft = poiX < cx;
  const isTop = poiY < cy;

  const preferred: number[] = isLeft
    ? isTop
      ? [2, 3, 0, 1]
      : [0, 1, 2, 3]
    : isTop
      ? [3, 2, 1, 0]
      : [1, 0, 3, 2];

  for (const idx of preferred) {
    if (!usedSlots.has(idx)) return idx;
  }
  return 0;
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

  // 새 팝업: 위치 먼저 측정 → 확정 후 생성 / 닫힌 팝업: 나머지 위치 그대로 유지
  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    const activeIds = new Set(popups.map((p) => p.featureId));

    setPositions((prev) => {
      const next = new Map(prev);
      let changed = false;

      // 닫힌 팝업만 제거 (나머지 위치는 건드리지 않음)
      for (const id of next.keys()) {
        if (!activeIds.has(id)) {
          next.delete(id);
          changed = true;
        }
      }

      // 새 팝업만 위치 계산
      const newPopups = popups.filter((p) => !next.has(p.featureId));
      if (newPopups.length === 0) return changed ? next : prev;

      const vw = canvas?.clientWidth ?? window.innerWidth;
      const vh = canvas?.clientHeight ?? window.innerHeight;
      const slots = getSlotPositions(vw, vh);

      // 이미 사용 중인 슬롯 수집 (기존 팝업들의 위치에서 가장 가까운 슬롯)
      const usedSlots = new Set<number>();
      for (const [, pos] of next) {
        let minDist = Infinity;
        let closestIdx = 0;
        for (let i = 0; i < slots.length; i++) {
          const dx = pos.x - slots[i]!.x;
          const dy = pos.y - slots[i]!.y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) {
            minDist = dist;
            closestIdx = i;
          }
        }
        usedSlots.add(closestIdx);
      }

      for (const p of newPopups) {
        const poi = overlayRef.current?.projectFeatureToScreen(p.featureId, vw, vh);
        const poiX = poi?.x ?? vw / 2;
        const poiY = poi?.y ?? vh / 2;

        const slotIdx = findClosestSlot(poiX, poiY, slots, usedSlots, vw, vh);
        usedSlots.add(slotIdx);
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

  // Register render callback — 리더라인만 업데이트 (팝업 위치는 건드리지 않음)
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
    if ((e.target as HTMLElement).closest("button")) return;

    const el = e.currentTarget.closest("[data-cctv-id]") as HTMLElement | null;
    if (!el) return;

    e.preventDefault();
    el.setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
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
