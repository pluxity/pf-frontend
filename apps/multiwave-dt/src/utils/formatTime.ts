/**
 * 시간을 한국 형식으로 포맷팅합니다.
 * @param date - Date 객체 또는 타임스탬프
 * @returns 포맷팅된 시간 문자열 (예: "14:30:45")
 */
export function formatTime(date: Date | number): string {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  return dateObj.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
