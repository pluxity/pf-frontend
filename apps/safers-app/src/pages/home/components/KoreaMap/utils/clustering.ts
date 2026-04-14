import { select } from "d3-selection";
import "d3-transition";
import type { SVGGroupSelection, ProjectedPOI, POICluster } from "../types";
import { MAP_COLORS, CLUSTER_CONFIG } from "../constants";

const STATUS_PRIORITY: Record<string, number> = { danger: 2, warning: 1 };

/** 투영된 POI들을 거리 기반으로 클러스터링 */
export function clusterPOIs(projected: ProjectedPOI[], distancePx: number): POICluster[] {
  const unassigned = [...projected];
  const clusters: POICluster[] = [];

  while (unassigned.length > 0) {
    const seed = unassigned.shift()!;
    const members: ProjectedPOI[] = [seed];
    let cx = seed.x;
    let cy = seed.y;

    let i = 0;
    while (i < unassigned.length) {
      const candidate = unassigned[i]!;
      const dx = candidate.x - cx;
      const dy = candidate.y - cy;
      if (Math.sqrt(dx * dx + dy * dy) <= distancePx) {
        members.push(candidate);
        unassigned.splice(i, 1);
        // 센트로이드 재계산
        cx = members.reduce((s, m) => s + m.x, 0) / members.length;
        cy = members.reduce((s, m) => s + m.y, 0) / members.length;
        i = 0; // 새 멤버 추가 후 처음부터 다시 검사
      } else {
        i++;
      }
    }

    let worstStatus: "danger" | "warning" | null = null;
    let worstPriority = 0;
    for (const m of members) {
      const status = m.poi.data?.status as string | undefined;
      const p = status ? (STATUS_PRIORITY[status] ?? 0) : 0;
      if (p > worstPriority) {
        worstPriority = p;
        worstStatus = status as "danger" | "warning";
      }
    }

    clusters.push({
      id: members.length === 1 ? members[0]!.poi.id : `cluster-${members[0]!.poi.id}`,
      pois: members,
      cx,
      cy,
      isSingle: members.length === 1,
      worstStatus,
    });
  }

  return clusters;
}

/** 클러스터에 사용할 색상 반환 */
function getClusterColor(cluster: POICluster): string {
  if (cluster.worstStatus === "danger") return "#DE4545";
  if (cluster.worstStatus === "warning") return "#FFA26B";
  return MAP_COLORS.defaultPOI;
}

/** 클러스터 마커 렌더링 (원형 + 숫자) */
export function renderClusterMarker(
  layer: SVGGroupSelection,
  cluster: POICluster,
  rootFontSize: number
): void {
  const r = CLUSTER_CONFIG.radius * rootFontSize;
  const color = getClusterColor(cluster);

  const group = layer
    .append("g")
    .attr("class", "poi-cluster")
    .attr("data-cluster-id", cluster.id)
    .attr("transform", `translate(${cluster.cx}, ${cluster.cy})`)
    .style("cursor", "pointer");

  // 외곽 원 (그림자)
  group
    .append("circle")
    .attr("r", r + 2)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("opacity", 0.3);

  // 메인 원
  group
    .append("circle")
    .attr("class", "cluster-circle")
    .attr("r", r)
    .attr("fill", color)
    .attr("filter", "url(#poi-shadow)");

  // 카운트 숫자
  group
    .append("text")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", `${0.75 * rootFontSize}px`)
    .attr("font-weight", "700")
    .style("pointer-events", "none")
    .text(cluster.pois.length);
}

