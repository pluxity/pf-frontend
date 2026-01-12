import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import { Button } from "@pf-dev/ui/atoms";
import type { User } from "../types";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  count?: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  user,
  count = 0,
  onConfirm,
  isLoading,
}: DeleteConfirmDialogProps) {
  const isBulkDelete = !user && count > 0;
  const title = isBulkDelete ? `${count}명의 사용자 삭제` : "사용자 삭제";
  const description = isBulkDelete
    ? `선택한 ${count}명의 사용자를 삭제하시겠습니까?`
    : "정말로 이 사용자를 삭제하시겠습니까?";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>

        <ModalBody>
          {user && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">
                {user.department} / {user.role}
              </p>
            </div>
          )}
          <p className="mt-4 text-sm text-red-600">이 작업은 되돌릴 수 없습니다.</p>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" variant="error" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "삭제 중..." : "삭제"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
