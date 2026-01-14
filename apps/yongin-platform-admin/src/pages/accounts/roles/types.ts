export interface PermissionLevel {
  level: "READ" | "WRITE" | "ADMIN";
}

export interface ResourcePermission extends PermissionLevel {
  resourceType: string;
  resourceId: string;
}

export interface DomainPermission extends PermissionLevel {
  resourceType: string;
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

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface RoleCreateData {
  name: string;
  description?: string;
  permissionIds: number[];
  authority?: "ADMIN" | "USER";
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissionIds: number[];
}
