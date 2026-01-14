import { getApiClient, type DataResponse, type CreatedResponse } from "@pf-dev/api";
import type { Permission, PermissionFormData, ResourceTypeInfo } from "../types";

export async function getPermissions(): Promise<Permission[]> {
  const response = await getApiClient().get<DataResponse<Permission[]>>("/permissions");
  return response.data;
}

export async function createPermission(data: PermissionFormData): Promise<number> {
  const response = await getApiClient().post<CreatedResponse<number>>("/permissions", data);
  return response.data;
}

export async function updatePermission(id: number, data: PermissionFormData): Promise<void> {
  await getApiClient().patch<void>(`/permissions/${id}`, data);
}

export async function deletePermission(id: number): Promise<void> {
  await getApiClient().delete<void>(`/permissions/${id}`);
}

export async function getResourceTypes(): Promise<ResourceTypeInfo[]> {
  const response = await getApiClient().get<DataResponse<ResourceTypeInfo[]>>(
    "/permissions/resource-types"
  );
  return response.data;
}
