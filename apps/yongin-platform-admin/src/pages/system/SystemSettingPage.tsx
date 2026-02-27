import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  RadioGroup,
  RadioGroupItem,
} from "@pf-dev/ui/molecules";
import { Button } from "@pf-dev/ui/atoms";
import { useToastContext } from "@/contexts";
import { useSystemSetting, useUpdateSystemSetting } from "./hooks/useSystemSetting";
import type { UpdateSystemSetting } from "./types";

const INTERVAL_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0, label: "없음 (자동 전환 해제)" },
  { value: 5, label: "5초 (기본)" },
  { value: 10, label: "10초" },
  { value: 30, label: "30초" },
];

export function SystemSettingPage() {
  const { toast } = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | null>(null);

  const { setting, isLoading, error: loadError } = useSystemSetting();
  const { updateSetting, isUpdating, error: updateError } = useUpdateSystemSetting();

  const displayValue =
    isEditing && editValue !== null ? editValue : String(setting?.rollingIntervalSeconds ?? 0);

  useEffect(() => {
    if (loadError) {
      toast({
        title: "설정 조회 실패",
        description: "시스템 설정을 불러올 수 없습니다.",
        variant: "error",
      });
    }
  }, [loadError, toast]);

  useEffect(() => {
    if (updateError) {
      toast({
        title: "저장 실패",
        description: "설정 저장에 실패했습니다.",
        variant: "error",
      });
    }
  }, [updateError, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: UpdateSystemSetting = {
        rollingIntervalSeconds: parseInt(displayValue),
      };
      await updateSetting(updateData);

      toast({
        title: "저장 완료",
        description: "시스템 설정이 저장되었습니다.",
        variant: "success",
      });
      setIsEditing(false);
      setEditValue(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "설정 저장에 실패했습니다.";
      toast({
        title: "저장 실패",
        description: message || "설정 저장에 실패했습니다.",
        variant: "error",
      });
    }
  };

  const handleCancel = () => {
    setEditValue(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditValue(String(setting?.rollingIntervalSeconds ?? "0"));
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col space-y-6">
        <div className="mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">시스템 설정</h1>
            <p className="mt-1 text-sm text-gray-500">콘텐츠 전환 속도 조절을 관리합니다.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">로딩 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">시스템 설정</h1>
            <p className="mt-1 text-sm text-gray-500">콘텐츠 전환 속도 조절을 관리합니다.</p>
          </div>
          {!isEditing && (
            <Button type="button" onClick={handleEdit}>
              수정
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>콘텐츠 전환 속도</CardTitle>
          <CardDescription>대시보드의 콘텐츠 자동 전환 속도를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <RadioGroup value={displayValue} onValueChange={setEditValue} disabled={!isEditing}>
                {INTERVAL_OPTIONS.map((option) => (
                  <RadioGroupItem
                    key={option.value}
                    id={`interval-${option.value}`}
                    value={String(option.value)}
                    label={option.label}
                    disabled={!isEditing}
                  />
                ))}
              </RadioGroup>
            </div>

            {isEditing && (
              <div className="flex gap-2 border-t border-gray-200 pt-4">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  취소
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
