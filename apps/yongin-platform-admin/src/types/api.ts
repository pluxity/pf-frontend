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

/** 파일 응답 */
export interface FileResponse {
  id?: number;
  url?: string;
  originalFileName?: string;
  contentType?: string;
  fileStatus?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
