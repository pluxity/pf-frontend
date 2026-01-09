export interface Permission {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionFormData {
  name: string;
  description?: string;
}
