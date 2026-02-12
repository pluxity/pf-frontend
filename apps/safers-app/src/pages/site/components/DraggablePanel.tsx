import { useState, useRef } from "react";
import { cn } from "@pf-dev/ui";
import { ChevronUp } from "@pf-dev/ui/atoms";
import { GlassPanel } from "./GlassPanel";
import type { ReactNode } from "react";

type GlassPanelVariant = "default" | "light" | "blue";

let topZIndex = 40;

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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el) return;

    // 클릭한 패널을 최상위로
    el.style.zIndex = String(++topZIndex);

    // 버튼 클릭 시 드래그 시작하지 않음
    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault();
    el.style.cursor = "grabbing";
    const startX = e.clientX - posRef.current.x;
    const startY = e.clientY - posRef.current.y;

    // 트랜스폼 없는 원래 CSS 위치 계산
    const rect = el.getBoundingClientRect();
    const naturalLeft = rect.left - posRef.current.x;
    const naturalTop = rect.top - posRef.current.y;
    const w = rect.width;
    const h = rect.height;

    const onMove = (ev: PointerEvent) => {
      let newX = ev.clientX - startX;
      let newY = ev.clientY - startY;

      // 뷰포트 경계 제한
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

  return (
    <div
      ref={panelRef}
      onPointerDown={handlePointerDown}
      className={cn("cursor-grab select-none active:cursor-grabbing", className)}
      style={{ willChange: "transform" }}
    >
      <GlassPanel variant={variant} className={cn("flex flex-col", !collapsed && "h-full")}>
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-[-0.03125rem] text-[#333]">{title}</span>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-6 w-6 items-center justify-center rounded text-[#666] transition-colors hover:bg-black/10"
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
