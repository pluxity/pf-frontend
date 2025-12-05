import { useState, type Ref } from "react";
import { X, CheckCircle, AlertCircle, Image as ImageIcon } from "../../atoms/Icon";
import { cn } from "../../utils";

export interface ThumbnailItemData {
  id: string;
  name: string;
  url?: string;
  progress?: number;
  status?: "uploading" | "complete" | "error";
  error?: string;
}

export interface ThumbnailItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: ThumbnailItemData;
  onRemove?: (id: string) => void;
  showProgress?: boolean;
  removable?: boolean;
  size?: "sm" | "md" | "lg";
  ref?: Ref<HTMLDivElement>;
}

const sizeMap = {
  sm: { container: "w-[80px]", image: "h-[80px]" },
  md: { container: "w-[120px]", image: "h-[100px]" },
  lg: { container: "w-[160px]", image: "h-[130px]" },
};

function ThumbnailItem({
  item,
  onRemove,
  showProgress = true,
  removable = true,
  size = "md",
  className,
  ref,
  ...props
}: ThumbnailItemProps) {
  const [imageError, setImageError] = useState(false);
  const isError = item.status === "error" || !!item.error;
  const isComplete = item.status === "complete";
  const isUploading =
    item.status === "uploading" || (item.progress !== undefined && item.progress < 100);
  const sizeClasses = sizeMap[size];

  return (
    <div
      ref={ref}
      className={cn("relative flex flex-col", sizeClasses.container, className)}
      {...props}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border bg-[#F9F9FC]",
          isError ? "border-error-brand" : "border-[#E5E5EA]",
          sizeClasses.image
        )}
      >
        {item.url && !imageError ? (
          <img
            src={item.url}
            alt={item.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon size="lg" className="text-[#C4C4CC]" />
          </div>
        )}

        {showProgress && isUploading && item.progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-1">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-white">{item.progress}%</span>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
            <CheckCircle size="sm" className="text-[#3AB58E]" />
          </div>
        )}
        {isError && (
          <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
            <AlertCircle size="sm" className="text-error-brand" />
          </div>
        )}

        {removable && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F24C4C] text-white shadow-sm transition-colors hover:bg-[#D93636]"
          >
            <X size="xs" />
          </button>
        )}
      </div>

      <p className="mt-1.5 truncate text-xs text-[#808088]" title={item.name}>
        {item.name}
      </p>

      {item.error && (
        <p className="truncate text-xs text-error-brand" title={item.error}>
          {item.error}
        </p>
      )}
    </div>
  );
}

export { ThumbnailItem };
