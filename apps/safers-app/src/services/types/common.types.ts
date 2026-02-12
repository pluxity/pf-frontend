/** 백엔드 공통 응답 래퍼 */
export interface DataResponseBody<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

/** 페이지네이션 응답 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

/** 파일 응답 */
export interface FileResponse {
  id: number;
  url: string;
  originalFileName: string;
  contentType: string;
}
