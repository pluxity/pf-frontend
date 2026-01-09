export interface User {
  id: number;
  email: string;
  name: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface UserFormData {
  email: string;
  name: string;
  password?: string;
  roleIds: number[];
}

export interface UserRolesUpdateData {
  roleIds: number[];
}

export interface UserPasswordUpdateData {
  password: string;
}

export type FilterStatus = "all";
