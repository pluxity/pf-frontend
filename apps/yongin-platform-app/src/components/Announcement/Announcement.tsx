import { Button, cn } from "@pf-dev/ui";
import { useAnnouncement } from "@/hooks";
import { Marquee } from "../Marquee";

/** Marquee 동작 기준 글자 수 */
const MARQUEE_THRESHOLD = 50;

interface AnnouncementProps {
  className?: string;
}

/**
 * Footer용 안내사항 컴포넌트
 * - API에서 데이터 페칭
 * - 50자 초과 시 Marquee 애니메이션
 * - 50자 이하 시 정적 표시
 */
export function Announcement({ className }: AnnouncementProps) {
  const { content } = useAnnouncement();
  const shouldAnimate = content.length > MARQUEE_THRESHOLD;

  return (
    <div className={cn("flex items-center gap-4 4k:gap-8", className)}>
      <Button className="shrink-0 rounded-full 4k:text-4xl 4k:h-20 4k:px-10">안내사항</Button>
      <div className="flex-1">
        {content && (
          <Marquee animate={shouldAnimate} className="text-lg 4k:text-4xl">
            {content}
          </Marquee>
        )}
      </div>
    </div>
  );
}
