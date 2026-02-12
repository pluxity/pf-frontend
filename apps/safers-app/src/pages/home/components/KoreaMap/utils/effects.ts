import { easeQuadOut } from "d3-ease";
import type { SVGGroupSelection } from "../types";
import { MAP_COLORS } from "../constants";

/** POI 클릭 시 퍼지는 리플 효과 생성 */
export function createClickRipple(
  layer: SVGGroupSelection,
  x: number,
  y: number,
  color: string,
  rootFontSize: number
): void {
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
    .duration(600)
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
    .delay(120)
    .duration(600)
    .ease(easeQuadOut)
    .attr("r", 2 * rootFontSize)
    .attr("opacity", 0)
    .on("end", function () {
      rippleGroup.remove();
    });
}

/** warning/danger 상태 POI의 반복 펄스 리플 효과 생성 */
export function createPulseRipple(
  layer: SVGGroupSelection,
  x: number,
  y: number,
  color: string,
  rootFontSize: number
): void {
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
export function showPOIInfo(
  layer: SVGGroupSelection,
  x: number,
  y: number,
  siteName: string,
  rootFontSize: number,
  onClick?: () => void
): void {
  clearPOIInfo(layer);

  const infoGroup = layer.append("g").attr("class", "poi-info");

  const lineStartX = x;
  const lineStartY = y;
  const lineEndX = x + 2 * rootFontSize;
  const lineY = lineStartY;

  const arrowSize = 0.4 * rootFontSize;
  const arrowGap = 0.4 * rootFontSize;
  const textLength = siteName.length;
  const textWidth = textLength * 0.55 * rootFontSize;
  const boxPaddingX = 0.75 * rootFontSize;
  const boxWidth = Math.max(5 * rootFontSize, textWidth + arrowSize + arrowGap + boxPaddingX * 2);
  const boxHeight = 1.5 * rootFontSize;
  const boxX = lineEndX;
  const boxY = lineY - boxHeight / 2;

  infoGroup
    .append("line")
    .attr("x1", lineStartX)
    .attr("y1", lineStartY)
    .attr("x2", lineStartX)
    .attr("y2", lineStartY)
    .attr("stroke", MAP_COLORS.brand)
    .attr("stroke-width", 0.125 * rootFontSize)
    .transition()
    .duration(200)
    .attr("x2", lineEndX);

  const pillGroup = infoGroup
    .append("g")
    .attr("class", "poi-info-pill")
    .style("opacity", 0)
    .style("cursor", onClick ? "pointer" : "default")
    .style("pointer-events", onClick ? "all" : "none");

  pillGroup
    .append("rect")
    .attr("x", boxX)
    .attr("y", boxY)
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .attr("rx", boxHeight / 2)
    .attr("fill", MAP_COLORS.brand);

  const contentCenterX =
    boxX + boxPaddingX + (boxWidth - boxPaddingX * 2 - arrowSize - arrowGap) / 2;

  pillGroup
    .append("text")
    .attr("x", contentCenterX)
    .attr("y", boxY + boxHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", `${0.75 * rootFontSize}px`)
    .attr("font-weight", "500")
    .attr("text-decoration", onClick ? "underline" : "none")
    .style("pointer-events", "none")
    .text(siteName);

  // 화살표 아이콘 (>)
  const arrowX = boxX + boxWidth - boxPaddingX - arrowSize;
  const arrowCenterY = boxY + boxHeight / 2;
  pillGroup
    .append("path")
    .attr(
      "d",
      `M${arrowX},${arrowCenterY - arrowSize * 0.5} L${arrowX + arrowSize * 0.5},${arrowCenterY} L${arrowX},${arrowCenterY + arrowSize * 0.5}`
    )
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .style("pointer-events", "none");

  if (onClick) {
    pillGroup.on("click", (event: MouseEvent) => {
      event.stopPropagation();
      onClick();
    });

    pillGroup
      .on("mouseenter", function () {
        pillGroup.select("rect").transition().duration(150).attr("fill", "#E06800");
      })
      .on("mouseleave", function () {
        pillGroup.select("rect").transition().duration(150).attr("fill", MAP_COLORS.brand);
      });
  }

  pillGroup.transition().delay(150).duration(200).style("opacity", 1);
}

/** POI 정보 라벨 제거 */
export function clearPOIInfo(layer: SVGGroupSelection): void {
  layer.selectAll(".poi-info").transition().duration(150).style("opacity", 0).remove();
}
