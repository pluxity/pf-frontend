import { cn } from "@pf-dev/ui";
import { NoticeMarqueeProps } from "./types";

export function NoticeMarquee({
  content,
  speed = 30,
  gap = 4,
  repeatCount = 6,
  className,
}: NoticeMarqueeProps) {
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
