import { cn } from "@pf-dev/ui";

interface MarqueeProps {
  children: React.ReactNode;
  animate?: boolean;
  duration?: number;
  className?: string;
}

export function Marquee({ children, animate = false, duration = 15, className }: MarqueeProps) {
  if (!animate) {
    return (
      <div className="overflow-hidden text-center">
        <span className={cn("inline-block whitespace-nowrap", className)}>{children}</span>
      </div>
    );
  }

  return (
    <div className="relative h-6 overflow-hidden">
      <div
        className="absolute top-0 left-full inline-flex whitespace-nowrap will-change-transform animate-marquee"
        style={{ animationDuration: `${duration}s` }}
      >
        <span className={cn("shrink-0", className)} style={{ paddingRight: "100vw" }}>
          {children}
        </span>
        <span className={cn("shrink-0", className)} style={{ paddingRight: "100vw" }} aria-hidden>
          {children}
        </span>
      </div>
    </div>
  );
}
