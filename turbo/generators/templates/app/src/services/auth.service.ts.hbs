import type { DataResponse } from "@pf-dev/api";
import { apiClient } from "./client";
import type { SignInRequest } from "./types/auth";
import type { User } from "./types/user";

export const authService = {
  /** 로그인 */
  signIn: (data: SignInRequest): Promise<void> => {
    return apiClient.post("/auth/sign-in", data);
  },

  /** 로그아웃 */
  signOut: (): Promise<void> => {
    return apiClient.post("/auth/sign-out");
  },

  /** 현재 사용자 정보 조회 */
  getMe: async (): Promise<User> => {
    const result = await apiClient.get<DataResponse<User>>("/users/me");
    return result.data;
  },
};
