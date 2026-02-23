import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  Button,
} from "@pf-dev/ui";
import { ConfirmDialogProps } from "../types";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange?.(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm}>확인</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
