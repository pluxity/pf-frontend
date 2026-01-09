import { useState } from "react";
import { Button, Checkbox, Label } from "@pf-dev/ui/atoms";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import type { User, Role, UserRolesUpdateData } from "../types";

interface RoleEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  availableRoles: Role[];
  onSubmit: (data: UserRolesUpdateData) => Promise<void>;
  isLoading?: boolean;
}

function RoleEditForm({
  user,
  availableRoles,
  onSubmit,
  onCancel,
  isLoading,
}: {
  user: User;
  availableRoles: Role[];
  onSubmit: (data: UserRolesUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(user.roles.map((r) => r.id));

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    await onSubmit({ roleIds: selectedRoleIds });
  };

  return (
    <ModalContent>
      <ModalHeader>
        <ModalTitle>{user.name} - 롤 수정</ModalTitle>
        <ModalDescription>사용자에게 할당할 롤을 선택하세요.</ModalDescription>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-3">
          {availableRoles.map((role) => (
            <div key={role.id} className="flex items-center gap-3">
              <Checkbox
                id={`role-${role.id}`}
                checked={selectedRoleIds.includes(role.id)}
                onCheckedChange={() => handleRoleToggle(role.id)}
              />
              <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                <span className="font-medium">{role.name}</span>
                <span className="ml-2 text-sm text-gray-400">
                  ({role.permissions.map((p) => p.name).join(", ")})
                </span>
              </Label>
            </div>
          ))}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || selectedRoleIds.length === 0}>
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export function RoleEditModal({
  open,
  onOpenChange,
  user,
  availableRoles,
  onSubmit,
  isLoading,
}: RoleEditModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {user && (
        <RoleEditForm
          key={user.id}
          user={user}
          availableRoles={availableRoles}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      )}
    </Modal>
  );
}
