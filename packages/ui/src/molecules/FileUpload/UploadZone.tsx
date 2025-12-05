import { useState, useCallback, useRef, type Ref } from "react";
import { Upload } from "../../atoms/Icon";
import { cn } from "../../utils";
import { Button } from "../../atoms/Button";

export interface UploadZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  title?: string;
  description?: string;
  buttonLabel?: string;
  maxSize?: number;
  ref?: Ref<HTMLDivElement>;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

function UploadZone({
  onFilesSelected,
  accept,
  multiple = true,
  disabled = false,
  title = "파일을 드래그하거나 클릭하여 업로드",
  description,
  buttonLabel = "파일 선택",
  maxSize = 10 * 1024 * 1024,
  className,
  ref,
  ...props
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList);
      onFilesSelected?.(files);
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const defaultDescription = description ?? `PNG, JPG, PDF 최대 ${formatFileSize(maxSize)}`;

  return (
    <div
      ref={ref}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-[#F9F9FC] p-6 transition-colors",
        isDragging ? "border-brand bg-[#F0F4FF]" : "border-[#CCCCD8] hover:border-brand",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        className="hidden"
      />

      <Upload size="xl" className="text-[#808088]" />

      <div className="text-center">
        <p className="text-sm font-medium text-[#333340]">{title}</p>
        <p className="mt-1 text-xs text-[#808088]">{defaultDescription}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export { UploadZone };
