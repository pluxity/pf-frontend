/** 역할 */
export interface Role {
  id: number;
  name: string;
  description: string;
}

/** 사용자 */
export interface User {
  id: number;
  username: string;
  name: string;
  code: string;
  phoneNumber: string;
  department: string;
  shouldChangePassword: boolean;
  roles: Role[];
}

/** 사용자 생성 요청 */
export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  code?: string;
  phoneNumber?: string;
  department?: string;
  roleIds?: number[];
}

/** 사용자 수정 요청 */
export interface UpdateUserRequest {
  name?: string;
  code?: string;
  phoneNumber?: string;
  department?: string;
  roleIds?: number[];
}
