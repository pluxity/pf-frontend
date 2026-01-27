/**
 * 검색 관련 유틸리티 함수
 */
import type { ReactNode } from "react";
import { createElement } from "react";

/**
 * 정규식 특수문자를 이스케이프 처리
 * @param str - 이스케이프할 문자열
 * @returns 이스케이프된 문자열
 * @example
 * escapeRegex("test[1]") // "test\\[1\\]"
 * escapeRegex("50%") // "50%"
 * escapeRegex("(주)회사") // "\\(주\\)회사"
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 텍스트에서 검색어를 하이라이트 처리
 * @param text - 원본 텍스트
 * @param searchTerm - 검색어
 * @returns 하이라이트된 React 노드
 * @example
 * highlightText("시공구간 A", "시공") // <>"<mark>시공</mark>구간 A"</>
 */
export function highlightText(text: string, searchTerm: string): ReactNode {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part)
      ? createElement("span", { key: index, style: { backgroundColor: "#ffff00" } }, part)
      : part
  );
}
