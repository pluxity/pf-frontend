/**
 * 공통 API 응답 타입
 */

/** 페이지네이션 응답 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}
