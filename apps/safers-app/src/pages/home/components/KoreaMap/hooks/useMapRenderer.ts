import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import { json } from "d3-fetch";
import type { GeoProjection } from "d3-geo";
import type {
  SVGSelection,
  SVGGroupSelection,
  SidoFeatureCollection,
  SidoFeature,
  MapRendererResult,
} from "../types";
import { SIDO_GEOJSON_PATH, JEJU_CODE, MAP_COLORS, SVG_FILTERS } from "../constants";
import { createMainProjection, createJejuProjection, createGeoPath } from "../utils";

interface UseMapRendererOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onBackgroundClick?: () => void;
}

/** 지도 SVG 초기화 및 GeoJSON 렌더링을 담당하는 훅 */
export function useMapRenderer({
  containerRef,
  onBackgroundClick,
}: UseMapRendererOptions): MapRendererResult {
  const svgRef = useRef<SVGSelection | null>(null);
  const mainProjectionRef = useRef<GeoProjection | null>(null);
  const jejuProjectionRef = useRef<GeoProjection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const rootFontSizeRef = useRef(16);

  const onBackgroundClickRef = useRef(onBackgroundClick);

  useEffect(() => {
    onBackgroundClickRef.current = onBackgroundClick;
  }, [onBackgroundClick]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

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
      .on("click", () => onBackgroundClickRef.current?.());

    svg.append("defs").html(SVG_FILTERS);

    const mainGroup = svg.append("g").attr("class", "main-group");
    const mainShadowGroup = mainGroup.append("g").attr("class", "shadow-layer");
    const mainMapGroup = mainGroup.append("g").attr("class", "map-layer");

    const jejuInset = svg.append("g").attr("class", "jeju-inset");
    const jejuShadowGroup = jejuInset.append("g").attr("class", "jeju-shadow");
    const jejuMapGroup = jejuInset.append("g").attr("class", "jeju-map");

    svg.append("g").attr("class", "ripple-layer").style("pointer-events", "none");
    svg.append("g").attr("class", "poi-layer").style("pointer-events", "all");
    svg.append("g").attr("class", "poi-info-layer").style("pointer-events", "none");

    rootFontSizeRef.current = rootFontSize;

    const mainProjection = createMainProjection({ width, height, rootFontSize });
    mainProjectionRef.current = mainProjection;
    const mainPath = createGeoPath(mainProjection);

    setIsLoading(true);
    json<SidoFeatureCollection>(SIDO_GEOJSON_PATH)
      .then((data) => {
        if (!data) return;

        const mainlandFeatures = data.features.filter((f) => f.properties.sido !== JEJU_CODE);
        const jejuFeatures = data.features.filter((f) => f.properties.sido === JEJU_CODE);

        renderMainland(mainShadowGroup, mainMapGroup, mainlandFeatures, mainPath, rootFontSize);

        const mainBounds = mainMapGroup.node()?.getBBox();
        const jejuConfig = calculateJejuInsetPosition(mainBounds, width, height, rootFontSize);

        renderJejuInset(jejuInset, jejuConfig, rootFontSize);

        const jejuProjection = createJejuProjection({
          insetX: jejuConfig.x,
          insetY: jejuConfig.y,
          insetWidth: jejuConfig.width,
          insetHeight: jejuConfig.height,
          rootFontSize,
        });
        jejuProjectionRef.current = jejuProjection;

        const jejuPath = createGeoPath(jejuProjection);
        renderJejuMap(jejuShadowGroup, jejuMapGroup, jejuFeatures, jejuPath, rootFontSize);

        setIsLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Failed to load GeoJSON:", error);
        setIsLoading(false);
      });

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      select(container).select("svg").remove();
    };
  }, [containerRef]);

  const coastlineScale = useMemo(
    () => 1.05 * (rootFontSizeRef.current / 16),
    // isLoading이 false가 되면 rootFontSizeRef.current가 설정된 후이므로 올바른 값 반환
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  );

  return {
    svgRef,
    mainProjectionRef,
    jejuProjectionRef,
    isLoading,
    coastlineScale,
  };
}

