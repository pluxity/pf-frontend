/**
 * 공지사항 Validation
 */
import { validators, collectErrors, type ValidationError } from "@/utils";

export interface NoticeFormData {
  title: string;
  content: string;
  isVisible: boolean;
  isAlways: boolean;
  startDate: string;
  endDate: string;
}

/**
 * 공지사항 폼 유효성 검사
 * - 제목: 필수
 * - 내용: 필수
 * - 게시기간: 상시가 아닐 경우 필수
 */
export function validateNotice(data: NoticeFormData): ValidationError[] {
  return collectErrors(
    validators.required(data.title, "제목"),
    validators.required(data.content, "내용"),
    !data.isAlways && !data.startDate
      ? { field: "시작일", message: "시작일을 선택해주세요" }
      : null,
    !data.isAlways && !data.endDate ? { field: "종료일", message: "종료일을 선택해주세요" } : null,
    !data.isAlways && data.startDate && data.endDate
      ? validators.dateRange(data.startDate, data.endDate, "시작일", "종료일")
      : null
  );
}
