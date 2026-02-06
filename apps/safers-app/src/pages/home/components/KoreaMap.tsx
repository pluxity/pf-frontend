import { useEffect, useRef, useState } from "react";
import { select, type Selection } from "d3-selection";
import { json } from "d3-fetch";
import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import { easeQuadOut } from "d3-ease";
import "d3-transition";
import type { FeatureCollection, Geometry } from "geojson";
import { useSitesStore, selectSelectedSiteId, selectSelectSiteAction } from "@/stores";

import Outline1 from "@/assets/images/outline_1.svg";
import Outline2 from "@/assets/images/outline_2.svg";
import Outline3 from "@/assets/images/outline_3.svg";

const SIDO_GEOJSON_PATH = "/geojson/sido_no_islands_ver20260201_optimized.geojson";
const JEJU_CODE = "50";
const REGION_COLOR = "#FFFFFF";
const STROKE_COLOR = "#A4A9C2";
const BRAND_COLOR = "#FF7500";

const MAP_SETTINGS = {
  centerLng: 127.8,
  centerLat: 36.2,
  scaleFactor: 0.55,
  referenceHeight: 1080,
  translateXOffset: -9.5,
  translateYOffset: 7,
};

const POINT_MARKER_PATH =
  "M14.5 1C20.8513 1 26 6.22371 26 12.667C25.9999 15.9322 24.676 18.8824 22.5449 21H22.5479L14.5 31L6.50391 21.0469C4.34468 18.9261 3.00011 15.9567 3 12.667C3 6.22374 8.14872 1.00005 14.5 1Z";
const POINT_MARKER_WIDTH = 30;
const POINT_MARKER_HEIGHT = 31;

interface SidoProperties {
  sido: string;
  sidonm: string;
  [key: string]: unknown;
}

type SidoFeature = GeoJSON.Feature<Geometry, SidoProperties>;
type SidoFeatureCollection = FeatureCollection<Geometry, SidoProperties>;

export interface POI {
  id: string;
  longitude: number;
  latitude: number;
  label?: string;
  icon?: string;
  color?: string;
  size?: number;
  data?: Record<string, unknown>;
}

interface KoreaMapProps {
  className?: string;
  pois?: POI[];
  onPOIClick?: (poi: POI) => void;
  onPOIHover?: (poi: POI | null) => void;
}

