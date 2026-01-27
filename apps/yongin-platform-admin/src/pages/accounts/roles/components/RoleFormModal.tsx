import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Checkbox, Input, Label, Textarea } from "@pf-dev/ui/atoms";
import { Badge } from "@pf-dev/ui/atoms";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import type { RoleFormData, Permission, Role } from "../types";

const roleSchema = z.object({
  name: z.string().min(1, "역할명을 입력해주세요").max(50, "역할명은 50자 이내로 입력해주세요"),
  description: z.string().max(200, "설명은 200자 이내로 입력해주세요").optional(),
});

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePermissions: Permission[];
  onSubmit: (data: RoleFormData) => Promise<void>;
  isLoading?: boolean;
  editingRole?: Role | null;
}

const LEVEL_LABELS: Record<string, string> = {
  READ: "읽기",
  WRITE: "쓰기",
  ADMIN: "관리",
};

const LEVEL_VARIANTS: Record<
  string,
  "default" | "primary" | "success" | "warning" | "error" | "outline"
> = {
  READ: "default",
  WRITE: "primary",
  ADMIN: "error",
};

export function RoleFormModal({
  open,
  onOpenChange,
  availablePermissions,
  onSubmit,
  isLoading,
  editingRole,
}: RoleFormModalProps) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [expandedPermissionIds, setExpandedPermissionIds] = useState<number[]>([]);

  const isEditMode = !!editingRole;

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

  // 모달이 열릴 때 폼 초기화
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open && editingRole) {
      reset({
        name: editingRole.name,
        description: editingRole.description || "",
      });
      setSelectedPermissionIds(editingRole.permissions.map((p) => p.id));
    } else if (open) {
      reset({ name: "", description: "" });
      setSelectedPermissionIds([]);
    }
    setExpandedPermissionIds([]);
  }, [open, editingRole, reset]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleExpandToggle = (permissionId: number) => {
    setExpandedPermissionIds((prev) =>
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
    setExpandedPermissionIds([]);
  };

  const handleClose = () => {
    reset();
    setSelectedPermissionIds([]);
    setExpandedPermissionIds([]);
    onOpenChange(false);
  };

  const hasPermissionDetails = (permission: Permission) => {
    return (
      (permission.resourcePermissions && permission.resourcePermissions.length > 0) ||
      (permission.domainPermissions && permission.domainPermissions.length > 0)
    );
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-xl">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            <ModalTitle className="text-center font-bold">
              {isEditMode ? "역할 수정" : "새 역할 생성"}
            </ModalTitle>
            <ModalDescription className="text-center">
              {isEditMode ? "역할 정보를 수정합니다." : "새로운 역할을 생성합니다."}
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="name">역할명 *</Label>
              <Input id="name" placeholder="예: ADMIN, MANAGER, USER" {...register("name")} />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="역할에 대한 설명을 입력해주세요"
                rows={2}
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div>
              <Label>권한</Label>
              <p className="mb-2 text-sm text-gray-500">이 역할에 부여할 권한을 선택하세요.</p>
              {availablePermissions.length === 0 ? (
                <div className="rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-400">
                  사용 가능한 권한이 없습니다.
                </div>
              ) : (
                <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {availablePermissions.map((permission) => {
                    const isExpanded = expandedPermissionIds.includes(permission.id);
                    const hasDetails = hasPermissionDetails(permission);

                    return (
                      <div key={permission.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissionIds.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="flex-1 cursor-pointer text-sm font-medium"
                          >
                            {permission.name}
                          </label>
                          {hasDetails && (
                            <button
                              type="button"
                              onClick={() => handleExpandToggle(permission.id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? "접기" : "상세"}
                            </button>
                          )}
                        </div>

                        {permission.description && (
                          <p className="ml-7 text-xs text-gray-500">{permission.description}</p>
                        )}

                        {isExpanded && hasDetails && (
                          <div className="ml-7 space-y-1 rounded-md bg-gray-50 p-2">
                            {/* 도메인 권한 (전체 리소스) */}
                            {permission.domainPermissions?.map((dp, idx) => (
                              <div
                                key={`domain-${idx}`}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="text-gray-600">{dp.resourceType}</span>
                                <Badge
                                  variant={LEVEL_VARIANTS[dp.level] || "outline"}
                                  className="text-[10px]"
                                >
                                  {LEVEL_LABELS[dp.level] || dp.level} (전체)
                                </Badge>
                              </div>
                            ))}
                            {/* 개별 리소스 권한 */}
                            {permission.resourcePermissions?.map((rp, idx) => (
                              <div
                                key={`resource-${idx}`}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="text-gray-600">
                                  {rp.resourceType}: {rp.resourceId}
                                </span>
                                <Badge
                                  variant={LEVEL_VARIANTS[rp.level] || "outline"}
                                  className="text-[10px]"
                                >
                                  {LEVEL_LABELS[rp.level] || rp.level}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedPermissionIds.length > 0 && (
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">{selectedPermissionIds.length}개</span>의 권한이
                  선택되었습니다.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditMode
                  ? "수정 중..."
                  : "생성 중..."
                : isEditMode
                  ? "수정"
                  : "생성"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
