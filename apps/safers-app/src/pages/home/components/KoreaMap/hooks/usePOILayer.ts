import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import "d3-transition";
import type { GeoProjection } from "d3-geo";
import type { SVGSelection, SVGGroupSelection, POI, POICoords, ProjectedPOI } from "../types";
import { MAP_COLORS, POI_MARKER, CLUSTER_CONFIG } from "../constants";
import {
  projectCoords,
  createPulseRipple,
  showPOIInfo,
  clearPOIInfo,
  clusterPOIs,
  renderClusterMarker,
  showClusterDropdown,
  clearClusterDropdown,
} from "../utils";
import { useSitesStore, selectSelectedSiteId, selectStatusFilter } from "@/stores";

/** 페이지 가시성 상태를 React 상태로 관리하는 훅 */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(!document.hidden);

  useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return visible;
}

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
  const isPageVisible = usePageVisible();
  const pulsePOIsRef = useRef<{ x: number; y: number; color: string }[]>([]);
  const clustersRef = useRef<import("../types").POICluster[]>([]);
  const explodedPoiIdsRef = useRef<Set<string>>(new Set());
  const prevExplodedRef = useRef<{ ids: Set<string>; centroid: { x: number; y: number } } | null>(
    null
  );
  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const onPOIClickRef = useRef(onPOIClick);
  const onPOIHoverRef = useRef(onPOIHover);
  const onSelectSiteRef = useRef(onSelectSite);

  useEffect(() => {
    onPOIClickRef.current = onPOIClick;
    onPOIHoverRef.current = onPOIHover;
    onSelectSiteRef.current = onSelectSite;
  }, [onPOIClick, onPOIHover, onSelectSite]);

  // POI 마커 렌더링 (project → cluster → render)
  useEffect(() => {
    const svg = svgRef.current;
    const mainProjection = mainProjectionRef.current;
    const jejuProjection = jejuProjectionRef.current;

    if (!svg || !mainProjection) return;

    const poiLayer = svg.select<SVGGElement>(".poi-layer");
    const rippleLayer = svg.select<SVGGElement>(".ripple-layer");
    const poiInfoLayer = svg.select<SVGGElement>(".poi-info-layer");
    if (poiLayer.empty() || rippleLayer.empty()) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const selectedIdStr = selectedSiteId != null ? String(selectedSiteId) : null;

    poiLayer.selectAll("*").remove();
    rippleLayer.selectAll("*").remove();
    renderPOIScene();

    function renderPOIScene() {
      // 이전 explode 상태 캡처 (애니메이션 판단용)
      const prevExploded = prevExplodedRef.current;

      // Pass 1: 모든 POI 투영
      const allProjected: ProjectedPOI[] = [];

      pois.forEach((poi) => {
        const coords = projectCoords(poi.longitude, poi.latitude, mainProjection!, jejuProjection);
        if (!coords) return;
        allProjected.push({ poi, x: coords[0], y: coords[1] });
      });

      // 선택된 POI가 속한 클러스터를 찾아서 해제 (explode)
      const tempClusters = clusterPOIs(
        allProjected,
        (CLUSTER_CONFIG.distancePx * rootFontSize) / 16
      );

      if (selectedIdStr) {
        const clusterWithSelected = tempClusters.find(
          (c) => !c.isSingle && c.pois.some((p) => p.poi.id === selectedIdStr)
        );
        if (clusterWithSelected) {
          explodedPoiIdsRef.current = new Set(clusterWithSelected.pois.map((p) => p.poi.id));
          // 복귀 애니메이션을 위해 centroid 저장
          prevExplodedRef.current = {
            ids: new Set(clusterWithSelected.pois.map((p) => p.poi.id)),
            centroid: { x: clusterWithSelected.cx, y: clusterWithSelected.cy },
          };
        } else {
          explodedPoiIdsRef.current = new Set();
        }
      } else {
        explodedPoiIdsRef.current = new Set();
      }

      // Pass 2: explode된 POI는 클러스터링에서 제외
      const explodedIds = explodedPoiIdsRef.current;
      const toCluster = allProjected.filter((p) => !explodedIds.has(p.poi.id));
      const explodedPois = allProjected.filter((p) => explodedIds.has(p.poi.id));

      const clusters = clusterPOIs(toCluster, (CLUSTER_CONFIG.distancePx * rootFontSize) / 16);

      // Pass 3: 렌더링
      const pulsePOIs: { x: number; y: number; color: string }[] = [];

      clusters.forEach((cluster) => {
        if (cluster.isSingle) {
          const p = cluster.pois[0]!;
          const poiCoords = calculatePOICoords(p.poi, [p.x, p.y], rootFontSize);
          renderPOIMarker(poiLayer, p.poi, poiCoords);
          bindPOIEvents(poiLayer, p.poi, poiCoords, rootFontSize, {
            onHover: onPOIHoverRef,
            onClick: onPOIClickRef,
            onSelectSite: onSelectSiteRef,
            rippleLayer,
          });

          if (p.poi.label) {
            renderPOILabel(poiLayer, p.poi.label, poiCoords.x, poiCoords.y, rootFontSize);
          }

          const status = p.poi.data?.status as string | undefined;
          if (status === "warning" || status === "danger") {
            pulsePOIs.push({ x: poiCoords.x, y: poiCoords.y, color: poiCoords.color });
          }
        } else {
          // 이전에 explode 상태에서 복귀하는 클러스터인지 확인
          const wasExploded =
            prevExploded != null && cluster.pois.some((p) => prevExploded.ids.has(p.poi.id));
          renderClusterMarker(poiLayer, cluster, rootFontSize, wasExploded);
          bindClusterEvents(poiLayer, poiInfoLayer, cluster, rootFontSize, {
            onSelectSite: onSelectSiteRef,
          });

          // 모이는 애니메이션: 이전 위치에서 클러스터 중심으로 이동하는 고스트 마커
          if (wasExploded && prevExploded) {
            allProjected
              .filter((p) => prevExploded.ids.has(p.poi.id))
              .forEach((p) => {
                const ghostScale = ((p.poi.size ?? 1) * rootFontSize) / POI_MARKER.height;
                const ghostOffsetX = (POI_MARKER.width / 2) * ghostScale;
                const ghostOffsetY = POI_MARKER.height * ghostScale;
                const targetScale = ghostScale * 0.3;
                const targetOffsetX = (POI_MARKER.width / 2) * targetScale;
                const targetOffsetY = POI_MARKER.height * targetScale;

                const ghost = poiLayer
                  .append("g")
                  .attr("class", "poi-ghost")
                  .attr(
                    "transform",
                    `translate(${p.x - ghostOffsetX}, ${p.y - ghostOffsetY}) scale(${ghostScale})`
                  )
                  .style("opacity", 0.6)
                  .style("pointer-events", "none");

                ghost
                  .append("path")
                  .attr("d", POI_MARKER.path)
                  .attr("fill", p.poi.color ?? MAP_COLORS.defaultPOI);

                ghost
                  .append("circle")
                  .attr("cx", POI_MARKER.anchorX)
                  .attr("cy", POI_MARKER.anchorY)
                  .attr("r", POI_MARKER.innerRadius)
                  .attr("fill", "white");

                ghost
                  .transition()
                  .duration(500)
                  .attr(
                    "transform",
                    `translate(${cluster.cx - targetOffsetX}, ${cluster.cy - targetOffsetY}) scale(${targetScale})`
                  )
                  .style("opacity", 0)
                  .remove();
              });
          }

          if (cluster.worstStatus) {
            const color = cluster.worstStatus === "danger" ? "#DE4545" : "#FFA26B";
            pulsePOIs.push({ x: cluster.cx, y: cluster.cy, color });
          }
        }
      });

      // explode된 POI 개별 렌더링 (클러스터 중심에서 실제 위치로 펼쳐지는 애니메이션)
      const clusterCentroid = prevExplodedRef.current?.centroid;
      explodedPois.forEach((p) => {
        const poiCoords = calculatePOICoords(p.poi, [p.x, p.y], rootFontSize);
        if (p.poi.id !== selectedIdStr) {
          renderPOIMarker(poiLayer, p.poi, poiCoords);

          // 클러스터 중심에서 시작하여 실제 위치로 이동하는 애니메이션
          if (clusterCentroid) {
            const startScale = poiCoords.scale * 0.4;
            const startOffsetX = (POI_MARKER.width / 2) * startScale;
            const startOffsetY = POI_MARKER.height * startScale;
            const marker = poiLayer.select(`[data-poi-id="${p.poi.id}"]`);
            marker
              .attr(
                "transform",
                `translate(${clusterCentroid.x - startOffsetX}, ${clusterCentroid.y - startOffsetY}) scale(${startScale})`
              )
              .style("opacity", 0.3)
              .transition()
              .duration(600)
              .attr(
                "transform",
                `translate(${p.x - poiCoords.offsetX}, ${p.y - poiCoords.offsetY}) scale(${poiCoords.scale})`
              )
              .style("opacity", 1);
          }

          bindPOIEvents(poiLayer, p.poi, poiCoords, rootFontSize, {
            onHover: onPOIHoverRef,
            onClick: onPOIClickRef,
            onSelectSite: onSelectSiteRef,
            rippleLayer,
          });
        }

        const status = p.poi.data?.status as string | undefined;
        if (status === "warning" || status === "danger") {
          pulsePOIs.push({ x: poiCoords.x, y: poiCoords.y, color: poiCoords.color });
        }
      });

      // 선택된 POI는 최상단에 렌더
      const selectedItem = allProjected.find((p) => p.poi.id === selectedIdStr);
      if (selectedItem) {
        const poiCoords = calculatePOICoords(
          selectedItem.poi,
          [selectedItem.x, selectedItem.y],
          rootFontSize
        );
        renderPOIMarker(poiLayer, selectedItem.poi, poiCoords);
        bindPOIEvents(poiLayer, selectedItem.poi, poiCoords, rootFontSize, {
          onHover: onPOIHoverRef,
          onClick: onPOIClickRef,
          onSelectSite: onSelectSiteRef,
          rippleLayer,
        });
      }

      pulsePOIsRef.current = pulsePOIs;
      clustersRef.current = clusters;
    }
  }, [pois, selectedSiteId, svgRef, mainProjectionRef, jejuProjectionRef]);

  // 펄스 애니메이션 — 페이지 비활성 시 자동 정지, 활성 시 재시작
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !isPageVisible || pulsePOIsRef.current.length === 0) return;

    const rippleLayer = svg.select<SVGGElement>(".ripple-layer");
    if (rippleLayer.empty()) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const targets = pulsePOIsRef.current;

    const pulse = () => {
      targets.forEach(({ x, y, color }) => {
        createPulseRipple(rippleLayer, x, y, color, rootFontSize);
      });
    };

    pulse();
    const intervalId = window.setInterval(pulse, 2000);

    return () => {
      clearInterval(intervalId);
      rippleLayer.selectAll(".pulse-ripple").remove();
    };
  }, [isPageVisible, pois, svgRef]);

  // statusFilter 변경 시 POI/클러스터 opacity 업데이트
  const statusFilter = useSitesStore(selectStatusFilter);
  const prevStatusFilterRef = useRef(statusFilter);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const poiLayer = svg.select<SVGGElement>(".poi-layer");
    const poiInfoLayer = svg.select<SVGGElement>(".poi-info-layer");
    if (poiLayer.empty()) return;

    // statusFilter가 실제로 변경된 경우에만 팝오버/드롭다운 닫기
    if (prevStatusFilterRef.current !== statusFilter && !poiInfoLayer.empty()) {
      clearPOIInfo(poiInfoLayer);
      clearClusterDropdown(poiInfoLayer);
    }
    prevStatusFilterRef.current = statusFilter;

    // 필터 없으면 모두 보이기
    if (!statusFilter) {
      poiLayer.selectAll(".poi").transition().duration(200).style("opacity", 1);
      poiLayer.selectAll(".poi-cluster").transition().duration(200).style("opacity", 1);
      poiLayer.selectAll(".poi-label").transition().duration(200).style("opacity", 1);
      return;
    }

    // 개별 POI
    poiLayer.selectAll<SVGGElement, unknown>(".poi").each(function () {
      const el = select(this);
      const poiId = el.attr("data-poi-id");
      const poi = pois.find((p) => p.id === poiId);
      const poiStatus = (poi?.data?.status as string) ?? "normal";
      const matches = poiStatus === statusFilter;
      el.transition()
        .duration(200)
        .style("opacity", matches ? 1 : 0.15);
    });

    // 클러스터
    poiLayer.selectAll<SVGGElement, unknown>(".poi-cluster").each(function () {
      const el = select(this);
      const clusterId = el.attr("data-cluster-id");
      const cluster = clustersRef.current.find((c) => c.id === clusterId);
      const hasMatchingPOI = cluster?.pois.some((p) => {
        const s = (p.poi.data?.status as string) ?? "normal";
        return s === statusFilter;
      });
      el.transition()
        .duration(200)
        .style("opacity", hasMatchingPOI ? 1 : 0.15);
    });

    // 라벨
    poiLayer
      .selectAll<SVGGElement, unknown>(".poi-label")
      .transition()
      .duration(200)
      .style("opacity", 0.15);
  }, [statusFilter, pois, svgRef]);
}

