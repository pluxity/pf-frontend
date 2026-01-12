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

export interface User {
  id: number;
  username: string;
  name: string;
  code?: string;
  phoneNumber?: string;
  department?: string;
  shouldChangePassword: boolean;
  roles: Role[];
}

export interface UserCreateData {
  username: string;
  password: string;
  name: string;
  code?: string;
  phoneNumber?: string;
  department?: string;
  roleIds: number[];
}

export interface UserUpdateData {
  name?: string;
  code?: string;
  phoneNumber?: string;
  department?: string;
  roleIds?: number[];
}

export interface UserRolesUpdateData {
  roleIds: number[];
}

export interface UserPasswordUpdateData {
  password: string;
}
