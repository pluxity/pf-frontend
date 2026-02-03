import { useCallback, type ReactNode, type Ref } from "react";
import { cn } from "../../utils";
import { UploadZone } from "./UploadZone";
import { ThumbnailItem, type ThumbnailItemData } from "./ThumbnailItem";

export interface ImageUploadProps {
  value?: ThumbnailItemData[];
  onChange?: (images: ThumbnailItemData[]) => void;
  onUpload?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  title?: ReactNode;
  description?: string;
  buttonLabel?: string;
  thumbnailSize?: "sm" | "md" | "lg";
  layout?: "grid" | "horizontal";
  ref?: Ref<HTMLDivElement>;
}

function ImageUpload({
  value = [],
  onChange,
  onUpload,
  accept = "image/*",
  multiple = true,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 9,
  disabled = false,
  className,
  title = "이미지를 드래그하거나 클릭하여 업로드",
  description,
  buttonLabel = "이미지 선택",
  thumbnailSize = "md",
  layout = "grid",
  ref,
}: ImageUploadProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newImages: ThumbnailItemData[] = [];
      const imagesToUpload: File[] = [];

      files.forEach((file) => {
        if (value.length + newImages.length >= maxFiles) return;

        if (!file.type.startsWith("image/")) {
          return;
        }

        const imageItem: ThumbnailItemData = {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          url: URL.createObjectURL(file),
          status: "uploading",
          progress: 0,
        };

        if (file.size > maxSize) {
          imageItem.status = "error";
          imageItem.error = `${formatFileSize(maxSize)} 초과`;
        } else {
          imagesToUpload.push(file);
        }

        newImages.push(imageItem);
      });

      const updatedImages = [...value, ...newImages];
      onChange?.(updatedImages);

      if (imagesToUpload.length > 0) {
        onUpload?.(imagesToUpload);
      }
    },
    [value, onChange, onUpload, maxSize, maxFiles]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const imageToRemove = value.find((img) => img.id === id);
      if (imageToRemove?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      const updatedImages = value.filter((img) => img.id !== id);
      onChange?.(updatedImages);
    },
    [value, onChange]
  );

  const canAddMore = value.length < maxFiles;
  const defaultDescription = description ?? `PNG, JPG, GIF 최대 ${formatFileSize(maxSize)}`;

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {canAddMore && (
        <UploadZone
          onFilesSelected={handleFilesSelected}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          maxSize={maxSize}
          title={title}
          description={defaultDescription}
          buttonLabel={buttonLabel}
        />
      )}

      {value.length > 0 && (
        <div
          className={cn(
            layout === "grid"
              ? "grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6"
              : "flex flex-wrap gap-3"
          )}
        >
          {value.map((image) => (
            <ThumbnailItem
              key={image.id}
              item={image}
              onRemove={handleRemove}
              showProgress
              removable
              size={thumbnailSize}
            />
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-muted">
          {value.length} / {maxFiles} 이미지
        </p>
      )}
    </div>
  );
}

export { ImageUpload };
export type { ThumbnailItemData };
