import { cn } from "@pf-dev/ui";
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
      <img
        src={`${import.meta.env.BASE_URL}assets/icons/announcement.svg`}
        alt="안내사항"
        className="w-5 h-5"
      />
      <div className="flex-1 min-w-0">
        {content && (
          <Marquee animate={shouldAnimate} className="text-sm font-semibold">
            {content}
          </Marquee>
        )}
      </div>
    </div>
  );
}
