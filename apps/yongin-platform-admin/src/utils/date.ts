/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 현재 날짜를 KST 기준 YYYY-MM-DD 형식으로 반환
 * @param date - 변환할 Date 객체 (기본값: 현재 시간)
 * @returns YYYY-MM-DD 형식 문자열
 * @example
 * formatDateKST() // "2025-01-26"
 * formatDateKST(new Date(2025, 0, 15)) // "2025-01-15"
 */
export function formatDateKST(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
