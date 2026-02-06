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
  rootFontSize: number
): void {
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
    .attr("stroke", MAP_COLORS.brand)
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
    .attr("fill", MAP_COLORS.brand);

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
export function clearPOIInfo(layer: SVGGroupSelection): void {
  layer.selectAll(".poi-info").transition().duration(150).style("opacity", 0).remove();
}
