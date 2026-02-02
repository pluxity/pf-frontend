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
      <span
        className={cn(
          "absolute top-0 left-0 whitespace-nowrap will-change-transform animate-marquee",
          className
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
      </span>
    </div>
  );
}
