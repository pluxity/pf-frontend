import useSWR from "swr";
import { cn } from "@pf-dev/ui";
import { announcementService } from "@/services";
import { NoticeMarqueeProps } from "./types";

export function NoticeMarquee({ speed = 30, gap = 4, className }: NoticeMarqueeProps) {
  const { data } = useSWR("/announcement", () => announcementService.get());

  // 마퀴 효과를 위해 콘텐츠 반복
  const content = data?.content || "";
  const repeatCount = 6;

  if (!content) {
    return null;
  }

  return (
    <div
      className={cn(
        className,
        "flex animate-marquee whitespace-nowrap 4k:text-4xl",
        gap && `gap-${gap}`
      )}
      style={{ animationDuration: `${speed}` }}
    >
      {Array.from({ length: repeatCount }).map((_, id) => (
        <span key={id}>{content}</span>
      ))}
    </div>
  );
}
