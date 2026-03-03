import { useState, useEffect, useMemo } from "react";
import { ImageUpload, type ThumbnailItemData } from "@pf-dev/ui/molecules";
import { Button } from "@pf-dev/ui/atoms";
import { uploadFile } from "../../services/fileService";
import { useSystemSetting, useUpdateSystemSetting } from "./hooks/useSystemSetting";
import { useToastContext } from "../../contexts/ToastContext";
import { systemSettingService } from "./services";
import type { UpdateSystemSetting } from "./types";

export function ThumbnailManagementPage() {
  const { toast } = useToastContext();
  const { data, isLoading } = useSystemSetting();
  const { updateSetting, isUpdating } = useUpdateSystemSetting();

  const originalState = useMemo(() => {
    if (!data) {
      return { overviewImages: [] as ThumbnailItemData[], bimImages: [] as ThumbnailItemData[] };
    }
    return {
      overviewImages: data.aerialViewFile?.id
        ? [
            {
              id: String(data.aerialViewFile.id),
              name: data.aerialViewFile.originalFileName,
              url: data.aerialViewFile.url,
              status: "complete" as const,
            },
          ]
        : [],
      bimImages: data.bimThumbnailFile?.id
        ? [
            {
              id: String(data.bimThumbnailFile.id),
              name: data.bimThumbnailFile.originalFileName,
              url: data.bimThumbnailFile.url,
              status: "complete" as const,
            },
          ]
        : [],
    };
  }, [data?.aerialViewFile?.id, data?.bimThumbnailFile?.id]);

  const [state, setState] = useState(originalState);

  useEffect(() => {
    setState(originalState);
  }, [originalState]);

  const hasChanges =
    state.overviewImages[0]?.id !== originalState.overviewImages[0]?.id ||
    state.bimImages[0]?.id !== originalState.bimImages[0]?.id;

  const handleUpload = async (files: File[], type: "overview" | "bim") => {
    const file = files[0];
    if (!file) return;

    try {
      const fileId = await uploadFile(file);
      const newImage: ThumbnailItemData = {
        id: String(fileId),
        name: file.name,
        url: URL.createObjectURL(file),
        status: "complete" as const,
      };

      if (type === "overview") {
        setState((prev) => ({
          ...prev,
          overviewImages: [newImage],
        }));
      } else {
        setState((prev) => ({
          ...prev,
          bimImages: [newImage],
        }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "업로드 실패");
    }
  };

  const handleSave = async () => {
    try {
      const latestSettings = await systemSettingService.get();

      const updateData: UpdateSystemSetting = {
        rollingIntervalSeconds: latestSettings.rollingIntervalSeconds ?? 5,
        aerialViewFileId:
          state.overviewImages.length > 0 ? parseInt(state.overviewImages[0]!.id) : null,
        bimThumbnailFileId: state.bimImages.length > 0 ? parseInt(state.bimImages[0]!.id) : null,
      };
      await updateSetting(updateData);
      toast.success("저장되었습니다");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장 실패");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">썸네일 관리</h1>
        <p className="mt-1 text-sm text-gray-500">조감도와 BIM 이미지를 각각 1개씩 업로드하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 조감도 */}
        <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">조감도</h3>
          <ImageUpload
            key={`overview-${state.overviewImages.length}`}
            value={state.overviewImages}
            onChange={(imgs) =>
              setState((prev) => ({
                ...prev,
                overviewImages: imgs,
              }))
            }
            onUpload={(files) => handleUpload(files, "overview")}
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
            title="선택하여 파일을 업로드하세요."
            accept="image/png,image/jpeg"
            description="PNG, JPG 최대 10MB"
            buttonLabel="이미지 선택"
            thumbnailSize="lg"
          />
        </div>

        {/* BIM */}
        <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">BIM</h3>
          <ImageUpload
            key={`bim-${state.bimImages.length}`}
            value={state.bimImages}
            onChange={(imgs) =>
              setState((prev) => ({
                ...prev,
                bimImages: imgs,
              }))
            }
            onUpload={(files) => handleUpload(files, "bim")}
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
            title="선택하여 파일을 업로드하세요."
            accept="image/png,image/jpeg"
            description="PNG, JPG 최대 10MB"
            buttonLabel="이미지 선택"
            thumbnailSize="lg"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setState(originalState)}>
          취소
        </Button>
        <Button onClick={handleSave} disabled={isUpdating || !hasChanges}>
          {isUpdating ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
