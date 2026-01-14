import { Button } from "@pf-dev/ui/atoms";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import type { User } from "../types";

interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isLoading,
}: UserDeleteDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>사용자 삭제</ModalTitle>
          <ModalDescription>
            <strong>{user?.name}</strong>({user?.username}) 사용자를 삭제하시겠습니까?
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-500">
            삭제된 사용자는 복구할 수 없습니다. 신중하게 결정해주세요.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            취소
          </Button>
          <Button variant="error" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "삭제 중..." : "삭제"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
