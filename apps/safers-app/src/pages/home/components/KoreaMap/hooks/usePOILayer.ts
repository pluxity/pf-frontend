import { useEffect, useRef } from "react";
import { select } from "d3-selection";
import "d3-transition";
import type { GeoProjection } from "d3-geo";
import type { SVGSelection, SVGGroupSelection, POI, POICoords } from "../types";
import { MAP_COLORS, POI_MARKER } from "../constants";
import {
  projectCoords,
  createClickRipple,
  createPulseRipple,
  showPOIInfo,
  clearPOIInfo,
} from "../utils";
import { useSitesStore } from "@/stores";

interface UsePOILayerOptions {
  svgRef: React.MutableRefObject<SVGSelection | null>;
  mainProjectionRef: React.MutableRefObject<GeoProjection | null>;
  jejuProjectionRef: React.MutableRefObject<GeoProjection | null>;
  pois: POI[];
  onPOIClick?: (poi: POI) => void;
  onPOIHover?: (poi: POI | null) => void;
  onSelectSite: (siteId: string | null) => void;
}

/** POI 레이어 렌더링 및 이벤트 관리를 담당하는 훅 */
export function usePOILayer({
  svgRef,
  mainProjectionRef,
  jejuProjectionRef,
  pois,
  onPOIClick,
  onPOIHover,
  onSelectSite,
}: UsePOILayerOptions): void {
  const pulseIntervalsRef = useRef<number[]>([]);
  const onPOIClickRef = useRef(onPOIClick);
  const onPOIHoverRef = useRef(onPOIHover);

  useEffect(() => {
    onPOIClickRef.current = onPOIClick;
    onPOIHoverRef.current = onPOIHover;
  }, [onPOIClick, onPOIHover]);

  useEffect(() => {
    const svg = svgRef.current;
    const mainProjection = mainProjectionRef.current;
    const jejuProjection = jejuProjectionRef.current;

    if (!svg || !mainProjection) return;

    const poiLayer = svg.select<SVGGElement>(".poi-layer");
    const rippleLayer = svg.select<SVGGElement>(".ripple-layer");
    if (poiLayer.empty() || rippleLayer.empty()) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    clearPulseIntervals(pulseIntervalsRef.current);
    pulseIntervalsRef.current = [];

    poiLayer.selectAll("*").remove();
    rippleLayer.selectAll("*").remove();

    const pulsePOIs: { x: number; y: number; color: string }[] = [];

    pois.forEach((poi) => {
      const coords = projectCoords(poi.longitude, poi.latitude, mainProjection, jejuProjection);
      if (!coords) return;

      const poiCoords = calculatePOICoords(poi, coords, rootFontSize);
      renderPOIMarker(poiLayer, poi, poiCoords);
      bindPOIEvents(poiLayer, poi, poiCoords, rootFontSize, {
        onHover: onPOIHoverRef,
        onClick: onPOIClickRef,
        onSelectSite,
      });

      const status = poi.data?.status as string | undefined;
      if (status === "warning" || status === "danger") {
        pulsePOIs.push({ x: poiCoords.x, y: poiCoords.y, color: poiCoords.color });
      }

      if (poi.label) {
        renderPOILabel(poiLayer, poi.label, poiCoords.x, poiCoords.y, rootFontSize);
      }
    });

    if (pulsePOIs.length > 0) {
      startPulseAnimation(rippleLayer, pulsePOIs, rootFontSize, pulseIntervalsRef);
    }

    return () => {
      clearPulseIntervals(pulseIntervalsRef.current);
      pulseIntervalsRef.current = [];
    };
  }, [pois, svgRef, mainProjectionRef, jejuProjectionRef, onSelectSite]);
}

interface UseSelectedPOIOptions {
  svgRef: React.MutableRefObject<SVGSelection | null>;
  mainProjectionRef: React.MutableRefObject<GeoProjection | null>;
  jejuProjectionRef: React.MutableRefObject<GeoProjection | null>;
  pois: POI[];
  selectedSiteId: string | null;
}

