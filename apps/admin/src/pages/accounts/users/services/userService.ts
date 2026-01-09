import { getApiClient, type DataResponse, type CreatedResponse } from "@pf-dev/api";
import type { User, UserCreateData, UserUpdateData, Role } from "../types";

export async function getUsers(): Promise<User[]> {
  const response = await getApiClient().get<DataResponse<User[]>>("/admin/users");
  return response.data;
}

export async function getUser(id: number): Promise<User> {
  const response = await getApiClient().get<DataResponse<User>>(`/admin/users/${id}`);
  return response.data;
}

export async function createUser(data: UserCreateData): Promise<number> {
  const response = await getApiClient().post<CreatedResponse<number>>("/admin/users", data);
  return response.data;
}

export async function updateUser(id: number, data: UserUpdateData): Promise<void> {
  await getApiClient().put<void>(`/admin/users/${id}`, data);
}

export async function deleteUser(id: number): Promise<void> {
  await getApiClient().delete<void>(`/admin/users/${id}`);
}

export async function initUserPassword(id: number): Promise<void> {
  await getApiClient().post<void>(`/admin/users/${id}/password-init`);
}

export async function getRoles(): Promise<Role[]> {
  const response = await getApiClient().get<DataResponse<Role[]>>("/roles");
  return response.data;
}
