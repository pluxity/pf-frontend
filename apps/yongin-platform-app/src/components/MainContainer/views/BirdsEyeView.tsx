/**
 * 조감도 뷰 컴포넌트
 * @see https://github.com/pluxity/pf-frontend/issues/167
 */
import { useSystemSettings } from "@/hooks/useSystemSetting";
import { SettingsImageView } from "./SettingsImageView";

export function BirdsEyeView() {
  const { systemSettings, isLoading } = useSystemSettings();

  return (
    <SettingsImageView
      imageUrl={systemSettings?.aerialViewFile?.url}
      isLoading={isLoading}
      alt="현장 조감도"
      emptyMessage="조감도 이미지가 등록되지 않았습니다"
    />
  );
}
