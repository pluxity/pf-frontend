import { cn } from "@pf-dev/ui";

interface MarqueeProps {
  children: React.ReactNode;
  animate?: boolean;
  className?: string;
}

export function Marquee({ children, animate = false, className }: MarqueeProps) {
  if (!animate) {
    return (
      <div className="overflow-hidden text-center">
        <span className={cn("inline-block whitespace-nowrap", className)}>{children}</span>
      </div>
    );
  }

  return (
    <div className="relative h-6 overflow-hidden 4k:h-12">
      <span className={cn("absolute top-0 whitespace-nowrap animate-marquee", className)}>
        {children}
      </span>
    </div>
  );
}
