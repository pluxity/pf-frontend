export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
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
