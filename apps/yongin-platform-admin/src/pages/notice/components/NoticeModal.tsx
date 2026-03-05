import {
  Button,
  Input,
  Textarea,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  FormField,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui";
import { useState, useEffect } from "react";
import type { ValidationError } from "@/utils";
import { formatDateKST } from "@/utils/date";
import type { Notice, NoticeFormData } from "../types";
import { validateNotice } from "../validation";

const getLastDayOfMonth = (): string => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return formatDateKST(lastDay);
};

export interface NoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNotice: Notice | null;
  onSave: (formData: NoticeFormData) => Promise<void>;
  isLoading: boolean;
}

export function NoticeModal({
  open,
  onOpenChange,
  selectedNotice,
  onSave,
  isLoading,
}: NoticeModalProps) {
  const [formData, setFormData] = useState<NoticeFormData>({
    title: "",
    content: "",
    isVisible: true,
    isAlways: false,
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (!open) return;

    const data = selectedNotice
      ? {
          title: selectedNotice.title || "",
          content: selectedNotice.content || "",
          isVisible: selectedNotice.isVisible ?? true,
          isAlways: selectedNotice.isAlways ?? false,
          startDate: selectedNotice.startDate
            ? formatDateKST(new Date(selectedNotice.startDate))
            : "",
          endDate: selectedNotice.endDate ? formatDateKST(new Date(selectedNotice.endDate)) : "",
        }
      : {
          title: "",
          content: "",
          isVisible: true,
          isAlways: false,
          startDate: formatDateKST(),
          endDate: getLastDayOfMonth(),
        };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(data);
  }, [open, selectedNotice]);

  const getFieldError = (fieldName: string) => {
    return errors.find((e) => e.field === fieldName)?.message;
  };

  const clearFieldError = (fieldName: string) => {
    setErrors((prev) => prev.filter((e) => e.field !== fieldName));
  };

  const handleClose = () => {
    setErrors([]);
    onOpenChange(false);
  };

  const handleSave = async () => {
    // 유효성 검사
    const validationErrors = validateNotice(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    await onSave(formData);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>{selectedNotice ? "공지사항 수정" : "공지사항 등록"}</ModalTitle>
          <ModalDescription>
            {selectedNotice ? "공지사항 내용을 수정합니다." : "새로운 공지사항을 등록합니다."}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6">
          <FormField label="제목" required error={getFieldError("제목")}>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                clearFieldError("제목");
              }}
              placeholder="제목을 입력하세요"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="내용" required error={getFieldError("내용")}>
            <Textarea
              value={formData.content}
              onChange={(e) => {
                setFormData({ ...formData, content: e.target.value });
                clearFieldError("내용");
              }}
              placeholder="내용을 입력하세요"
              rows={6}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="상태" required>
            <RadioGroup
              value={formData.isVisible ? "visible" : "hidden"}
              onValueChange={(value) =>
                setFormData({ ...formData, isVisible: value === "visible" })
              }
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="visible" id="visible" disabled={isLoading} />
                  <label htmlFor="visible" className="text-sm font-medium cursor-pointer">
                    노출
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="hidden" id="hidden" disabled={isLoading} />
                  <label htmlFor="hidden" className="text-sm font-medium cursor-pointer">
                    미노출
                  </label>
                </div>
              </div>
            </RadioGroup>
          </FormField>

          <FormField label="게시기간">
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isAlways"
                  checked={formData.isAlways}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData,
                      isAlways: checked as boolean,
                      startDate: checked ? "" : formData.startDate,
                      endDate: checked ? "" : formData.endDate,
                    });
                    clearFieldError("시작일");
                    clearFieldError("종료일");
                  }}
                />
                <label htmlFor="isAlways" className="text-sm font-medium cursor-pointer">
                  상시
                </label>
              </div>

              {!formData.isAlways && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">시작일</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => {
                          setFormData({ ...formData, startDate: e.target.value });
                          clearFieldError("시작일");
                        }}
                      />
                      {getFieldError("시작일") && (
                        <p className="text-xs text-error-brand mt-1">{getFieldError("시작일")}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">종료일</label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => {
                          setFormData({ ...formData, endDate: e.target.value });
                          clearFieldError("종료일");
                        }}
                      />
                      {getFieldError("종료일") && (
                        <p className="text-xs text-error-brand mt-1">{getFieldError("종료일")}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FormField>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
