import { cn } from "@pf-dev/ui";

type GlassPanelVariant = "default" | "light" | "blue" | "dark";

interface GlassPanelProps {
  variant?: GlassPanelVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<GlassPanelVariant, string> = {
  default: "bg-white/70",
  light: "bg-white/70",
  blue: "bg-[#E2E9F6]/80",
  dark: "bg-[#1A1D2E]/70 border border-white/10",
};

export function GlassPanel({ variant = "default", className, children }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] p-[0.9375rem] backdrop-blur-md",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
