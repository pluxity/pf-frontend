/**
 * 로그인 Validation
 */
import { validators, collectErrors, type ValidationError } from "@/utils";

export interface LoginFormData {
  username: string;
  password: string;
}

/**
 * 로그인 폼 유효성 검사
 * - 아이디: 필수
 * - 비밀번호: 필수, 6글자 이상
 */
export function validateLogin(data: LoginFormData): ValidationError[] {
  return collectErrors(
    validators.required(data.username, "아이디"),
    validators.required(data.password, "비밀번호"),
    data.password ? validators.min(data.password.length, 6, "비밀번호") : null
  );
}
