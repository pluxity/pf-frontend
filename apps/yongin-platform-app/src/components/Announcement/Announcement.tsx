import { useRef, useState, useEffect } from "react";
import { Button, cn } from "@pf-dev/ui";
import { useAnnouncement } from "@/hooks";

interface AnnouncementProps {
  className?: string;
}

/**
 * Footer용 안내사항 컴포넌트
 * - API에서 데이터 페칭
 * - 콘텐츠가 컨테이너보다 길면 Marquee 애니메이션
 * - 짧으면 정적 표시
 */
export function Announcement({ className }: AnnouncementProps) {
  const { content } = useAnnouncement();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setShouldAnimate(contentWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [content]);

  return (
    <div className={cn("flex items-center gap-4 4k:gap-8", className)}>
      <Button className="shrink-0 rounded-full 4k:text-4xl 4k:h-20 4k:px-10">안내사항</Button>
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {content && (
          <span
            ref={contentRef}
            className={cn(
              "inline-block whitespace-nowrap 4k:text-4xl",
              shouldAnimate && "animate-marquee"
            )}
          >
            {content}
          </span>
        )}
      </div>
    </div>
  );
}
