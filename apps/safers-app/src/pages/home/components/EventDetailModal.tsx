import { Badge } from "@pf-dev/ui";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle } from "@pf-dev/ui/organisms";
import { EVENT_TYPE_SEVERITY, EVENT_SEVERITY_STYLES, type Event } from "@/services";

interface EventDetailModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateTime(timestamp: string): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function MediaSection({ event }: { event: Event }) {
  if (event.video?.url) {
    return (
      <div className="overflow-hidden rounded-lg bg-black">
        <video
          src={event.video.url}
          controls
          autoPlay
          muted
          playsInline
          className="w-full max-h-[20rem] object-contain"
        />
      </div>
    );
  }

  if (event.snapshot?.url) {
    return (
      <div className="overflow-hidden rounded-lg bg-neutral-100">
        <img
          src={event.snapshot.url}
          alt={`${event.name} 스냅샷`}
          className="w-full max-h-[20rem] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-[10rem] items-center justify-center rounded-lg bg-neutral-50 text-sm text-neutral-400">
      미디어 없음
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-800">{value}</span>
    </div>
  );
}

export function EventDetailModal({ event, open, onOpenChange }: EventDetailModalProps) {
  if (!event) return null;

  const severity = EVENT_TYPE_SEVERITY[event.type];
  const severityStyle = EVENT_SEVERITY_STYLES[severity];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Badge variant={null} className={`rounded ${severityStyle.bg} ${severityStyle.text}`}>
              {severityStyle.label}
            </Badge>
            <ModalTitle className="text-lg">{event.name}</ModalTitle>
          </div>
          <p className="mt-1 text-xs text-neutral-400">{formatDateTime(event.timestamp)}</p>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          <MediaSection event={event} />

          <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100 px-4">
            <InfoRow label="현장" value={event.site.name} />
            <InfoRow
              label="카테고리"
              value={event.category === "DETECTION" ? "객체탐지" : "영역/경계선"}
            />
            <InfoRow label="신뢰도" value={`${Math.round(event.confidence * 100)}%`} />
            {event.path && <InfoRow label="CCTV" value={event.path} />}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
