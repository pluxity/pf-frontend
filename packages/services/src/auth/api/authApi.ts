import type { AuthApiConfig, LoginCredentials, LoginResponse, User } from "../types";

const defaultConfig: AuthApiConfig = {
  baseUrl: "/api",
  loginEndpoint: "/auth/login",
  logoutEndpoint: "/auth/logout",
  refreshEndpoint: "/auth/refresh",
  meEndpoint: "/auth/me",
};

let apiConfig: AuthApiConfig = { ...defaultConfig };

export const configureAuthApi = (config: Partial<AuthApiConfig>) => {
  apiConfig = { ...apiConfig, ...config };
};

export const getAuthApiConfig = () => apiConfig;

const getUrl = (endpoint: string | undefined): string => {
  if (!endpoint) {
    throw new Error("Auth API endpoint is not configured.");
  }
  return `${apiConfig.baseUrl}${endpoint}`;
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(getUrl(apiConfig.loginEndpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "로그인에 실패했습니다.");
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    const response = await fetch(getUrl(apiConfig.logoutEndpoint), {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "로그아웃에 실패했습니다.");
    }
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await fetch(getUrl(apiConfig.refreshEndpoint), {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "토큰 갱신에 실패했습니다.");
    }

    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await fetch(getUrl(apiConfig.meEndpoint), {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "사용자 정보를 가져오는데 실패했습니다.");
    }

    return response.json();
  },
};
