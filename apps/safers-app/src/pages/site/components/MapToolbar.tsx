import { cn } from "@pf-dev/ui";
import { Plus, Minus, Search } from "@pf-dev/ui/atoms";
import { GlassPanel } from "./GlassPanel";

interface MapToolbarProps {
  selectionMode?: boolean;
  onToggleSelection?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  className?: string;
}

function ToolButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        active ? "bg-[#4D7EFF] text-white" : "text-[#555] hover:bg-black/10"
      )}
    >
      {icon}
    </button>
  );
}

export function MapToolbar({
  selectionMode,
  onToggleSelection,
  onZoomIn,
  onZoomOut,
  className,
}: MapToolbarProps) {
  return (
    <div className={className}>
      <GlassPanel className="flex flex-col items-center gap-1 !rounded-xl !p-1.5">
        <ToolButton icon={<Plus size="sm" />} label="확대" onClick={onZoomIn} />
        <ToolButton icon={<Minus size="sm" />} label="축소" onClick={onZoomOut} />
        <div className="mx-1 h-px w-full bg-[#BBC0CF]/50" />
        <ToolButton
          icon={<Search size="sm" />}
          label={selectionMode ? "영역 검색 취소" : "영역 검색"}
          active={selectionMode}
          onClick={onToggleSelection}
        />
      </GlassPanel>
    </div>
  );
}
