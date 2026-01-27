import { cn } from "@pf-dev/ui";

interface MarqueeProps {
  children: React.ReactNode;
  /** 애니메이션 동작 여부 */
  animate?: boolean;
  className?: string;
}

/**
 * 재사용 가능한 Marquee 컴포넌트
 * - animate=true: 컨테이너 오른쪽 끝에서 시작하여 왼쪽으로 스크롤
 * - animate=false: 정적 표시
 */
export function Marquee({ children, animate = false, className }: MarqueeProps) {
  if (!animate) {
    return (
      <div className="overflow-hidden">
        <span className={cn("inline-block whitespace-nowrap", className)}>{children}</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <span
        className={cn("inline-block whitespace-nowrap animate-marquee", className)}
        style={{ paddingLeft: "100%" }}
      >
        {children}
      </span>
    </div>
  );
}