/** 클러스터 드롭다운 팝오버 표시 */
export function showClusterDropdown(
  layer: SVGGroupSelection,
  cluster: POICluster,
  rootFontSize: number,
  handlers: {
    onSelectSite: (poiId: string) => void;
  }
): void {
  clearClusterDropdown(layer);

  const infoGroup = layer.append("g").attr("class", "cluster-dropdown");

  const rowHeight = 1.75 * rootFontSize;
  const padX = 0.5 * rootFontSize;
  const padY = 0.375 * rootFontSize;
  const dotRadius = 0.25 * rootFontSize;
  const dotGap = 0.5 * rootFontSize;
  const popoverWidth = 10 * rootFontSize;
  const popoverHeight = padY * 2 + cluster.pois.length * rowHeight;
  const popoverRadius = 0.5 * rootFontSize;
  const lineLength = 2 * rootFontSize;

  const { cx: x, cy: y } = cluster;

  // 좌/우 방향 결정
  const svgEl = layer.node()?.ownerSVGElement;
  const svgWidth = svgEl ? svgEl.clientWidth || svgEl.getBoundingClientRect().width : 0;
  const isRight = svgWidth > 0 && x > svgWidth / 2;

  const lineEndX = isRight ? x - lineLength : x + lineLength;
  const popoverX = isRight ? lineEndX - popoverWidth : lineEndX;
  const popoverY = y - popoverHeight / 2;

  // 연결선
  const lineActualEndX = isRight ? lineEndX - popoverRadius : lineEndX + popoverRadius;
  infoGroup
    .append("line")
    .attr("x1", x)
    .attr("y1", y)
    .attr("x2", x)
    .attr("y2", y)
    .attr("stroke", MAP_COLORS.brand)
    .attr("stroke-width", 0.125 * rootFontSize)
    .transition()
    .duration(200)
    .attr("x2", lineActualEndX);

  const contentGroup = infoGroup
    .append("g")
    .attr("class", "cluster-dropdown-content")
    .style("opacity", 0);

  // 배경
  contentGroup
    .append("rect")
    .attr("x", popoverX)
    .attr("y", popoverY)
    .attr("width", popoverWidth)
    .attr("height", popoverHeight)
    .attr("rx", popoverRadius)
    .attr("fill", MAP_COLORS.brand);

  // 사이트 목록
  cluster.pois.forEach((projected, i) => {
    const status = projected.poi.data?.status as string | undefined;
    const siteName =
      (projected.poi.data?.name as string) ?? projected.poi.label ?? projected.poi.id;
    const rowY = popoverY + padY + i * rowHeight;

    const row = contentGroup
      .append("g")
      .attr("class", "cluster-dropdown-item")
      .attr("data-poi-id", projected.poi.id)
      .style("cursor", "pointer")
      .style("pointer-events", "all");

    // 행 배경 (hover용)
    row
      .append("rect")
      .attr("class", "row-bg")
      .attr("x", popoverX + padX * 0.5)
      .attr("y", rowY)
      .attr("width", popoverWidth - padX)
      .attr("height", rowHeight)
      .attr("rx", 0.25 * rootFontSize)
      .attr("fill", "transparent");

    // 상태 dot
    const dotColor = status === "danger" ? "#DE4545" : status === "warning" ? "#FFA26B" : "#00C48C";
    row
      .append("circle")
      .attr("cx", popoverX + padX + dotRadius)
      .attr("cy", rowY + rowHeight / 2)
      .attr("r", dotRadius)
      .attr("fill", dotColor);

    // 사이트명
    row
      .append("text")
      .attr("x", popoverX + padX + dotRadius * 2 + dotGap)
      .attr("y", rowY + rowHeight / 2)
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .attr("font-size", `${0.6875 * rootFontSize}px`)
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .text(siteName);

    // 이벤트
    row
      .on("mouseenter", function () {
        select(this)
          .select(".row-bg")
          .transition()
          .duration(100)
          .attr("fill", "rgba(255,255,255,0.15)");
      })
      .on("mouseleave", function () {
        select(this).select(".row-bg").transition().duration(100).attr("fill", "transparent");
      })
      .on("click", (event: MouseEvent) => {
        event.stopPropagation();
        handlers.onSelectSite(projected.poi.id);
      });
  });

  contentGroup.transition().delay(150).duration(200).style("opacity", 1);
}

/** 클러스터 드롭다운 제거 */
export function clearClusterDropdown(layer: SVGGroupSelection): void {
  layer.selectAll(".cluster-dropdown").transition().duration(150).style("opacity", 0).remove();
}
