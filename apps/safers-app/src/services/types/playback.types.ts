/** 타임라인 시간 범위 (분 단위) */
export interface TimeRange {
  start: number; // 0 = 00:00, 1440 = 24:00
  end: number;
}
