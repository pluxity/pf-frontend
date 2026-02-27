export interface RadarChartDatum {
  label: string;
  value: number;
}

export interface RadarChartProps {
  /** 차트에 표시할 데이터 (최소 3개, 최대 10개) */
  data: RadarChartDatum[];
  /** SVG 전체 크기 (px, 기본값 300) */
  size?: number;
  /** 동심원 단계 수 (기본값 4) */
  levels?: number;
  /** 채움 색상 (기본값 rgba(243,112,33,0.25)) */
  fillColor?: string;
  /** 테두리 색상 (기본값 #F37021) */
  strokeColor?: string;
  /** 라벨 색상 (기본값 #94A3B8) */
  labelColor?: string;
  /** 그리드 색상 (기본값 #334155) */
  gridColor?: string;
  className?: string;
}
