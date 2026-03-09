/**
 * BIM 뷰 컴포넌트
 * @see https://github.com/pluxity/pf-frontend/issues/168
 */
import { useSystemSettings } from "@/hooks/useSystemSetting";
import { SettingsImageView } from "./SettingsImageView";

export function BIMView() {
  const { systemSettings, isLoading } = useSystemSettings();

  return (
    <SettingsImageView
      imageUrl={systemSettings?.bimThumbnailFile?.url}
      isLoading={isLoading}
      alt="BIM 썸네일"
      emptyMessage="BIM 썸네일이 등록되지 않았습니다"
    />
  );
}