interface UseSelectedPOIOptions {
  svgRef: React.MutableRefObject<SVGSelection | null>;
  mainProjectionRef: React.MutableRefObject<GeoProjection | null>;
  jejuProjectionRef: React.MutableRefObject<GeoProjection | null>;
  pois: POI[];
  selectedSiteId: string | null;
  onPOISiteClick?: (poi: POI) => void;
  onPOICctvAIClick?: (poi: POI) => void;
}

/** 선택된 POI 시각 업데이트를 담당하는 훅 */
export function useSelectedPOI({
  svgRef,
  mainProjectionRef,
  jejuProjectionRef,
  pois,
  selectedSiteId,
  onPOISiteClick,
  onPOICctvAIClick,
}: UseSelectedPOIOptions): void {
  const prevSelectedSiteIdRef = useRef<string | null>(null);
  const onPOISiteClickRef = useRef(onPOISiteClick);
  const onPOICctvAIClickRef = useRef(onPOICctvAIClick);

  useEffect(() => {
    onPOISiteClickRef.current = onPOISiteClick;
    onPOICctvAIClickRef.current = onPOICctvAIClick;
  }, [onPOISiteClick, onPOICctvAIClick]);

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
      clearClusterDropdown(poiInfoLayer);
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
    const isReHighlight = selectedSiteId === prevId;
    highlightSelectedPOI(poiLayer, selectedSiteId, poiCoords, isReHighlight);

    // 같은 siteId에 대해 팝오버가 이미 있으면 재생성하지 않음 (pois 변경 시 깜빡임 방지)
    if (selectedSiteId !== prevId) {
      clearPOIInfo(poiInfoLayer);
      clearClusterDropdown(poiInfoLayer);
      const siteName = (poiData.data?.name as string) ?? poiData.id;
      showPOIInfo(poiInfoLayer, poiCoords.x, poiCoords.y, siteName, rootFontSize, {
        onSiteClick: () => onPOISiteClickRef.current?.(poiData),
        onCctvAIClick: () => onPOICctvAIClickRef.current?.(poiData),
      });
    }

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
  onSelectSite: React.MutableRefObject<(siteId: string | null) => void>;
  rippleLayer: SVGGroupSelection;
}

