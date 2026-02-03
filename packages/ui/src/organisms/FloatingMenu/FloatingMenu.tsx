import { useState, createContext, useContext, type Ref } from "react";
import { cn } from "../../utils";

interface FloatingMenuContextValue {
  expanded: boolean;
}

const FloatingMenuContext = createContext<FloatingMenuContextValue | null>(null);

const useFloatingMenuContext = () => {
  const context = useContext(FloatingMenuContext);
  if (!context) {
    throw new Error("FloatingMenu compound components must be used within FloatingMenu");
  }
  return context;
};

export interface FloatingMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Logo text or element */
  logo?: React.ReactNode;
  /** Children (composition pattern) */
  children?: React.ReactNode;
  /** Compact mode (icon/logo only, no text) */
  compact?: boolean;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Aria label for collapse button */
  ariaLabelCollapse?: string;
  /** Aria label for expand button */
  ariaLabelExpand?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface FloatingMenuItemProps extends React.HTMLAttributes<HTMLElement> {
  /** Item content */
  children: React.ReactNode;
  /** Icon element */
  icon?: React.ReactNode;
  /** Link href (renders as <a> instead of <button>) */
  href?: string;
  /** Active state */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface FloatingMenuSeparatorProps {
  className?: string;
}

export interface FloatingMenuGroupProps {
  /** Group label */
  label: string;
  /** Group items */
  children: React.ReactNode;
  className?: string;
}

export interface FloatingMenuCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
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

function FloatingMenuItem({
  children,
  icon,
  href,
  active,
  onClick,
  className,
  ...props
}: FloatingMenuItemProps) {
  const itemClasses = cn(
    "flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    active ? "bg-[#66B3FF] font-bold text-brand" : "text-[#4D4D59] hover:bg-[#F5F5F7]",
    className
  );

  const content = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={itemClasses} onClick={onClick} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={itemClasses} onClick={onClick} {...props}>
      {content}
    </button>
  );
}

function FloatingMenuSeparator({ className }: FloatingMenuSeparatorProps) {
  return <div className={cn("mx-2 my-1 h-px bg-[#EDEDED]", className)} />;
}

function FloatingMenuGroup({ label, children, className }: FloatingMenuGroupProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="px-3 py-1.5 text-xs font-semibold text-[#999999]">{label}</div>
      {children}
    </div>
  );
}

function FloatingMenuCustom({ children, className }: FloatingMenuCustomProps) {
  return <div className={cn("px-3 py-2", className)}>{children}</div>;
}

function FloatingMenu({
  className,
  logo = "PLUXITY",
  children,
  compact = false,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  ariaLabelCollapse = "메뉴 접기",
  ariaLabelExpand = "메뉴 펼치기",
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

  const contextValue: FloatingMenuContextValue = { expanded };

  return (
    <FloatingMenuContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-[#E6E6E8] bg-white",
          "motion-safe:transition-[width,box-shadow]",
          "motion-reduce:transition-none",
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
              className="flex h-8 w-8 items-center justify-center text-[#666673] transition-colors hover:text-[#333340] focus-visible:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-expanded={expanded}
              aria-label={expanded ? ariaLabelCollapse : ariaLabelExpand}
            >
              <ToggleIcon className="h-5 w-6" />
            </button>
          </div>
        </div>

        {expanded && (
          <>
            <div className="mx-4 h-px bg-[#EDEDED]" />

            <div className="space-y-1 p-3">{children}</div>
          </>
        )}
      </div>
    </FloatingMenuContext.Provider>
  );
}

FloatingMenu.Item = FloatingMenuItem;
FloatingMenu.Separator = FloatingMenuSeparator;
FloatingMenu.Group = FloatingMenuGroup;
FloatingMenu.Custom = FloatingMenuCustom;

export { FloatingMenu, useFloatingMenuContext };
