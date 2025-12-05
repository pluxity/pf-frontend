import type { Ref } from "react";
import { X, File, Image, FileText, CheckCircle, AlertCircle } from "../../atoms/Icon";
import { cn } from "../../utils";
import { Button } from "../../atoms/Button";

export interface FileItemData {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status?: "uploading" | "complete" | "error";
  error?: string;
}

export interface FileItemProps extends React.HTMLAttributes<HTMLDivElement> {
  file: FileItemData;
  onRemove?: (id: string) => void;
  showProgress?: boolean;
  removable?: boolean;
  ref?: Ref<HTMLDivElement>;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const FileIconComponent = ({ type, className }: { type: string; className?: string }) => {
  if (type.startsWith("image/")) return <Image size="md" className={className} />;
  if (type.includes("pdf")) return <FileText size="md" className={className} />;
  return <File size="md" className={className} />;
};

function FileItem({
  file,
  onRemove,
  showProgress = true,
  removable = true,
  className,
  ref,
  ...props
}: FileItemProps) {
  const isError = file.status === "error" || !!file.error;
  const isComplete = file.status === "complete";
  const isUploading =
    file.status === "uploading" || (file.progress !== undefined && file.progress < 100);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-[#F9F9FC] p-3",
        isError ? "border-error-brand bg-[#FEF2F2]" : "border-[#E5E5EA]",
        className
      )}
      {...props}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white">
        <FileIconComponent
          type={file.type}
          className={isError ? "text-error-brand" : "text-[#808088]"}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#333340]">{file.name}</p>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs", isError ? "text-error-brand" : "text-[#808088]")}>
            {file.error || formatFileSize(file.size)}
          </span>
          {isUploading && file.progress !== undefined && (
            <span className="text-xs text-brand">{file.progress}%</span>
          )}
        </div>

        {showProgress && isUploading && file.progress !== undefined && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E5E5EA]">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>

      {isComplete && <CheckCircle size="md" className="flex-shrink-0 text-success-brand" />}
      {isError && <AlertCircle size="md" className="flex-shrink-0 text-error-brand" />}

      {removable && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(file.id)}
          className="h-8 w-8 flex-shrink-0 p-0 text-[#808088] hover:bg-[#E5E5EA] hover:text-error-brand"
        >
          <X size="sm" />
        </Button>
      )}
    </div>
  );
}

export { FileItem };