/** 선택된 POI 시각 업데이트를 담당하는 훅 */
export function useSelectedPOI({
  svgRef,
  mainProjectionRef,
  jejuProjectionRef,
  pois,
  selectedSiteId,
}: UseSelectedPOIOptions): void {
  const prevSelectedSiteIdRef = useRef<string | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const poiLayer = svg.select<SVGGElement>(".poi-layer");
    const poiInfoLayer = svg.select<SVGGElement>(".poi-info-layer");
    if (poiLayer.empty() || poiInfoLayer.empty()) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const prevId = prevSelectedSiteIdRef.current;

    if (prevId && prevId !== selectedSiteId) {
      resetPOIVisual(poiLayer, prevId);
    }

    if (!selectedSiteId) {
      clearPOIInfo(poiInfoLayer);
      prevSelectedSiteIdRef.current = null;
      return;
    }

    const poiData = pois.find((p) => p.id === selectedSiteId);
    if (!poiData) return;

    const mainProjection = mainProjectionRef.current;
    const jejuProjection = jejuProjectionRef.current;
    if (!mainProjection) return;

    const coords = projectCoords(
      poiData.longitude,
      poiData.latitude,
      mainProjection,
      jejuProjection
    );
    if (!coords) return;

    const poiCoords = calculatePOICoords(poiData, coords, rootFontSize);
    highlightSelectedPOI(poiLayer, selectedSiteId, poiCoords);

    clearPOIInfo(poiInfoLayer);
    const siteName = (poiData.data?.name as string) ?? poiData.id;
    showPOIInfo(poiInfoLayer, poiCoords.x, poiCoords.y, siteName, rootFontSize);

    prevSelectedSiteIdRef.current = selectedSiteId;
  }, [selectedSiteId, pois, svgRef, mainProjectionRef, jejuProjectionRef]);
}

/** POI 좌표 계산 */
function calculatePOICoords(poi: POI, coords: [number, number], rootFontSize: number): POICoords {
  const [x, y] = coords;
  const size = poi.size ?? 1;
  const scale = (size * rootFontSize) / POI_MARKER.height;
  const color = poi.color ?? MAP_COLORS.defaultPOI;
  const offsetX = (POI_MARKER.width / 2) * scale;
  const offsetY = POI_MARKER.height * scale;

  return { x, y, scale, offsetX, offsetY, color };
}

/** POI 마커 렌더링 */
function renderPOIMarker(layer: SVGGroupSelection, poi: POI, coords: POICoords): void {
  const { x, y, scale, offsetX, offsetY, color } = coords;

  const poiGroup = layer
    .append("g")
    .attr("class", "poi")
    .attr("data-poi-id", poi.id)
    .attr("transform", `translate(${x - offsetX}, ${y - offsetY}) scale(${scale})`)
    .style("cursor", "pointer");

  poiGroup
    .append("path")
    .attr("d", POI_MARKER.path)
    .attr("fill", color)
    .attr("filter", "url(#poi-shadow)");

  poiGroup
    .append("circle")
    .attr("cx", POI_MARKER.anchorX)
    .attr("cy", POI_MARKER.anchorY)
    .attr("r", POI_MARKER.innerRadius)
    .attr("fill", "white");
}

interface POIEventHandlers {
  onHover: React.MutableRefObject<((poi: POI | null) => void) | undefined>;
  onClick: React.MutableRefObject<((poi: POI) => void) | undefined>;
  onSelectSite: (siteId: string | null) => void;
}

