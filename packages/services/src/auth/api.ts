import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { LoginCredentials, User } from "./types";

export const login = async (credentials: LoginCredentials): Promise<void> => {
  await getApiClient().post<void>("/auth/sign-in", credentials);
};

export const logout = async (): Promise<void> => {
  await getApiClient().post<void>("/auth/sign-out");
};

export const refresh = async (): Promise<void> => {
  await getApiClient().post<void>("/auth/refresh-token");
};

export const getMe = async (): Promise<User> => {
  const response = await getApiClient().get<DataResponse<User>>("/users/me");
  return response.data;
};
