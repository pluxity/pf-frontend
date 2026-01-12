import { getApiClient, type DataResponse, type CreatedResponse } from "@pf-dev/api";
import type { Role, RoleFormData, Permission } from "../types";

export async function getRoles(): Promise<Role[]> {
  const response = await getApiClient().get<DataResponse<Role[]>>("/roles");
  return response.data;
}

export async function createRole(data: RoleFormData): Promise<number> {
  const response = await getApiClient().post<CreatedResponse<number>>("/roles", data);
  return response.data;
}

export async function updateRole(id: number, data: RoleFormData): Promise<void> {
  await getApiClient().patch<void>(`/roles/${id}`, data);
}

export async function deleteRole(id: number): Promise<void> {
  await getApiClient().delete<void>(`/roles/${id}`);
}

export async function getPermissions(): Promise<Permission[]> {
  const response = await getApiClient().get<DataResponse<Permission[]>>("/permissions");
  return response.data;
}