/** POI 이벤트 바인딩 */
function bindPOIEvents(
  layer: SVGGroupSelection,
  poi: POI,
  coords: POICoords,
  rootFontSize: number,
  handlers: POIEventHandlers
): void {
  const { x, y, scale, offsetX, offsetY } = coords;
  const poiGroup = layer.select(`[data-poi-id="${poi.id}"]`);

  poiGroup
    .on("mouseenter", function () {
      const currentSelected = useSitesStore.getState().selectedSiteId;
      if (currentSelected !== poi.id) {
        select(this)
          .transition()
          .duration(150)
          .attr(
            "transform",
            `translate(${x - offsetX * 1.15}, ${y - offsetY * 1.15}) scale(${scale * 1.15})`
          );
      }
      handlers.onHover.current?.(poi);
    })
    .on("mouseleave", function () {
      const currentSelected = useSitesStore.getState().selectedSiteId;
      if (currentSelected !== poi.id) {
        select(this)
          .transition()
          .duration(150)
          .attr("transform", `translate(${x - offsetX}, ${y - offsetY}) scale(${scale})`);
      }
      handlers.onHover.current?.(null);
    })
    .on("click", function (event: MouseEvent) {
      event.stopPropagation();

      const currentSelected = useSitesStore.getState().selectedSiteId;
      handlers.onSelectSite(currentSelected === poi.id ? null : poi.id);

      createClickRipple(layer, x, y, MAP_COLORS.brand, rootFontSize);
      handlers.onClick.current?.(poi);
    });
}

/** POI 라벨 렌더링 */
function renderPOILabel(
  layer: SVGGroupSelection,
  label: string,
  x: number,
  y: number,
  rootFontSize: number
): void {
  layer
    .append("text")
    .attr("class", "poi-label")
    .attr("x", x)
    .attr("y", y + 0.5 * rootFontSize)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .attr("font-size", `${0.75 * rootFontSize}px`)
    .attr("font-weight", "500")
    .style("pointer-events", "none")
    .text(label);
}

/** 펄스 애니메이션 시작 */
function startPulseAnimation(
  layer: SVGGroupSelection,
  pulsePOIs: { x: number; y: number; color: string }[],
  rootFontSize: number,
  intervalsRef: React.MutableRefObject<number[]>
): void {
  pulsePOIs.forEach(({ x, y, color }) => {
    createPulseRipple(layer, x, y, color, rootFontSize);
  });

  const intervalId = window.setInterval(() => {
    pulsePOIs.forEach(({ x, y, color }) => {
      createPulseRipple(layer, x, y, color, rootFontSize);
    });
  }, 2000);

  intervalsRef.current.push(intervalId);
}

/** 펄스 인터벌 정리 */
function clearPulseIntervals(intervals: number[]): void {
  intervals.forEach((id) => clearInterval(id));
}

/** POI 시각 상태 초기화 */
function resetPOIVisual(layer: SVGGroupSelection, poiId: string): void {
  const prevPoi = layer.select(`[data-poi-id="${poiId}"]`);
  if (!prevPoi.empty()) {
    prevPoi
      .transition()
      .duration(200)
      .attr("transform", prevPoi.attr("data-original-transform") ?? "")
      .select("path")
      .attr("fill", prevPoi.attr("data-original-color") ?? MAP_COLORS.defaultPOI);
  }
}

/** 선택된 POI 하이라이트 */
function highlightSelectedPOI(layer: SVGGroupSelection, poiId: string, coords: POICoords): void {
  const { x, y, scale, offsetX, offsetY, color } = coords;
  const newPoi = layer.select(`[data-poi-id="${poiId}"]`);

  if (newPoi.empty()) return;

  const selectedScale = scale * 1.5;
  const selectedOffsetX = (POI_MARKER.width / 2) * selectedScale;
  const selectedOffsetY = POI_MARKER.height * selectedScale;

  if (!newPoi.attr("data-original-transform")) {
    newPoi
      .attr("data-original-transform", `translate(${x - offsetX}, ${y - offsetY}) scale(${scale})`)
      .attr("data-original-color", color);
  }

  newPoi
    .transition()
    .duration(200)
    .attr(
      "transform",
      `translate(${x - selectedOffsetX}, ${y - selectedOffsetY}) scale(${selectedScale})`
    )
    .select("path")
    .attr("fill", MAP_COLORS.brand);
}
