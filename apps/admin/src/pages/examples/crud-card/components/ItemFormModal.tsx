import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import { Button, Input, Textarea, Label } from "@pf-dev/ui/atoms";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@pf-dev/ui/molecules";
import type { Item, ItemFormData } from "../types";

const formSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().min(1, "설명을 입력해주세요"),
  thumbnail: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]),
});

interface ItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
  onSubmit: (data: ItemFormData) => void;
  isLoading?: boolean;
}

export function ItemFormModal({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading,
}: ItemFormModalProps) {
  const isEdit = !!item;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail || "",
        status: item.status,
      });
    } else {
      reset();
    }
  }, [item, reset]);

  const handleFormSubmit = (data: ItemFormData) => {
    onSubmit(data);
  };

  const currentStatus = watch("status");

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            <ModalTitle>{isEdit ? "항목 수정" : "새 항목 추가"}</ModalTitle>
            <ModalDescription>
              {isEdit ? "항목 정보를 수정합니다." : "새로운 항목을 추가합니다."}
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label>
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input {...register("title")} placeholder="제목을 입력하세요" />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>
                설명 <span className="text-red-500">*</span>
              </Label>
              <Textarea {...register("description")} placeholder="설명을 입력하세요" rows={3} />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>썸네일 URL</Label>
              <Input {...register("thumbnail")} placeholder="https://..." />
              {errors.thumbnail && (
                <p className="text-sm text-red-500">{errors.thumbnail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                상태 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentStatus}
                onValueChange={(value) => setValue("status", value as ItemFormData["status"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">초안</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : isEdit ? "수정" : "추가"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
