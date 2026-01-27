import { Button, cn } from "@pf-dev/ui";
import { useAnnouncement } from "@/hooks";

interface AnnouncementProps {
  className?: string;
  /** Marquee 반복 횟수 */
  repeatCount?: number;
}

/**
 * Footer용 안내사항 컴포넌트
 * - API에서 데이터 페칭
 * - Marquee 애니메이션으로 표시
 */
export function Announcement({ className, repeatCount = 6 }: AnnouncementProps) {
  const { content } = useAnnouncement();

  return (
    <div className={cn("flex items-center gap-4 4k:gap-8", className)}>
      <Button className="rounded-full 4k:text-4xl 4k:h-20 4k:px-10">안내사항</Button>
      <div className="flex-1 overflow-hidden">
        {content && (
          <div className="flex animate-marquee whitespace-nowrap gap-4 4k:text-4xl 4k:gap-8">
            {Array.from({ length: repeatCount }).map((_, idx) => (
              <span key={idx}>{content}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
