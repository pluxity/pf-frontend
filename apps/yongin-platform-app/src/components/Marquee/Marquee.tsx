import { cn } from "@pf-dev/ui";

interface MarqueeProps {
  children: React.ReactNode;
  /** 애니메이션 동작 여부 */
  animate?: boolean;
  className?: string;
}

/**
 * 재사용 가능한 Marquee 컴포넌트
 * - animate=true: 오른쪽에서 왼쪽으로 스크롤
 * - animate=false: 정적 표시
 */
export function Marquee({ children, animate = false, className }: MarqueeProps) {
  return (
    <div className="overflow-hidden">
      <span
        className={cn("inline-block whitespace-nowrap", animate && "animate-marquee", className)}
      >
        {children}
      </span>
    </div>
  );
}