/** 대한민국 지도와 POI를 D3.js로 렌더링하는 컴포넌트 */
export function KoreaMap({ className, pois = [], onPOIClick, onPOIHover }: KoreaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const mainProjectionRef = useRef<GeoProjection | null>(null);
  const jejuProjectionRef = useRef<GeoProjection | null>(null);
  const pulseIntervalsRef = useRef<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coastlineScale, setCoastlineScale] = useState(1.05);

  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const selectSiteAction = useSitesStore(selectSelectSiteAction);

  const prevSelectedSiteIdRef = useRef<string | null>(null);

  const onPOIClickRef = useRef(onPOIClick);
  const onPOIHoverRef = useRef(onPOIHover);
  onPOIClickRef.current = onPOIClick;
  onPOIHoverRef.current = onPOIHover;

  /** 지도 SVG 초기화 및 GeoJSON 렌더링 */
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    select(container).select("svg").remove();

    const svg = select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "transparent")
      .style("position", "relative")
      .style("z-index", "1");

    svgRef.current = svg;

    svg
      .append("rect")
      .attr("class", "click-background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("click", function () {
        selectSiteAction(null);
      });

    svg.append("defs").html(`
      <filter id="region-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#5A6A7A" flood-opacity="0.4"/>
      </filter>
      <filter id="inset-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#5A6A7A" flood-opacity="0.3"/>
      </filter>
      <filter id="poi-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
      </filter>
    `);

    const mainGroup = svg.append("g").attr("class", "main-group");
    const mainShadowGroup = mainGroup.append("g").attr("class", "shadow-layer");
    const mainMapGroup = mainGroup.append("g").attr("class", "map-layer");

    const jejuInset = svg.append("g").attr("class", "jeju-inset");
    const jejuShadowGroup = jejuInset.append("g").attr("class", "jeju-shadow");
    const jejuMapGroup = jejuInset.append("g").attr("class", "jeju-map");

    svg.append("g").attr("class", "ripple-layer").style("pointer-events", "none");
    svg.append("g").attr("class", "poi-layer").style("pointer-events", "all");
    svg.append("g").attr("class", "poi-info-layer").style("pointer-events", "none");

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    setCoastlineScale(1.05 * (rootFontSize / 16));

    const baseScale = MAP_SETTINGS.referenceHeight * MAP_SETTINGS.scaleFactor * rootFontSize;

    const mainProjection = geoMercator()
      .center([MAP_SETTINGS.centerLng, MAP_SETTINGS.centerLat])
      .scale(baseScale)
      .translate([
        width / 2 + MAP_SETTINGS.translateXOffset * rootFontSize,
        height / 2 + MAP_SETTINGS.translateYOffset * rootFontSize,
      ]);

    mainProjectionRef.current = mainProjection;
    const mainPath = geoPath().projection(mainProjection);

    setIsLoading(true);
    json<SidoFeatureCollection>(SIDO_GEOJSON_PATH)
      .then((data) => {
        if (!data) return;

        const mainlandFeatures = data.features.filter((f) => f.properties.sido !== JEJU_CODE);
        const jejuFeatures = data.features.filter((f) => f.properties.sido === JEJU_CODE);

        mainShadowGroup
          .selectAll<SVGPathElement, SidoFeature>("path")
          .data(mainlandFeatures)
          .enter()
          .append("path")
          .attr("d", (d) => mainPath(d) ?? "")
          .attr("fill", "#3A4A5A")
          .attr("transform", `translate(${0.5 * rootFontSize}, ${0.75 * rootFontSize})`)
          .style("opacity", 0.6)
          .style("filter", `blur(${0.625 * rootFontSize}px)`);

        mainMapGroup
          .selectAll<SVGPathElement, SidoFeature>("path")
          .data(mainlandFeatures)
          .enter()
          .append("path")
          .attr("class", "region")
          .attr("d", (d) => mainPath(d) ?? "")
          .attr("fill", REGION_COLOR)
          .attr("stroke", STROKE_COLOR)
          .attr("stroke-width", 0.0625 * rootFontSize)
          .style("pointer-events", "none");

        const mainBounds = mainMapGroup.node()?.getBBox();
        const jejuInsetWidth = 9 * rootFontSize;
        const jejuInsetHeight = 5.5 * rootFontSize;
        const jejuInsetX = mainBounds
          ? mainBounds.x + mainBounds.width - jejuInsetWidth + 3 * rootFontSize
          : width - jejuInsetWidth - 0.25 * rootFontSize;
        const jejuInsetY = mainBounds
          ? mainBounds.y + mainBounds.height - 4.5 * rootFontSize
          : height - jejuInsetHeight - 1.25 * rootFontSize;

        const jejuBgRect = jejuInset
          .append("rect")
          .attr("x", jejuInsetX - 0.75 * rootFontSize)
          .attr("y", jejuInsetY - 0.5 * rootFontSize)
          .attr("width", jejuInsetWidth + 1.5 * rootFontSize)
          .attr("height", jejuInsetHeight + 1.25 * rootFontSize)
          .attr("rx", 0.625 * rootFontSize)
          .attr("fill", "rgba(174, 192, 224, 0.3)");
        jejuBgRect.lower();

        jejuInset
          .append("text")
          .attr("x", jejuInsetX + jejuInsetWidth / 2)
          .attr("y", jejuInsetY + 0.625 * rootFontSize)
          .attr("text-anchor", "middle")
          .attr("fill", "#666")
          .attr("font-size", `${0.625 * rootFontSize}px`)
          .text("제주특별자치도");

        const jejuScale = 350 * rootFontSize;
        const jejuProjection = geoMercator()
          .center([126.55, 33.38])
          .scale(jejuScale)
          .translate([
            jejuInsetX + jejuInsetWidth / 2,
            jejuInsetY + jejuInsetHeight / 2 + 0.5 * rootFontSize,
          ]);

        const jejuPath = geoPath().projection(jejuProjection);

        jejuShadowGroup
          .selectAll<SVGPathElement, SidoFeature>("path")
          .data(jejuFeatures)
          .enter()
          .append("path")
          .attr("d", (d) => jejuPath(d) ?? "")
          .attr("fill", "#3A4A5A")
          .attr("transform", `translate(${0.375 * rootFontSize}, ${0.5 * rootFontSize})`)
          .style("opacity", 0.5)
          .style("filter", `blur(${0.4 * rootFontSize}px)`);

        jejuMapGroup
          .selectAll<SVGPathElement, SidoFeature>("path")
          .data(jejuFeatures)
          .enter()
          .append("path")
          .attr("class", "region")
          .attr("d", (d) => jejuPath(d) ?? "")
          .attr("fill", REGION_COLOR)
          .attr("stroke", STROKE_COLOR)
          .attr("stroke-width", 0.05 * rootFontSize)
          .style("pointer-events", "none");

        jejuProjectionRef.current = jejuProjection;
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Failed to load GeoJSON:", error);
        setIsLoading(false);
      });

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      const newRootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
      mainProjection.translate([
        newWidth / 2 + MAP_SETTINGS.translateXOffset * newRootFontSize,
        newHeight / 2 + MAP_SETTINGS.translateYOffset * newRootFontSize,
      ]);
      mainProjection.scale(
        Math.min(newWidth, newHeight) * MAP_SETTINGS.scaleFactor * newRootFontSize
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      select(container).select("svg").remove();
    };
  }, [selectSiteAction]);

  /** POI 마커 렌더링 및 이벤트 바인딩 */
  useEffect(() => {
    const svg = svgRef.current;
    const mainProjection = mainProjectionRef.current;
    const jejuProjection = jejuProjectionRef.current;

    if (!svg || !mainProjection) return;

    const poiLayer = svg.select<SVGGElement>(".poi-layer");
    const rippleLayer = svg.select<SVGGElement>(".ripple-layer");
    if (poiLayer.empty() || rippleLayer.empty()) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    pulseIntervalsRef.current.forEach((id) => clearInterval(id));
    pulseIntervalsRef.current = [];

    poiLayer.selectAll("*").remove();
    rippleLayer.selectAll("*").remove();

    const pulsePOIs: { x: number; y: number; color: string }[] = [];

    pois.forEach((poi) => {
      const isJeju = poi.latitude < 34.0 && poi.longitude >= 125.5 && poi.longitude <= 127.5;
      const projection = isJeju && jejuProjection ? jejuProjection : mainProjection;

      const coords = projection([poi.longitude, poi.latitude]);
      if (!coords) return;

      const [x, y] = coords;
      const size = poi.size ?? 1;
      const scale = (size * rootFontSize) / POINT_MARKER_HEIGHT;
      const color = poi.color ?? "#4D7EFF";

      const status = poi.data?.status as string | undefined;
      if (status === "warning" || status === "danger") {
        pulsePOIs.push({ x, y, color });
      }

      const offsetX = (POINT_MARKER_WIDTH / 2) * scale;
      const offsetY = POINT_MARKER_HEIGHT * scale;

      const poiGroup = poiLayer
        .append("g")
        .attr("class", "poi")
        .attr("data-poi-id", poi.id)
        .attr("transform", `translate(${x - offsetX}, ${y - offsetY}) scale(${scale})`)
        .style("cursor", "pointer");

      poiGroup
        .append("path")
        .attr("d", POINT_MARKER_PATH)
        .attr("fill", color)
        .attr("filter", "url(#poi-shadow)");

      poiGroup
        .append("circle")
        .attr("cx", 14.5)
        .attr("cy", 12.5)
        .attr("r", 6.5)
        .attr("fill", "white");

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
          onPOIHoverRef.current?.(poi);
        })
        .on("mouseleave", function () {
          const currentSelected = useSitesStore.getState().selectedSiteId;
          if (currentSelected !== poi.id) {
            select(this)
              .transition()
              .duration(150)
              .attr("transform", `translate(${x - offsetX}, ${y - offsetY}) scale(${scale})`);
          }
          onPOIHoverRef.current?.(null);
        })
        .on("click", function (event: MouseEvent) {
          event.stopPropagation();

          const currentSelected = useSitesStore.getState().selectedSiteId;

          if (currentSelected === poi.id) {
            selectSiteAction(null);
          } else {
            selectSiteAction(poi.id);
          }

          createPOIRipple(poiLayer, x, y, BRAND_COLOR, rootFontSize);
          onPOIClickRef.current?.(poi);
        });

      if (poi.label) {
        poiLayer
          .append("text")
          .attr("class", "poi-label")
          .attr("x", x)
          .attr("y", y + 0.5 * rootFontSize)
          .attr("text-anchor", "middle")
          .attr("fill", "#333")
          .attr("font-size", `${0.75 * rootFontSize}px`)
          .attr("font-weight", "500")
          .style("pointer-events", "none")
          .text(poi.label);
      }
    });

    if (pulsePOIs.length > 0) {
      pulsePOIs.forEach(({ x, y, color }) => {
        createPulseRipple(rippleLayer, x, y, color, rootFontSize);
      });

      const intervalId = window.setInterval(() => {
        pulsePOIs.forEach(({ x, y, color }) => {
          createPulseRipple(rippleLayer, x, y, color, rootFontSize);
        });
      }, 2000);
      pulseIntervalsRef.current.push(intervalId);
    }

    return () => {
      pulseIntervalsRef.current.forEach((id) => clearInterval(id));
      pulseIntervalsRef.current = [];
    };
  }, [pois, selectSiteAction]);

  /** 스토어 선택 상태 변경 시 POI 시각 업데이트 */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const poiLayer = svg.select<SVGGElement>(".poi-layer");
    const poiInfoLayer = svg.select<SVGGElement>(".poi-info-layer");
    if (poiLayer.empty() || poiInfoLayer.empty()) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const prevId = prevSelectedSiteIdRef.current;

    if (prevId && prevId !== selectedSiteId) {
      const prevPoi = poiLayer.select(`[data-poi-id="${prevId}"]`);
      if (!prevPoi.empty()) {
        prevPoi
          .transition()
          .duration(200)
          .attr("transform", prevPoi.attr("data-original-transform") ?? "")
          .select("path")
          .attr("fill", prevPoi.attr("data-original-color") ?? "#4D7EFF");
      }
    }

    if (!selectedSiteId) {
      clearPOIInfo(poiInfoLayer);
      prevSelectedSiteIdRef.current = null;
      return;
    }

    const newPoi = poiLayer.select(`[data-poi-id="${selectedSiteId}"]`);
    if (!newPoi.empty()) {
      const poiData = pois.find((p) => p.id === selectedSiteId);
      if (poiData) {
        const mainProjection = mainProjectionRef.current;
        const jejuProjection = jejuProjectionRef.current;
        if (!mainProjection) return;

        const isJeju =
          poiData.latitude < 34.0 && poiData.longitude >= 125.5 && poiData.longitude <= 127.5;
        const projection = isJeju && jejuProjection ? jejuProjection : mainProjection;
        const coords = projection([poiData.longitude, poiData.latitude]);
        if (!coords) return;

        const [x, y] = coords;
        const size = poiData.size ?? 1;
        const scale = (size * rootFontSize) / POINT_MARKER_HEIGHT;
        const color = poiData.color ?? "#4D7EFF";

        const offsetX = (POINT_MARKER_WIDTH / 2) * scale;
        const offsetY = POINT_MARKER_HEIGHT * scale;
        const selectedScale = scale * 1.5;
        const selectedOffsetX = (POINT_MARKER_WIDTH / 2) * selectedScale;
        const selectedOffsetY = POINT_MARKER_HEIGHT * selectedScale;

        if (!newPoi.attr("data-original-transform")) {
          newPoi
            .attr(
              "data-original-transform",
              `translate(${x - offsetX}, ${y - offsetY}) scale(${scale})`
            )
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
          .attr("fill", BRAND_COLOR);

        clearPOIInfo(poiInfoLayer);
        const siteName = (poiData.data?.name as string) ?? poiData.id;
        showPOIInfo(poiInfoLayer, x, y, siteName, rootFontSize);
      }
    }

    prevSelectedSiteIdRef.current = selectedSiteId;
  }, [selectedSiteId, pois]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        background: "radial-gradient(ellipse at center, #D8E2ED 0%, #E8EEF5 50%, #F2F5F9 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        style={{
          transform: `translate(-8rem, 4.875rem) scale(${coastlineScale})`,
        }}
      >
        <img src={Outline1} alt="" className="absolute" style={{ opacity: 0.5 }} />
        <img src={Outline2} alt="" className="absolute" style={{ opacity: 0.7 }} />
        <img src={Outline3} alt="" className="absolute" style={{ opacity: 1 }} />
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-lg bg-white/80 px-6 py-4 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <span className="text-sm text-neutral-700">지도 로딩 중...</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** POI 클릭 시 퍼지는 리플 효과 생성 */
function createPOIRipple(
  layer: Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  color: string,
  rootFontSize: number
) {
  const rippleGroup = layer.append("g").attr("class", "poi-ripple");

  rippleGroup
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 0)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 0.125 * rootFontSize)
    .attr("opacity", 1)
    .transition()
    .duration(400)
    .ease(easeQuadOut)
    .attr("r", 1.5 * rootFontSize)
    .attr("opacity", 0)
    .remove();

  rippleGroup
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 0)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 0.09375 * rootFontSize)
    .attr("opacity", 0.6)
    .transition()
    .delay(80)
    .duration(400)
    .ease(easeQuadOut)
    .attr("r", 2 * rootFontSize)
    .attr("opacity", 0)
    .on("end", function () {
      rippleGroup.remove();
    });
}

