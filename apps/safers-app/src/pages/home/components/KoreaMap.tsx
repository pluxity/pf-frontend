import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { FeatureCollection, Geometry } from "geojson";

// 해안선 아웃라인 SVG
import Outline1 from "@/assets/images/outline_1.svg";
import Outline2 from "@/assets/images/outline_2.svg";
import Outline3 from "@/assets/images/outline_3.svg";

// 시도 GeoJSON 파일 경로 (섬 제외 버전)
const SIDO_GEOJSON_PATH = "/geojson/sido_no_islands_ver20260201.geojson";

// 제주도 시도 코드
const JEJU_CODE = "50";

// 기본 색상 (전부 흰색)
const REGION_COLOR = "#FFFFFF";

// 선 색상
const STROKE_COLOR = "#A4A9C2";

function getColorBySidoCode(_sidoCode: string): string {
  return REGION_COLOR;
}

interface SidoProperties {
  sido: string;
  sidonm: string;
  [key: string]: unknown;
}

type SidoFeature = GeoJSON.Feature<Geometry, SidoProperties>;
type SidoFeatureCollection = FeatureCollection<Geometry, SidoProperties>;

// POI 타입 정의
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

// Point 마커 SVG path (30x37 viewBox 기준)
const POINT_MARKER_PATH =
  "M14.5 1C20.8513 1 26 6.22371 26 12.667C25.9999 15.9322 24.676 18.8824 22.5449 21H22.5479L14.5 31L6.50391 21.0469C4.34468 18.9261 3.00011 15.9567 3 12.667C3 6.22374 8.14872 1.00005 14.5 1Z";
const POINT_MARKER_WIDTH = 30;
const POINT_MARKER_HEIGHT = 37;

interface KoreaMapProps {
  className?: string;
  pois?: POI[];
  onPOIClick?: (poi: POI) => void;
  onPOIHover?: (poi: POI | null) => void;
}

// 프로젝션 설정
const MAP_SETTINGS = {
  centerLng: 127.8,
  centerLat: 36.2,
  scaleFactor: 0.55,
  referenceHeight: 1080, // FHD 기준 높이
  translateXOffset: -9.5, // rem
  translateYOffset: 5, // rem (아래로 더 이동)
};

