import useSWR from "swr";
import { Button, cn } from "@pf-dev/ui";
import { announcementService } from "@/services";

interface AnnouncementProps {
  className?: string;
}

export function Announcement({ className }: AnnouncementProps) {
  const { data } = useSWR("/announcement", () => announcementService.get());

  const content = data?.content || "";
  const repeatCount = 6;

  return (
    <div className={cn("flex items-center gap-4 4k:gap-8", className)}>
      <Button className="rounded-full 4k:text-4xl 4k:h-20 4k:px-10">안내사항</Button>
      <div className="flex-1 overflow-hidden">
        {content && (
          <div className="flex animate-marquee whitespace-nowrap gap-4 4k:text-4xl 4k:gap-8">
            {Array.from({ length: repeatCount }).map((_, id) => (
              <span key={id}>{content}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
