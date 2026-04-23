import { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalClose,
  ModalTitle,
  ModalPortal,
  ModalOverlay,
} from "@pf-dev/ui/organisms";
import { X } from "@pf-dev/ui/atoms";
import { Spinner } from "@pf-dev/ui";
import { TimelapseTimeline } from "./TimelapseTimeline";
import { TimelapseViewer } from "./TimelapseViewer";
import { useTimelapseStore } from "./timelapse.store";

interface TimelapseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimelapseModal({ open, onOpenChange }: TimelapseModalProps) {
  const schedule = useTimelapseStore((s) => s.schedule);
  const isLoading = useTimelapseStore((s) => s.isLoading);
  const { reset, loadSchedule } = useTimelapseStore();

  useEffect(() => {
    if (open && !schedule) {
      loadSchedule();
    }
  }, [open, schedule, loadSchedule]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalPortal>
        <ModalOverlay className="!bg-black/40" />
      </ModalPortal>
      <ModalContent
        showClose={false}
        aria-describedby={undefined}
        className="!max-w-[95vw] !w-[95vw] !h-[90vh] !rounded-2xl !bg-[#1A1D2E] !p-0 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-[#ff7500] to-[#e66a00] px-5 py-2.5">
          <ModalTitle className="!text-sm !font-bold !text-white">4D TimeLine</ModalTitle>
          <ModalClose className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/20 hover:text-white">
            <X size="sm" />
            <span className="sr-only">닫기</span>
          </ModalClose>
        </div>

        {isLoading || !schedule ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-[#ff7500] to-[#e66a00]">
              <TimelapseTimeline />
            </div>
            <div className="flex-1 min-h-0">
              <TimelapseViewer />
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