export function KoreaMap({ className, pois = [], onPOIClick, onPOIHover }: KoreaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const mainProjectionRef = useRef<d3.GeoProjection | null>(null);
  const jejuProjectionRef = useRef<d3.GeoProjection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coastlineScale, setCoastlineScale] = useState(1.05);

  // POI 클릭 핸들러를 ref로 저장 (의존성 배열 문제 방지)
  const onPOIClickRef = useRef(onPOIClick);
  const onPOIHoverRef = useRef(onPOIHover);
  onPOIClickRef.current = onPOIClick;
  onPOIHoverRef.current = onPOIHover;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 기존 SVG 제거
    d3.select(container).select("svg").remove();

    // SVG 생성 (배경은 컨테이너에) - 이동/줌 비활성화
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "transparent")
      .style("position", "relative")
      .style("z-index", "1")
      .style("pointer-events", "none"); // 지도 자체 이벤트 비활성화

    svgRef.current = svg;

    // 그림자 필터 정의
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

    // 본토 그룹
    const mainGroup = svg.append("g").attr("class", "main-group");
    const mainShadowGroup = mainGroup.append("g").attr("class", "shadow-layer");
    const mainMapGroup = mainGroup.append("g").attr("class", "map-layer");

    // 제주도 인셋 그룹 (나중에 위치 계산 후 추가)
    const jejuInset = svg.append("g").attr("class", "jeju-inset");
    const jejuShadowGroup = jejuInset.append("g").attr("class", "jeju-shadow");
    const jejuMapGroup = jejuInset.append("g").attr("class", "jeju-map");

    // POI 그룹 (최상위에 렌더링)
    svg.append("g").attr("class", "poi-layer").style("pointer-events", "all");

    // rem to px 변환 (UHD 대응)
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    // 해안선 스케일 (rootFontSize 비례)
    setCoastlineScale(1.05 * (rootFontSize / 16));

    // 본토 프로젝션 (제주도 제외, 화면에 꽉 차게)
    // FHD(1080p) 기준으로 스케일 고정, 모든 해상도에서 동일한 비율 유지
    const baseScale = MAP_SETTINGS.referenceHeight * MAP_SETTINGS.scaleFactor * rootFontSize;

    const mainProjection = d3
      .geoMercator()
      .center([MAP_SETTINGS.centerLng, MAP_SETTINGS.centerLat])
      .scale(baseScale)
      .translate([
        width / 2 + MAP_SETTINGS.translateXOffset * rootFontSize,
        height / 2 + MAP_SETTINGS.translateYOffset * rootFontSize,
      ]);

    mainProjectionRef.current = mainProjection;
    const mainPath = d3.geoPath().projection(mainProjection);

    // GeoJSON 로드
    setIsLoading(true);
    d3.json<SidoFeatureCollection>(SIDO_GEOJSON_PATH)
      .then((data) => {
        if (!data) return;

        // 본토와 제주도 분리
        const mainlandFeatures = data.features.filter((f) => f.properties.sido !== JEJU_CODE);
        const jejuFeatures = data.features.filter((f) => f.properties.sido === JEJU_CODE);

        // === 본토 렌더링 ===
        // 그림자 레이어 (rem 기반)
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

        // 지도 레이어 (이벤트 없음)
        mainMapGroup
          .selectAll<SVGPathElement, SidoFeature>("path")
          .data(mainlandFeatures)
          .enter()
          .append("path")
          .attr("class", "region")
          .attr("d", (d) => mainPath(d) ?? "")
          .attr("fill", (d) => getColorBySidoCode(d.properties.sido))
          .attr("stroke", STROKE_COLOR)
          .attr("stroke-width", 0.0625 * rootFontSize)
          .style("pointer-events", "none"); // 지역 클릭 비활성화

        // === 본토 bounds 계산 후 제주도 인셋 위치 결정 ===
        const mainBounds = mainMapGroup.node()?.getBBox();
        const jejuInsetWidth = 11.25 * rootFontSize; // 11.25rem
        const jejuInsetHeight = 7.5 * rootFontSize; // 7.5rem
        const jejuInsetX = mainBounds
          ? mainBounds.x + mainBounds.width - jejuInsetWidth + 2 * rootFontSize
          : width - jejuInsetWidth - 1.25 * rootFontSize;
        const jejuInsetY = mainBounds
          ? mainBounds.y + mainBounds.height - 6 * rootFontSize
          : height - jejuInsetHeight - 1.25 * rootFontSize; // 2rem 아래로

        // 인셋 배경 (제주도 뒤에)
        const jejuBgRect = jejuInset
          .append("rect")
          .attr("x", jejuInsetX - 0.75 * rootFontSize)
          .attr("y", jejuInsetY - 0.5 * rootFontSize)
          .attr("width", jejuInsetWidth + 1.5 * rootFontSize)
          .attr("height", jejuInsetHeight + 1.25 * rootFontSize)
          .attr("rx", 0.625 * rootFontSize)
          .attr("fill", "rgba(174, 192, 224, 0.3)");
        jejuBgRect.lower(); // 맨 뒤로 보내기

        // 인셋 라벨
        jejuInset
          .append("text")
          .attr("x", jejuInsetX + jejuInsetWidth / 2)
          .attr("y", jejuInsetY + 0.75 * rootFontSize)
          .attr("text-anchor", "middle")
          .attr("fill", "#666")
          .attr("font-size", `${0.75 * rootFontSize}px`)
          .text("제주특별자치도");

        // 제주도 프로젝션 (인셋용) - 스케일도 rootFontSize 비례
        const jejuScale = 468.75 * rootFontSize; // 7500 / 16 = 468.75
        const jejuProjection = d3
          .geoMercator()
          .center([126.5, 33.38])
          .scale(jejuScale)
          .translate([
            jejuInsetX + jejuInsetWidth / 2,
            jejuInsetY + jejuInsetHeight / 2 + 0.9375 * rootFontSize,
          ]);

        const jejuPath = d3.geoPath().projection(jejuProjection);

        // === 제주도 인셋 렌더링 ===
        // 그림자 레이어 (rem 기반)
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

        // 지도 레이어 (이벤트 없음)
        jejuMapGroup
          .selectAll<SVGPathElement, SidoFeature>("path")
          .data(jejuFeatures)
          .enter()
          .append("path")
          .attr("class", "region")
          .attr("d", (d) => jejuPath(d) ?? "")
          .attr("fill", (d) => getColorBySidoCode(d.properties.sido))
          .attr("stroke", STROKE_COLOR)
          .attr("stroke-width", 0.05 * rootFontSize)
          .style("pointer-events", "none"); // 지역 클릭 비활성화

        // 제주 프로젝션 저장
        jejuProjectionRef.current = jejuProjection;

        // 줌/이동 비활성화 (아무것도 하지 않음)

        setIsLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Failed to load GeoJSON:", error);
        setIsLoading(false);
      });

    // 리사이즈 핸들러
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
      d3.select(container).select("svg").remove();
    };
  }, []); // 지도 초기화는 한 번만

  // POI 렌더링 (pois 변경 시 업데이트)
  useEffect(() => {
    const svg = svgRef.current;
    const mainProjection = mainProjectionRef.current;
    const jejuProjection = jejuProjectionRef.current;

    if (!svg || !mainProjection) return;

    const poiLayer = svg.select<SVGGElement>(".poi-layer");
    if (poiLayer.empty()) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    // 기존 POI 제거
    poiLayer.selectAll("*").remove();

    // POI 렌더링
    pois.forEach((poi) => {
      // 제주도인지 본토인지 판단 (위도 34.0 이하이고 경도 125.5-127.5 사이면 제주도)
      const isJeju = poi.latitude < 34.0 && poi.longitude >= 125.5 && poi.longitude <= 127.5;
      const projection = isJeju && jejuProjection ? jejuProjection : mainProjection;

      const coords = projection([poi.longitude, poi.latitude]);
      if (!coords) return;

      const [x, y] = coords;
      const size = poi.size ?? 1;
      const scale = (size * rootFontSize) / POINT_MARKER_HEIGHT; // 마커 높이 기준 스케일
      const color = poi.color ?? "#4D7EFF";

      // 마커 중심점 오프셋 (마커 하단 뾰족한 부분이 좌표에 위치하도록)
      const offsetX = (POINT_MARKER_WIDTH / 2) * scale;
      const offsetY = POINT_MARKER_HEIGHT * scale;

      const poiGroup = poiLayer
        .append("g")
        .attr("class", "poi")
        .attr("data-poi-id", poi.id)
        .attr("transform", `translate(${x - offsetX}, ${y - offsetY}) scale(${scale})`)
        .style("cursor", "pointer");

      // POI 마커 (핀 모양)
      poiGroup
        .append("path")
        .attr("d", POINT_MARKER_PATH)
        .attr("fill", color)
        .attr("filter", "url(#poi-shadow)");

      // 내부 흰색 원
      poiGroup
        .append("circle")
        .attr("cx", 14.5)
        .attr("cy", 12.5)
        .attr("r", 6.5)
        .attr("fill", "white");

      // POI 이벤트
      poiGroup
        .on("mouseenter", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr(
              "transform",
              `translate(${x - offsetX * 1.15}, ${y - offsetY * 1.15}) scale(${scale * 1.15})`
            );
          onPOIHoverRef.current?.(poi);
        })
        .on("mouseleave", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("transform", `translate(${x - offsetX}, ${y - offsetY}) scale(${scale})`);
          onPOIHoverRef.current?.(null);
        })
        .on("click", function (event: MouseEvent) {
          event.stopPropagation();
          // 클릭 리플 효과
          createPOIRipple(poiLayer, x, y, color, rootFontSize);
          onPOIClickRef.current?.(poi);
        });

      // 라벨 (있는 경우)
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
  }, [pois]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        background: "linear-gradient(135deg, #E8EEF5 0%, #DCE4ED 100%)",
      }}
    >
      {/* 해안선 아웃라인 배경 - 지도 뒤에 배치 (z-index: 0) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        style={{
          transform: `translate(-8rem, 2.875rem) scale(${coastlineScale})`,
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

// POI 클릭 리플 효과 함수
function createPOIRipple(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
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
    .ease(d3.easeQuadOut)
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
    .ease(d3.easeQuadOut)
    .attr("r", 2 * rootFontSize)
    .attr("opacity", 0)
    .on("end", function () {
      rippleGroup.remove();
    });
}
