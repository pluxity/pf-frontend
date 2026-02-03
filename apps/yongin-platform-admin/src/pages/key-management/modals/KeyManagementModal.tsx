import { Button, Input, Textarea, FormField } from "@pf-dev/ui";
import { useState, useRef, useEffect, useCallback } from "react";
import type { KeyManagementModalProps } from "../types";
import { uploadFile } from "../../../services/fileService";
import { useToastContext } from "../../../contexts/ToastContext";

export function KeyManagementModal({
  isOpen,
  selectedItem,
  onClose,
  onSave,
}: KeyManagementModalProps) {
  const { toast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    methodFeature: "",
    methodContent: "",
    methodDirection: "",
  });

  useEffect(() => {
    if (isOpen && selectedItem) {
      setFormData({
        title: selectedItem.title || "",
        methodFeature: selectedItem.methodFeature || "",
        methodContent: selectedItem.methodContent || "",
        methodDirection: selectedItem.methodDirection || "",
      });

      if (selectedItem.file?.url) {
        setPreviewUrl(selectedItem.file.url);
      } else {
        setPreviewUrl(null);
      }

      setUploadedFileId(null);
    }
  }, [isOpen, selectedItem]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      dialogRef.current?.focus();
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !selectedItem) return null;

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      setIsUploading(true);
      const fileId = await uploadFile(file);

      setUploadedFileId(fileId);
    } catch (error) {
      console.error("File upload error:", error);
      if (selectedItem?.file?.url) {
        setPreviewUrl(selectedItem.file.url);
      } else {
        setPreviewUrl(null);
      }
      toast.error("파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (selectedItem?.file?.url) {
      setPreviewUrl(selectedItem.file.url);
    } else {
      setPreviewUrl(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onClose();
  };

  // 초기화 버튼
  const handleReset = () => {
    if (!selectedItem) return;

    setFormData({
      title: "",
      methodFeature: "",
      methodContent: "",
      methodDirection: "",
    });
    setPreviewUrl(null);
    setUploadedFileId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (!selectedItem) return;

    // formData에 displayOrder를 추가하여 전달
    const dataWithOrder = {
      ...formData,
      displayOrder: selectedItem.displayOrder,
    };

    onSave(dataWithOrder, uploadedFileId);
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-10"
      onClick={handleClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="주요관리사항 편집"
        tabIndex={-1}
        className="bg-white rounded-lg p-8 w-[56rem] max-h-[90vh] overflow-y-auto shadow-lg outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <FormField label="제목">
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="제목을 입력하세요"
            />
          </FormField>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-80">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleFileClick}
                disabled={isUploading}
                className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mb-3" />
                    <p className="text-sm text-gray-500">업로드 중...</p>
                  </>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <svg
                      className="w-16 h-16 text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500">클릭하여 이미지 업로드</p>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 space-y-4 gap-2">
              {/* 공법특징 */}
              <div className="flex items-stretch gap-2">
                <div className="flex-shrink-0 w-20 bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-medium text-center leading-tight">
                    공법
                    <br />
                    특징
                  </span>
                </div>
                <Textarea
                  value={formData.methodFeature}
                  onChange={(e) => setFormData({ ...formData, methodFeature: e.target.value })}
                  rows={4}
                  placeholder="공법특징을 입력하세요"
                  className="flex-1"
                />
              </div>

              {/* 공법내용 */}
              <div className="flex items-stretch gap-2">
                <div className="flex-shrink-0 w-20 bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-medium text-center leading-tight">
                    공법
                    <br />
                    내용
                  </span>
                </div>
                <Textarea
                  value={formData.methodContent}
                  onChange={(e) => setFormData({ ...formData, methodContent: e.target.value })}
                  rows={4}
                  placeholder="공법내용을 입력하세요"
                  className="flex-1"
                />
              </div>

              {/* 공법추진방향 */}
              <div className="flex items-stretch gap-2">
                <div className="flex-shrink-0 w-20 bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-medium text-center leading-tight">
                    공법
                    <br />
                    추진
                    <br />
                    방향
                  </span>
                </div>
                <Textarea
                  value={formData.methodDirection}
                  onChange={(e) => setFormData({ ...formData, methodDirection: e.target.value })}
                  rows={4}
                  placeholder="공법추진방향을 입력하세요"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button onClick={handleReset} variant="error">
            초기화
          </Button>
          <div className="flex gap-3">
            <Button onClick={handleClose} variant="outline">
              취소
            </Button>
            <Button onClick={handleSave} disabled={selectedItem.id < 0 && !formData.title.trim()}>
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
