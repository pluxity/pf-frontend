import { getApiClient, type DataResponse, type PageResponse } from "@pf-dev/api";
import type { User, CreateUserRequest, UpdateUserRequest } from "./types/user";

export const userService = {
  /** 사용자 목록 조회 */
  getUsers: (params?: { page?: number; size?: number }) => {
    return getApiClient().get<PageResponse<User>>("/users", { params });
  },

  /** 사용자 상세 조회 */
  getUser: async (id: number): Promise<User> => {
    const result = await getApiClient().get<DataResponse<User>>(`/users/${id}`);
    return result.data;
  },

  /** 사용자 생성 */
  createUser: (data: CreateUserRequest) => {
    return getApiClient().post<DataResponse<User>>("/users", data);
  },

  /** 사용자 수정 */
  updateUser: (id: number, data: UpdateUserRequest) => {
    return getApiClient().put<DataResponse<User>>(`/users/${id}`, data);
  },

  /** 사용자 삭제 */
  deleteUser: (id: number) => {
    return getApiClient().delete<void>(`/users/${id}`);
  },
};
