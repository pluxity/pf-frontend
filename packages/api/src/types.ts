export interface DataResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

export interface CreatedResponse<T = number> {
  data: T;
  location: string | null;
}

export interface PageData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  data: PageData<T>;
  status: number;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  code: string;
  error: string;
  timestamp: string;
}

export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiClientConfig {
  baseURL: string;
  refreshTokenURL?: string;
  onUnauthorized?: () => void;
}

export interface UploadOptions extends Omit<RequestOptions, "params"> {
  fieldName?: string;
  onProgress?: (progress: number) => void;
}

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
