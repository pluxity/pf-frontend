/**
 * 권한 생성 모달
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label, Textarea } from "@pf-dev/ui/atoms";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import type { PermissionFormData } from "../types";

const permissionSchema = z.object({
  name: z.string().min(1, "권한명을 입력해주세요").max(50, "권한명은 50자 이내로 입력해주세요"),
  description: z.string().max(200, "설명은 200자 이내로 입력해주세요").optional(),
});

interface PermissionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PermissionFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PermissionFormModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: PermissionFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFormSubmit = async (data: PermissionFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            <ModalTitle>새 권한 생성</ModalTitle>
            <ModalDescription>새로운 권한을 생성합니다.</ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="name">권한명 *</Label>
              <Input id="name" placeholder="예: READ, WRITE, DELETE" {...register("name")} />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="권한에 대한 설명을 입력해주세요"
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "생성 중..." : "생성"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
