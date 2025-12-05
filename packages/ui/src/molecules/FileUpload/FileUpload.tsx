import { useCallback, type Ref } from "react";
import { cn } from "../../utils";
import { UploadZone } from "./UploadZone";
import { FileItem, type FileItemData } from "./FileItem";

export interface FileUploadProps {
  value?: FileItemData[];
  onChange?: (files: FileItemData[]) => void;
  onUpload?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  ref?: Ref<HTMLDivElement>;
}

function FileUpload({
  value = [],
  onChange,
  onUpload,
  accept,
  multiple = true,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  disabled = false,
  className,
  title,
  description,
  buttonLabel,
  ref,
}: FileUploadProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newFiles: FileItemData[] = [];
      const filesToUpload: File[] = [];

      files.forEach((file) => {
        if (value.length + newFiles.length >= maxFiles) return;

        const fileItem: FileItemData = {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          size: file.size,
          type: file.type,
          status: "uploading",
          progress: 0,
        };

        if (file.size > maxSize) {
          fileItem.status = "error";
          fileItem.error = `파일 크기가 ${formatFileSize(maxSize)}를 초과합니다`;
        } else {
          filesToUpload.push(file);
        }

        newFiles.push(fileItem);
      });

      const updatedFiles = [...value, ...newFiles];
      onChange?.(updatedFiles);

      if (filesToUpload.length > 0) {
        onUpload?.(filesToUpload);
      }
    },
    [value, onChange, onUpload, maxSize, maxFiles]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const updatedFiles = value.filter((f) => f.id !== id);
      onChange?.(updatedFiles);
    },
    [value, onChange]
  );

  const canAddMore = value.length < maxFiles;

  return (
    <div ref={ref} className={cn("space-y-3", className)}>
      {canAddMore && (
        <UploadZone
          onFilesSelected={handleFilesSelected}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          maxSize={maxSize}
          title={title}
          description={description}
          buttonLabel={buttonLabel}
        />
      )}

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => (
            <FileItem key={file.id} file={file} onRemove={handleRemove} showProgress removable />
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-[#808088]">
          {value.length} / {maxFiles} 파일
        </p>
      )}
    </div>
  );
}

export { FileUpload };
export type { FileItemData };
