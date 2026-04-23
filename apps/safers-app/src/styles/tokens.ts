/**
 * safers-app 디자인 토큰
 *
 * 다크 테마 색상 상수. Tailwind 클래스에서는 리터럴 hex (`bg-[#0F1117]`)를
 * 직접 사용해야 하지만, JS 상수·인라인 스타일·SVG 속성에서는 이 토큰을 참조합니다.
 *
 * 참고: 브라우저 다크모드 영향 방지를 위해 시맨틱 Tailwind 색상 대신 명시적 hex 사용
 */

// ─── 다크 테마 배경 ───

export const DARK_THEME = {
  /** 페이지 배경 (#0F1117) */
  bg: "#0F1117",
  /** 패널/카드 배경 (#1A1D27) */
  surface: "#1A1D27",
  /** 테두리/구분선 (#2A2D3A) */
  border: "#2A2D3A",
  /** 입력/버튼 강조 배경 (#252833) */
  surfaceElevated: "#252833",
} as const;

// ─── 상태 색상 ───

export const STATUS_COLORS = {
  /** 브랜드 블루 (#4D7EFF) */
  brand: "#4D7EFF",
  /** 경고 노란색 (#F59E0B) */
  warning: "#F59E0B",
  /** 위험/에러 빨간색 (#DE4545) */
  danger: "#DE4545",
  /** 성공/정상 초록색 (#00C48C) */
  success: "#00C48C",
  /** 위험 감지 빨간색 (#CA0014) — CCTV AI 이벤트용 */
  dangerDetection: "#CA0014",
  /** 경고 노란색 (#FDC200) — 이벤트 로그/안전 점수용 */
  warningAlt: "#FDC200",
  /** 위험 텍스트 (#FF6B6B) — 이벤트 배지 텍스트용 */
  dangerText: "#FF6B6B",
  /** 안전 초록색 (#12C308) — 안전 점수 양호 표시용 */
  successAlt: "#12C308",
} as const;
