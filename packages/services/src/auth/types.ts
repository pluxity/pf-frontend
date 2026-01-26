export type PermissionLevel = "READ" | "WRITE" | "ADMIN";

export interface DomainPermission {
  resourceType: string;
  level: PermissionLevel;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  domainPermissions?: DomainPermission[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface User {
  id: number;
  username: string;
  name: string;
  code?: string;
  phoneNumber?: string | null;
  department?: string | null;
  shouldChangePassword?: boolean;
  roles: Role[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}
