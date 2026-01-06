/**
 * 롤 생성 모달
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Checkbox, Input, Label, Textarea } from "@pf-dev/ui/atoms";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import type { RoleFormData, Permission } from "../types";

const roleSchema = z.object({
  name: z.string().min(1, "롤명을 입력해주세요").max(50, "롤명은 50자 이내로 입력해주세요"),
  description: z.string().max(200, "설명은 200자 이내로 입력해주세요").optional(),
});

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePermissions: Permission[];
  onSubmit: (data: RoleFormData) => Promise<void>;
  isLoading?: boolean;
}

export function RoleFormModal({
  open,
  onOpenChange,
  availablePermissions,
  onSubmit,
  isLoading,
}: RoleFormModalProps) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<RoleFormData, "permissionIds">>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleFormSubmit = async (data: Omit<RoleFormData, "permissionIds">) => {
    await onSubmit({
      ...data,
      permissionIds: selectedPermissionIds,
    });
    reset();
    setSelectedPermissionIds([]);
  };

  const handleClose = () => {
    reset();
    setSelectedPermissionIds([]);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            <ModalTitle>새 롤 생성</ModalTitle>
            <ModalDescription>새로운 롤을 생성합니다.</ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="name">롤명 *</Label>
              <Input id="name" placeholder="예: ADMIN, MANAGER, USER" {...register("name")} />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="롤에 대한 설명을 입력해주세요"
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div>
              <Label>권한</Label>
              <p className="mb-2 text-sm text-gray-500">이 롤에 부여할 권한을 선택하세요.</p>
              <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissionIds.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <Label htmlFor={`permission-${permission.id}`} className="cursor-pointer">
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
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
