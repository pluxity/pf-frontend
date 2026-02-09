import { cn } from "@pf-dev/ui";

type GlassPanelVariant = "default" | "light" | "blue";

interface GlassPanelProps {
  variant?: GlassPanelVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<GlassPanelVariant, string> = {
  default: "bg-white/80",
  light: "bg-white/90",
  blue: "bg-[#E2E9F6]/80",
};

export function GlassPanel({ variant = "default", className, children }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "h-full rounded-[1.25rem] p-[0.9375rem] backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
