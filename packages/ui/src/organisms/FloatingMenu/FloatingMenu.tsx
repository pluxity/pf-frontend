import { useState, type Ref } from "react";
import { cn } from "../../utils";

export interface FloatingMenuItemProps {
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  ref?: Ref<HTMLDivElement>;
}

export interface FloatingMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Logo text or element */
  logo?: React.ReactNode;
  /** Menu items */
  items: FloatingMenuItemProps[];
  /** Compact mode (icon/logo only, no text) */
  compact?: boolean;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  ref?: Ref<HTMLDivElement>;
}

function FloatingMenuItem({ label, href, active, onClick, ref }: FloatingMenuItemProps) {
  const itemClasses = cn(
    "flex h-10 w-full cursor-pointer items-center rounded-lg px-3 text-sm transition-colors",
    active ? "bg-[#66B3FF] font-bold text-brand" : "text-[#4D4D59] hover:bg-[#F5F5F7]"
  );

  const content = <span>{label}</span>;

  return (
    <div ref={ref}>
      {href ? (
        <a href={href} className={itemClasses} onClick={onClick}>
          {content}
        </a>
      ) : (
        <button type="button" className={itemClasses} onClick={onClick}>
          {content}
        </button>
      )}
    </div>
  );
}

const ToggleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="20"
    viewBox="0 0 24 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="0.75"
      y="0.75"
      width="22.5"
      height="18.5"
      rx="1.25"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <rect x="6" y="2" width="1.5" height="16" fill="currentColor" />
  </svg>
);

function FloatingMenu({
  className,
  logo = "PLUXITY",
  items,
  compact = false,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  ref,
  ...props
}: FloatingMenuProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const newExpanded = !expanded;
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    onExpandedChange?.(newExpanded);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-[#E6E6E8] bg-white transition-all",
        expanded
          ? "w-60 shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
          : compact
            ? "w-[100px] shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
            : "w-[200px] shadow-[0_4px_12px_rgba(0,0,0,0.10)]",
        className
      )}
      {...props}
    >
      <div className="flex h-12 items-center justify-between px-4">
        <div className="text-base font-bold text-brand">
          {typeof logo === "string" ? logo : logo}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-6 w-px bg-[#E6E6E8]" />
          <button
            type="button"
            onClick={handleToggle}
            className="flex h-8 w-8 items-center justify-center text-[#666673] transition-colors hover:text-[#333340]"
            aria-expanded={expanded}
            aria-label={expanded ? "메뉴 접기" : "메뉴 펼치기"}
          >
            <ToggleIcon className="h-5 w-6" />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <div className="mx-4 h-px bg-[#EDEDED]" />

          <div className="space-y-1 p-3">
            {items.map((item, index) => (
              <FloatingMenuItem key={index} {...item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { FloatingMenu, FloatingMenuItem };
