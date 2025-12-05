/**
 * API 공통 응답 (성공)
 * Backend DataResponseBody<T> 스펙
 */
export interface DataResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

/**
 * 생성 응답 (201 Created)
 * Location 헤더 포함
 */
export interface CreatedResponse<T = number> {
  data: T;
  location: string | null;
}

/**
 * 페이지네이션 데이터
 */
export interface PageData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * 페이지네이션 응답
 */
export interface PageResponse<T> {
  data: PageData<T>;
  status: number;
  message?: string;
  timestamp: string;
}

/**
 * 에러 응답
 * Backend ErrorResponseBody 스펙
 */
export interface ErrorResponse {
  status: number;
  message: string;
  code: string;
  error: string;
  timestamp: string;
}

/**
 * API 요청 옵션
 */
export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * API 클라이언트 설정
 */
export interface ApiClientConfig {
  baseURL: string;
  refreshTokenURL?: string;
  onUnauthorized?: () => void;
}

/**
 * 파일 업로드 옵션
 */
export interface UploadOptions extends Omit<RequestOptions, "params"> {
  /**
   * FormData에서 파일 필드 이름 (기본값: 'file')
   */
  fieldName?: string;
  /**
   * 업로드 진행률 콜백 (0~100)
   */
  onProgress?: (progress: number) => void;
}

/**
 * 파일 응답 (서버 스펙 기준)
 */
export interface FileResponse {
  id: number;
  url: string;
  originalFileName: string;
  contentType: string;
  fileStatus: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
