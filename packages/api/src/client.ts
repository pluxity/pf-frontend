import { ApiError } from "./error";
import type { ApiClientConfig, RequestOptions, UploadOptions } from "./types";

/**
 * API 클라이언트 생성
 */
export function createApiClient(config: ApiClientConfig) {
  const { baseURL, refreshTokenURL = "/auth/refresh-token", onUnauthorized } = config;

  let isRefreshing = false;
  let refreshPromise: Promise<boolean> | null = null;

  function buildURL(path: string, params?: RequestOptions["params"]): string {
    const url = new URL(path, baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async function refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(buildURL(refreshTokenURL), {
        method: "POST",
        credentials: "include",
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async function handleUnauthorized(): Promise<boolean> {
    // 이미 갱신 중이면 기존 Promise 재사용
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = refreshToken();

    const success = await refreshPromise;

    isRefreshing = false;
    refreshPromise = null;

    if (!success && onUnauthorized) {
      onUnauthorized();
    }

    return success;
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
    isRetry = false
  ): Promise<T> {
    const { params, headers: customHeaders, ...restOptions } = options;

    const url = buildURL(path, params);

    const isFormData = body instanceof FormData;

    const headers: HeadersInit = {
      ...(body !== undefined && !isFormData && { "Content-Type": "application/json" }),
      ...customHeaders,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
      credentials: "include",
      ...restOptions,
    });

    // 401 응답 시 토큰 갱신 후 재시도 (1회)
    if (response.status === 401 && !isRetry) {
      const refreshed = await handleUnauthorized();

      if (refreshed) {
        return request<T>(method, path, body, options, true);
      }
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // 에러 응답
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }

    // JSON 응답 처리
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      // 201 Created 시 Location 헤더 포함
      if (response.status === 201) {
        const location = response.headers.get("Location");
        return { ...data, location } as T;
      }
      return data as T;
    }

    // 201 Created (JSON 아닌 경우)
    if (response.status === 201) {
      const location = response.headers.get("Location");
      return { location } as T;
    }

    return undefined as T;
  }

  const client = {
    /**
     * GET 요청
     */
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>("GET", path, undefined, options);
    },

    /**
     * POST 요청
     */
    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>("POST", path, body, options);
    },

    /**
     * PUT 요청
     */
    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>("PUT", path, body, options);
    },

    /**
     * PATCH 요청
     */
    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>("PATCH", path, body, options);
    },

    /**
     * DELETE 요청
     */
    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>("DELETE", path, undefined, options);
    },

    /**
     * 파일 업로드 (진행률 콜백 지원)
     * XHR 사용으로 업로드 진행률 추적 가능
     */
    upload<T>(path: string, file: File | File[], options: UploadOptions = {}): Promise<T> {
      const { fieldName = "file", onProgress, headers: customHeaders } = options;

      const executeUpload = (isRetry = false): Promise<T> => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const url = buildURL(path);

          const formData = new FormData();
          if (Array.isArray(file)) {
            file.forEach((f) => formData.append(fieldName, f));
          } else {
            formData.append(fieldName, file);
          }

          // 진행률 이벤트
          if (onProgress) {
            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
              }
            });
          }

          xhr.addEventListener("load", async () => {
            // 401 시 토큰 갱신 후 재시도
            if (xhr.status === 401 && !isRetry) {
              const refreshed = await handleUnauthorized();
              if (refreshed) {
                resolve(executeUpload(true));
                return;
              }
            }

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const responseData = JSON.parse(xhr.responseText);
                if (xhr.status === 201) {
                  const location = xhr.getResponseHeader("Location");
                  resolve({ ...responseData, location } as T);
                } else {
                  resolve(responseData as T);
                }
              } catch {
                reject(new ApiError(xhr.status, "Failed to parse JSON response", "PARSE_ERROR"));
              }
            } else {
              let errorResponse;
              try {
                errorResponse = JSON.parse(xhr.responseText);
              } catch {
                // JSON 파싱 실패 시 무시
              }
              reject(
                new ApiError(
                  xhr.status,
                  errorResponse?.message || xhr.statusText,
                  errorResponse?.code,
                  errorResponse
                )
              );
            }
          });

          xhr.addEventListener("error", () => {
            reject(new ApiError(0, "Network error", "NETWORK_ERROR"));
          });

          xhr.open("POST", url);
          xhr.withCredentials = true;

          if (customHeaders) {
            Object.entries(customHeaders).forEach(([key, value]) => {
              if (typeof value === "string") {
                xhr.setRequestHeader(key, value);
              }
            });
          }

          xhr.send(formData);
        });
      };

      return executeUpload();
    },
  };

  return client;
}

export type ApiClient = ReturnType<typeof createApiClient>;