/** 본토 지도 렌더링 */
function renderMainland(
  shadowGroup: SVGGroupSelection,
  mapGroup: SVGGroupSelection,
  features: SidoFeature[],
  path: ReturnType<typeof createGeoPath>,
  rootFontSize: number
): void {
  shadowGroup
    .selectAll<SVGPathElement, SidoFeature>("path")
    .data(features)
    .enter()
    .append("path")
    .attr("d", (d) => path(d) ?? "")
    .attr("fill", MAP_COLORS.shadow)
    .attr("transform", `translate(${0.5 * rootFontSize}, ${0.75 * rootFontSize})`)
    .style("opacity", 0.6)
    .style("filter", `blur(${0.625 * rootFontSize}px)`);

  mapGroup
    .selectAll<SVGPathElement, SidoFeature>("path")
    .data(features)
    .enter()
    .append("path")
    .attr("class", "region")
    .attr("d", (d) => path(d) ?? "")
    .attr("fill", MAP_COLORS.region)
    .attr("stroke", MAP_COLORS.stroke)
    .attr("stroke-width", 0.0625 * rootFontSize)
    .style("pointer-events", "none");
}

interface JejuInsetConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 제주 인셋 위치 계산 */
function calculateJejuInsetPosition(
  mainBounds: DOMRect | undefined,
  containerWidth: number,
  containerHeight: number,
  rootFontSize: number
): JejuInsetConfig {
  const width = 9 * rootFontSize;
  const height = 5.5 * rootFontSize;

  const x = mainBounds
    ? mainBounds.x + mainBounds.width - width + 3 * rootFontSize
    : containerWidth - width - 0.25 * rootFontSize;

  const y = mainBounds
    ? mainBounds.y + mainBounds.height - 4.5 * rootFontSize
    : containerHeight - height - 1.25 * rootFontSize;

  return { x, y, width, height };
}

/** 제주 인셋 배경 및 라벨 렌더링 */
function renderJejuInset(
  jejuInset: SVGGroupSelection,
  config: JejuInsetConfig,
  rootFontSize: number
): void {
  const bgRect = jejuInset
    .append("rect")
    .attr("x", config.x - 0.75 * rootFontSize)
    .attr("y", config.y - 0.5 * rootFontSize)
    .attr("width", config.width + 1.5 * rootFontSize)
    .attr("height", config.height + 1.25 * rootFontSize)
    .attr("rx", 0.625 * rootFontSize)
    .attr("fill", "rgba(174, 192, 224, 0.3)");
  bgRect.lower();

  jejuInset
    .append("text")
    .attr("x", config.x + config.width / 2)
    .attr("y", config.y + 0.625 * rootFontSize)
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .attr("font-size", `${0.625 * rootFontSize}px`)
    .text("제주특별자치도");
}

/** 제주 지도 렌더링 */
function renderJejuMap(
  shadowGroup: SVGGroupSelection,
  mapGroup: SVGGroupSelection,
  features: SidoFeature[],
  path: ReturnType<typeof createGeoPath>,
  rootFontSize: number
): void {
  shadowGroup
    .selectAll<SVGPathElement, SidoFeature>("path")
    .data(features)
    .enter()
    .append("path")
    .attr("d", (d) => path(d) ?? "")
    .attr("fill", MAP_COLORS.shadow)
    .attr("transform", `translate(${0.375 * rootFontSize}, ${0.5 * rootFontSize})`)
    .style("opacity", 0.5)
    .style("filter", `blur(${0.4 * rootFontSize}px)`);

  mapGroup
    .selectAll<SVGPathElement, SidoFeature>("path")
    .data(features)
    .enter()
    .append("path")
    .attr("class", "region")
    .attr("d", (d) => path(d) ?? "")
    .attr("fill", MAP_COLORS.region)
    .attr("stroke", MAP_COLORS.stroke)
    .attr("stroke-width", 0.05 * rootFontSize)
    .style("pointer-events", "none");
}