/** POI 이벤트 바인딩 */
function bindPOIEvents(
  layer: SVGGroupSelection,
  poi: POI,
  coords: POICoords,
  _rootFontSize: number,
  handlers: POIEventHandlers
): void {
  const { x, y, scale, offsetX, offsetY } = coords;
  const poiGroup = layer.select(`[data-poi-id="${poi.id}"]`);

  poiGroup
    .on("mouseenter", function () {
      const currentSelected = useSitesStore.getState().selectedSiteId;
      if (String(currentSelected) !== poi.id) {
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
      if (String(currentSelected) !== poi.id) {
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
      handlers.onSelectSite.current(String(currentSelected) === poi.id ? null : poi.id);
      handlers.onClick.current?.(poi);
    });
}

interface ClusterEventHandlers {
  onSelectSite: React.MutableRefObject<(siteId: string | null) => void>;
}

/** 클러스터 이벤트 바인딩 */
function bindClusterEvents(
  layer: SVGGroupSelection,
  poiInfoLayer: SVGGroupSelection,
  cluster: import("../types").POICluster,
  rootFontSize: number,
  handlers: ClusterEventHandlers
): void {
  const group = layer.select(`[data-cluster-id="${cluster.id}"]`);

  group
    .on("mouseenter", function () {
      select(this)
        .transition()
        .duration(150)
        .attr("transform", `translate(${cluster.cx}, ${cluster.cy}) scale(1.1)`);
    })
    .on("mouseleave", function () {
      select(this)
        .transition()
        .duration(150)
        .attr("transform", `translate(${cluster.cx}, ${cluster.cy}) scale(1)`);
    })
    .on("click", (event: MouseEvent) => {
      event.stopPropagation();
      clearPOIInfo(poiInfoLayer);
      clearClusterDropdown(poiInfoLayer);
      showClusterDropdown(poiInfoLayer, cluster, rootFontSize, {
        onSelectSite: (poiId) => handlers.onSelectSite.current(poiId),
      });
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

/** POI 시각 상태 초기화 */
function resetPOIVisual(layer: SVGGroupSelection, poiId: string): void {
  const prevPoi = layer.select(`[data-poi-id="${poiId}"]`);
  if (prevPoi.empty()) return;

  const originalTransform = prevPoi.attr("data-original-transform");
  const originalColor = prevPoi.attr("data-original-color");

  if (!originalTransform) return;

  prevPoi
    .transition()
    .duration(200)
    .attr("transform", originalTransform)
    .select("path")
    .attr("fill", originalColor ?? MAP_COLORS.defaultPOI);
}

/** 선택된 POI 하이라이트 (skipTransition=true면 트랜지션 없이 즉시 적용) */
function highlightSelectedPOI(
  layer: SVGGroupSelection,
  poiId: string,
  coords: POICoords,
  skipTransition = false
): void {
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

  newPoi.raise();

  const selectedTransform = `translate(${x - selectedOffsetX}, ${y - selectedOffsetY}) scale(${selectedScale})`;

  if (skipTransition) {
    newPoi.attr("transform", selectedTransform).select("path").attr("fill", MAP_COLORS.brand);
  } else {
    newPoi
      .transition()
      .duration(200)
      .attr("transform", selectedTransform)
      .select("path")
      .attr("fill", MAP_COLORS.brand);
  }
}
