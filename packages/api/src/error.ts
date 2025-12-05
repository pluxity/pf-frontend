import type { ErrorResponse } from "./types";

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly response?: ErrorResponse;

  constructor(status: number, message: string, code?: string, response?: ErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code ?? `HTTP_${status}`;
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * 400 Bad Request 여부
   */
  get isBadRequest(): boolean {
    return this.status === 400;
  }

  /**
   * 401 Unauthorized 여부
   */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * 403 Forbidden 여부
   */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * 404 Not Found 여부
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * 409 Conflict 여부
   */
  get isConflict(): boolean {
    return this.status === 409;
  }

  /**
   * 5xx 서버 에러 여부
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Response에서 ApiError 생성
   */
  static async fromResponse(response: Response): Promise<ApiError> {
    let errorResponse: ErrorResponse | undefined;
    let message = response.statusText || `HTTP Error ${response.status}`;
    let code: string | undefined;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        errorResponse = (await response.json()) as ErrorResponse;
        message = errorResponse.message || message;
        code = errorResponse.code;
      }
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }

    return new ApiError(response.status, message, code, errorResponse);
  }
}

/**
 * ApiError 타입 가드
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
