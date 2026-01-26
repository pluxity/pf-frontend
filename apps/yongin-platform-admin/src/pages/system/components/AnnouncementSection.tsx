import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@pf-dev/ui/molecules";
import { Button, Label, Textarea } from "@pf-dev/ui/atoms";
import { useToastContext } from "@/contexts";
import { useAnnouncement, useUpdateAnnouncement } from "../hooks";
import type { AnnouncementFormData } from "../types";

const announcementSchema = z.object({
  content: z.string().min(1, "안내사항 내용을 입력해주세요"),
});

export function AnnouncementSection() {
  const { toast } = useToastContext();
  const { announcement, isLoading, mutate } = useAnnouncement();
  const { updateAnnouncement, isUpdating } = useUpdateAnnouncement();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { content: "" },
  });

  useEffect(() => {
    if (announcement) {
      reset({ content: announcement.content });
    }
  }, [announcement, reset]);

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      await updateAnnouncement(data);
      await mutate();
      toast({
        title: "저장 완료",
        description: "안내사항이 수정되었습니다.",
        variant: "success",
      });
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "안내사항 수정에 실패했습니다";
      toast({
        title: "저장 실패",
        description: message,
        variant: "error",
      });
    }
  };

  const handleCancel = () => {
    reset({ content: announcement?.content ?? "" });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>안내사항</CardTitle>
        <CardDescription>플랫폼 사용자에게 표시되는 안내 메시지를 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">안내 내용</Label>
            <Textarea
              id="content"
              rows={6}
              disabled={!isEditing}
              placeholder="안내사항을 입력하세요"
              {...register("content")}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
          </div>

          {announcement?.updatedAt && (
            <p className="text-sm text-gray-500">
              마지막 수정: {new Date(announcement.updatedAt).toLocaleString("ko-KR")}
            </p>
          )}

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button type="submit" disabled={isUpdating || !isDirty}>
                  {isUpdating ? "저장 중..." : "저장"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                수정
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
