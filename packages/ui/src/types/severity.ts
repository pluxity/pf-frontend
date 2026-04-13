/**
 * SeverityLevel (위험도 등급)
 *
 * 안전/모니터링 플랫폼에서 사용하는 4단계 위험도 색상 체계.
 * 기존 success/warning/error/info 시맨틱 토큰과는 별도의 도메인 특화 토큰.
 *
 * - normal: 정상 (green)
 * - caution: 주의 (yellow/amber)
 * - warning: 경고 (orange)
 * - danger: 위험 (red)
 */
export type SeverityLevel = "normal" | "caution" | "warning" | "danger";

export const SEVERITY_LEVELS = ["normal", "caution", "warning", "danger"] as const;

/** SeverityLevel별 한글 라벨 */
export const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  normal: "정상",
  caution: "주의",
  warning: "경고",
  danger: "위험",
} as const;
