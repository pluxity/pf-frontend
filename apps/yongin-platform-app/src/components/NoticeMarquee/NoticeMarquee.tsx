import { cn } from "@pf-dev/ui";
import { NoticeMarqueeProps } from "./types";

const notice = [
  { content: "안내 방송이 들어갑니다." },
  { content: "용인 플랫폼 시티 1공구 스마트 건설 현장입니다." },
  { content: "안전에 유의하시기 바랍니다." },
  { content: "안내 방송이 들어갑니다." },
  { content: "용인 플랫폼 시티 1공구 스마트 건설 현장입니다." },
  { content: "안전에 유의하시기 바랍니다." },
  { content: "안내 방송이 들어갑니다." },
  { content: "용인 플랫폼 시티 1공구 스마트 건설 현장입니다." },
  { content: "안전에 유의하시기 바랍니다." },
];

export function NoticeMarquee({ speed = 30, gap = 4, className }: NoticeMarqueeProps) {
  return (
    <div
      className={cn(
        className,
        "flex animate-marquee whitespace-nowrap 4k:text-4xl",
        gap && `gap-${gap}`
      )}
      style={{ animationDuration: `${speed}` }}
    >
      {notice.map((list, id) => (
        <span key={id}>{list.content}</span>
      ))}
    </div>
  );
}
