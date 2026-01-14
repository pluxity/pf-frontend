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
import type { Item } from "../types";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading,
}: DeleteConfirmDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>항목 삭제</ModalTitle>
          <ModalDescription>정말로 이 항목을 삭제하시겠습니까?</ModalDescription>
        </ModalHeader>

        <ModalBody>
          {item && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
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
