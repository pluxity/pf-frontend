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

/** 선택된 POI의 팝오버 표시 (현장명 pill + 통합관제/AI CCTV 버튼) */
export function showPOIInfo(
  layer: SVGGroupSelection,
  x: number,
  y: number,
  siteName: string,
  rootFontSize: number,
  actions?: {
    onSiteClick?: () => void;
    onCctvAIClick?: () => void;
  }
): void {
  clearPOIInfo(layer);

  const infoGroup = layer.append("g").attr("class", "poi-info");

  // 고정 크기 팝오버: 8.75rem x 3.3125rem
  const popoverWidth = 8.75 * rootFontSize;
  const popoverHeight = 3.3125 * rootFontSize;
  const popoverRadius = 0.5 * rootFontSize;
  const lineLength = 2 * rootFontSize;

  // SVG 폭 기준으로 좌/우 방향 결정
  const svgEl = layer.node()?.ownerSVGElement;
  const svgWidth = svgEl ? svgEl.clientWidth || svgEl.getBoundingClientRect().width : 0;
  const isRight = svgWidth > 0 && x > svgWidth / 2;

  // 방향에 따른 좌표 계산
  const lineStartX = x;
  const lineStartY = y;
  const lineEndX = isRight ? x - lineLength : x + lineLength;
  const popoverX = isRight ? lineEndX - popoverWidth : lineEndX;
  const popoverY = lineStartY - popoverHeight + 0.0625 * rootFontSize;

  // 내부 레이아웃 역산
  const padX = 0.4 * rootFontSize;
  const padY = 0.4 * rootFontSize;
  const innerGap = 0.25 * rootFontSize;
  const btnGap = 0.25 * rootFontSize;
  const btnHeight = 1.3 * rootFontSize;
  const titleAreaHeight = popoverHeight - padY * 2 - innerGap - btnHeight;

  // 연결선 (border-radius 안쪽까지 연장하여 끊김 방지)
  const lineActualEndX = isRight ? lineEndX - popoverRadius : lineEndX + popoverRadius;
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
    .attr("x2", lineActualEndX);

  const popoverGroup = infoGroup.append("g").attr("class", "poi-info-pill").style("opacity", 0);

  // 배경 rect (전체 팝오버)
  popoverGroup
    .append("rect")
    .attr("x", popoverX)
    .attr("y", popoverY)
    .attr("width", popoverWidth)
    .attr("height", popoverHeight)
    .attr("rx", popoverRadius)
    .attr("fill", MAP_COLORS.brand);

  // 현장명 텍스트
  const titleCenterY = popoverY + padY + titleAreaHeight / 2;
  popoverGroup
    .append("text")
    .attr("x", popoverX + popoverWidth / 2)
    .attr("y", titleCenterY)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", `${0.75 * rootFontSize}px`)
    .attr("font-weight", "600")
    .style("pointer-events", "none")
    .text(siteName);

  // 하단 버튼 행
  const btnWidth = (popoverWidth - padX * 2 - btnGap) / 2;
  const btnY = popoverY + padY + titleAreaHeight + innerGap;
  const btnRadius = btnHeight / 2;
  const btnFontSize = 0.6 * rootFontSize;
  const btnStartX = popoverX + padX;

  createPopoverButton(popoverGroup, {
    className: "poi-btn-site",
    x: btnStartX,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
    radius: btnRadius,
    label: "통합관제",
    fontSize: btnFontSize,
    onClick: actions?.onSiteClick,
  });

  createPopoverButton(popoverGroup, {
    className: "poi-btn-cctv",
    x: btnStartX + btnWidth + btnGap,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
    radius: btnRadius,
    label: "AI CCTV",
    fontSize: btnFontSize,
    onClick: actions?.onCctvAIClick,
  });

  popoverGroup.transition().delay(150).duration(200).style("opacity", 1);
}

/** POI 정보 라벨 제거 */
export function clearPOIInfo(layer: SVGGroupSelection): void {
  layer.selectAll(".poi-info").transition().duration(150).style("opacity", 0).remove();
}

/** 팝오버 내부 버튼 생성 헬퍼 */
function createPopoverButton(
  parent: SVGGroupSelection,
  options: {
    className: string;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    label: string;
    fontSize: number;
    onClick?: () => void;
  }
): void {
  const { className, x, y, width, height, radius, label, fontSize, onClick } = options;
  const textColor = "#FF7500";
  const defaultFill = "white";
  const hoverFill = "#F0F0F0";

  const btn = parent.append("g").attr("class", className);

  btn
    .append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height)
    .attr("rx", radius)
    .attr("fill", defaultFill);

  btn
    .append("text")
    .attr("x", x + width / 2)
    .attr("y", y + height / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", textColor)
    .attr("font-size", `${fontSize}px`)
    .attr("font-weight", "600")
    .style("pointer-events", "none")
    .text(label);

  if (onClick) {
    btn
      .style("cursor", "pointer")
      .style("pointer-events", "all")
      .on("click", (event: MouseEvent) => {
        event.stopPropagation();
        onClick();
      })
      .on("mouseenter", function () {
        btn.select("rect").transition().duration(150).attr("fill", hoverFill);
      })
      .on("mouseleave", function () {
        btn.select("rect").transition().duration(150).attr("fill", defaultFill);
      });
  }
}
