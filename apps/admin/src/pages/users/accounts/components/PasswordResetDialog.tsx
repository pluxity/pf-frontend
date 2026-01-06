/**
 * 비밀번호 초기화 확인 다이얼로그
 */

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

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function PasswordResetDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isLoading,
}: PasswordResetDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>비밀번호 초기화</ModalTitle>
          <ModalDescription>
            <strong>{user?.name}</strong>({user?.email}) 사용자의 비밀번호를 초기화하시겠습니까?
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-500">초기화된 비밀번호는 이메일로 전송됩니다.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            취소
          </Button>
          <Button variant="error" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "처리 중..." : "초기화"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
