export type PermissionLevelType = "READ" | "WRITE" | "ADMIN";
export type ResourceType = "NONE" | "FACILITY" | "CCTV" | "TEMPERATURE_HUMIDITY";

export interface ResourcePermission {
  resourceType: string;
  resourceId: string;
  level: PermissionLevelType;
}

export interface DomainPermission {
  resourceType: string;
  level: PermissionLevelType;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  resourcePermissions: ResourcePermission[];
  domainPermissions: DomainPermission[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ResourceTypeInfo {
  key: string;
  name: string;
  endpoint: string;
  resources: ResourceItem[];
}

export interface ResourceItem {
  id: string | number;
  name: string;
}

export interface PermissionRequest {
  resourceType: ResourceType;
  resourceIds: string[];
  level: PermissionLevelType;
}

export interface PermissionCreateData {
  name: string;
  description?: string;
  permissions: PermissionRequest[];
}

export interface PermissionFormData {
  name: string;
  description?: string;
  permissions: PermissionRequest[];
}
