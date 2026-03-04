import { useState, useRef, useLayoutEffect } from "react";
import { cn } from "@pf-dev/ui";
import { ChevronUp } from "@pf-dev/ui/atoms";
import { GlassPanel } from "./GlassPanel";
import type { ReactNode } from "react";

type GlassPanelVariant = "default" | "light" | "blue" | "dark";

let topZIndex = 40;

const VIEWPORT_MARGIN = 40;

interface DraggablePanelProps {
  title: string;
  variant?: GlassPanelVariant;
  defaultCollapsed?: boolean;
  className?: string;
  children: ReactNode;
}

export function DraggablePanel({
  title,
  variant,
  defaultCollapsed = false,
  className,
  children,
}: DraggablePanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const panelRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  const toggleCollapse = () => {
    setCollapsed((c) => !c);
  };

  // 펼친 뒤 뷰포트 아래로 넘치면 위로 밀어올림
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (collapsed || !el) return;

    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const overflowBottom = rect.bottom - (window.innerHeight - VIEWPORT_MARGIN);
      if (overflowBottom > 0) {
        posRef.current.y -= overflowBottom;
        el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }
    });
  }, [collapsed]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el) return;

    el.style.zIndex = String(++topZIndex);

    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault();
    el.style.cursor = "grabbing";
    const startX = e.clientX - posRef.current.x;
    const startY = e.clientY - posRef.current.y;

    const rect = el.getBoundingClientRect();
    const naturalLeft = rect.left - posRef.current.x;
    const naturalTop = rect.top - posRef.current.y;
    const w = rect.width;
    const h = rect.height;

    const onMove = (ev: PointerEvent) => {
      let newX = ev.clientX - startX;
      let newY = ev.clientY - startY;

      newX = Math.max(-naturalLeft, Math.min(window.innerWidth - w - naturalLeft, newX));
      newY = Math.max(-naturalTop, Math.min(window.innerHeight - h - naturalTop, newY));

      posRef.current.x = newX;
      posRef.current.y = newY;
      el.style.transform = `translate(${newX}px, ${newY}px)`;
    };

    const onUp = () => {
      el.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const isDark = variant === "dark";

  return (
    <div
      ref={panelRef}
      onPointerDown={handlePointerDown}
      className={cn("cursor-grab select-none active:cursor-grabbing", className)}
      style={{ willChange: "transform" }}
    >
      <GlassPanel variant={variant} className="flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-sm font-bold tracking-[-0.03125rem]",
              isDark ? "text-white" : "text-[#333]"
            )}
          >
            {title}
          </span>
          <button
            type="button"
            onClick={toggleCollapse}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded transition-colors",
              isDark ? "text-white/60 hover:bg-white/10" : "text-[#666] hover:bg-black/10"
            )}
            aria-label={collapsed ? "패널 펼치기" : "패널 접기"}
          >
            <ChevronUp
              size="xs"
              className={cn(
                "!h-[0.75rem] !w-[0.75rem] transition-transform duration-200",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {!collapsed && children}
      </GlassPanel>
    </div>
  );
}
