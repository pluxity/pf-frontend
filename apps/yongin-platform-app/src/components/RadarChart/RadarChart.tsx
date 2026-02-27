import { useMemo, useState } from "react";
import { cn } from "@pf-dev/ui";
import type { RadarChartProps } from "./types";

const DEFAULTS = {
  size: 300,
  levels: 4,
  fillColor: "rgba(243,112,33,0.25)",
  strokeColor: "#F37021",
  labelColor: "#94A3B8",
  gridColor: "#334155",
} as const;

/** 깔끔한 최대값 계산 (100, 200, 500, 1000 …) */
function niceMax(max: number): number {
  if (max <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const residual = max / magnitude;

  if (residual <= 1) return magnitude;
  if (residual <= 2) return 2 * magnitude;
  if (residual <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

/** 극좌표 → 직교좌표 (12시 방향 시작, 시계 방향) */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  total: number
): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

/** 툴팁 위치를 SVG 영역 안에 clamp */
function clampTooltip(
  x: number,
  y: number,
  tooltipW: number,
  tooltipH: number,
  size: number
): { tx: number; ty: number } {
  const pad = 4;
  let tx = x - tooltipW / 2;
  let ty = y - tooltipH - 10;

  if (tx < pad) tx = pad;
  if (tx + tooltipW > size - pad) tx = size - pad - tooltipW;
  if (ty < pad) ty = y + 12;

  return { tx, ty };
}

/** data + size + levels → 모든 geometry를 한번에 계산 */
function computeGeometry(data: RadarChartProps["data"], size: number, levels: number) {
  const n = data.length;
  const cx = size / 2;
  const cy = size / 2;
  const labelMargin = 36;
  const radius = (size - labelMargin * 2) / 2;
  const maxVal = niceMax(Math.max(...data.map((d) => d.value)));

  const levelPolygons = Array.from({ length: levels }, (_, lvl) => {
    const r = (radius / levels) * (lvl + 1);
    const points = Array.from({ length: n }, (_, i) => {
      const { x, y } = polarToCartesian(cx, cy, r, i, n);
      return `${x},${y}`;
    }).join(" ");
    return points;
  });

  const axes = data.map((_, i) => polarToCartesian(cx, cy, radius, i, n));

  const dataPoints = data.map((d, i) => {
    const r = (d.value / maxVal) * radius;
    return polarToCartesian(cx, cy, r, i, n);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labels = data.map((d, i) => {
    const { x, y } = polarToCartesian(cx, cy, radius + 16, i, n);
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const cos = Math.cos(angle);

    let textAnchor: "start" | "middle" | "end" = "middle";
    if (cos > 0.1) textAnchor = "start";
    else if (cos < -0.1) textAnchor = "end";

    return { x, y, textAnchor, label: d.label };
  });

  const levelLabels = Array.from({ length: levels }, (_, lvl) => {
    const val = Math.round((maxVal / levels) * (lvl + 1));
    const r = (radius / levels) * (lvl + 1);
    return { value: val, y: cy - r };
  });

  return { cx, cy, levelPolygons, axes, dataPoints, dataPolygon, labels, levelLabels };
}

const TOOLTIP_W = 80;
const TOOLTIP_H = 36;

export function RadarChart({
  data,
  size = DEFAULTS.size,
  levels = DEFAULTS.levels,
  fillColor = DEFAULTS.fillColor,
  strokeColor = DEFAULTS.strokeColor,
  labelColor = DEFAULTS.labelColor,
  gridColor = DEFAULTS.gridColor,
  className,
}: RadarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const geo = useMemo(() => computeGeometry(data, size, levels), [data, size, levels]);

  if (data.length < 3) return null;

  const { cx, cy, levelPolygons, axes, dataPoints, dataPolygon, labels, levelLabels } = geo;

  const hoveredDatum = hovered !== null ? (data[hovered] ?? null) : null;
  const hoveredPoint = hovered !== null ? (dataPoints[hovered] ?? null) : null;
  const tooltip =
    hoveredDatum && hoveredPoint
      ? clampTooltip(hoveredPoint.x, hoveredPoint.y, TOOLTIP_W, TOOLTIP_H, size)
      : null;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("w-full h-auto", className)}
      role="img"
      aria-label="안전장비 현황 레이더 차트"
      onMouseLeave={() => setHovered(null)}
    >
      {/* 동심원 그리드 */}
      {levelPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke={gridColor}
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}

      {/* 축 선 */}
      {axes.map((axis, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={axis.x}
          y2={axis.y}
          stroke={gridColor}
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}

      {/* 데이터 영역 */}
      <polygon points={dataPolygon} fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />

      {/* 데이터 포인트 (호버 히트 영역 포함) */}
      {dataPoints.map((p, i) => (
        <g
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
          <circle
            cx={p.x}
            cy={p.y}
            r={hovered === i ? 5 : 4}
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth={2}
          />
        </g>
      ))}

      {/* 레벨 값 라벨 */}
      {levelLabels.map((lvl, i) => (
        <text key={i} x={cx + 4} y={lvl.y - 2} fontSize={9} fill={labelColor} opacity={0.6}>
          {lvl.value}
        </text>
      ))}

      {/* 축 라벨 */}
      {labels.map((lbl, i) => (
        <text
          key={i}
          x={lbl.x}
          y={lbl.y}
          textAnchor={lbl.textAnchor}
          dominantBaseline="central"
          fontSize={11}
          fill={labelColor}
        >
          {lbl.label}
        </text>
      ))}

      {/* 툴팁 */}
      {hoveredDatum && tooltip && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={tooltip.tx}
            y={tooltip.ty}
            width={TOOLTIP_W}
            height={TOOLTIP_H}
            rx={6}
            fill="#1E293B"
            opacity={0.92}
          />
          <text
            x={tooltip.tx + TOOLTIP_W / 2}
            y={tooltip.ty + 14}
            textAnchor="middle"
            fontSize={10}
            fill="#94A3B8"
          >
            {hoveredDatum.label}
          </text>
          <text
            x={tooltip.tx + TOOLTIP_W / 2}
            y={tooltip.ty + 28}
            textAnchor="middle"
            fontSize={12}
            fontWeight="bold"
            fill="#FFFFFF"
          >
            {hoveredDatum.value.toLocaleString()}
          </text>
        </g>
      )}
    </svg>
  );
}
