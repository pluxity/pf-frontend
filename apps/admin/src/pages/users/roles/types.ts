/**
 * 롤 관련 타입 정의
 */

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissionIds: number[];
}