/** warning/danger 상태 POI의 반복 펄스 리플 효과 생성 */
function createPulseRipple(
  layer: Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  color: string,
  rootFontSize: number
) {
  const delays = [0, 1000];

  delays.forEach((delay) => {
    const ripple = layer
      .append("circle")
      .attr("class", "pulse-ripple")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 0.2 * rootFontSize)
      .style("fill", color)
      .style("fill-opacity", delay === 0 ? 0.4 : 0)
      .style("stroke", "none")
      .style("pointer-events", "none");

    ripple
      .transition()
      .delay(delay)
      .duration(0)
      .style("fill-opacity", 0.4)
      .transition()
      .duration(2000)
      .ease(easeQuadOut)
      .attr("r", 1.5 * rootFontSize)
      .style("fill-opacity", 0)
      .remove();
  });
}

/** 선택된 POI의 정보 라벨 표시 */
function showPOIInfo(
  layer: Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  siteName: string,
  rootFontSize: number
) {
  clearPOIInfo(layer);

  const infoGroup = layer.append("g").attr("class", "poi-info");

  const lineStartX = x;
  const lineStartY = y;
  const lineEndX = x + 2 * rootFontSize;
  const lineY = lineStartY;

  const textLength = siteName.length;
  const boxWidth = Math.max(5, textLength * 0.55 + 1.5) * rootFontSize;
  const boxHeight = 1.5 * rootFontSize;
  const boxX = lineEndX;
  const boxY = lineY - boxHeight / 2;

  infoGroup
    .append("line")
    .attr("x1", lineStartX)
    .attr("y1", lineStartY)
    .attr("x2", lineStartX)
    .attr("y2", lineStartY)
    .attr("stroke", BRAND_COLOR)
    .attr("stroke-width", 0.125 * rootFontSize)
    .transition()
    .duration(200)
    .attr("x2", lineEndX);

  const pillGroup = infoGroup.append("g").attr("class", "poi-info-pill").style("opacity", 0);

  pillGroup
    .append("rect")
    .attr("x", boxX)
    .attr("y", boxY)
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .attr("rx", boxHeight / 2)
    .attr("fill", BRAND_COLOR);

  pillGroup
    .append("text")
    .attr("x", boxX + boxWidth / 2)
    .attr("y", boxY + boxHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", `${0.75 * rootFontSize}px`)
    .attr("font-weight", "500")
    .text(siteName);

  pillGroup.transition().delay(150).duration(200).style("opacity", 1);
}

/** POI 정보 라벨 제거 */
function clearPOIInfo(layer: Selection<SVGGElement, unknown, null, undefined>) {
  layer.selectAll(".poi-info").transition().duration(150).style("opacity", 0).remove();
}
