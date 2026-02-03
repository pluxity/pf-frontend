import { Badge, cn } from "@pf-dev/ui";
import { useAnnouncement } from "@/hooks";
import { Marquee } from "../Marquee";

const MARQUEE_THRESHOLD = 50;

interface AnnouncementProps {
  className?: string;
}

export function Announcement({ className }: AnnouncementProps) {
  const { content } = useAnnouncement();
  const shouldAnimate = content.length > MARQUEE_THRESHOLD;

  return (
    <div className={cn("flex w-full items-center gap-4", className)}>
      <Badge variant="primary" className="shrink-0 px-5 py-1">
        안내사항
      </Badge>
      <div className="flex-1 min-w-0">
        {content && (
          <Marquee animate={shouldAnimate} className="text-lg font-semibold">
            {content}
          </Marquee>
        )}
      </div>
    </div>
  );
}
