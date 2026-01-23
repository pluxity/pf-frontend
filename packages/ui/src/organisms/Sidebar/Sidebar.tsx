import { useState, createContext, useContext } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, Menu } from "../../atoms/Icon";
import { cn } from "../../utils";

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

interface SidebarContextValue {
  collapsed: boolean;
  handleToggleCollapse: () => void;
  ariaLabelCollapse: string;
  ariaLabelExpand: string;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("Sidebar compound components must be used within Sidebar");
  }
  return context;
};

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Children (composition pattern) */
  children?: React.ReactNode;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Aria label for collapse button */
  ariaLabelCollapse?: string;
  /** Aria label for expand button */
  ariaLabelExpand?: string;
}

export interface SidebarHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Header title */
  title?: React.ReactNode;
  /** Logo element */
  logo?: React.ReactNode;
  /** Additional content (e.g., CollapseButton) */
  children?: React.ReactNode;
}

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Footer content */
  children: React.ReactNode;
}

export interface SidebarCollapseButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Custom children (overrides default icon/text) */
  children?: React.ReactNode;
  /** Show only icon (FloatingMenu style for header) */
  iconOnly?: boolean;
}

export interface SidebarItemProps extends React.HTMLAttributes<HTMLElement> {
  /** Item label */
  children: React.ReactNode;
  /** Icon element */
  icon?: React.ReactNode;
  /** Link href (renders as <a> instead of <button>) */
  href?: string;
  /** Active state */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Default expanded state for nested items */
  defaultExpanded?: boolean;
}

export interface SidebarSectionProps {
  /** Section label */
  label?: string;
  /** Section items */
  children: React.ReactNode;
  className?: string;
}

export interface SidebarSeparatorProps {
  className?: string;
}

export interface SidebarCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
}

export interface SidebarContentProps {
  /** Content children */
  children: React.ReactNode;
  className?: string;
}

function SidebarItem({
  children,
  icon,
  href,
  active,
  onClick,
  className,
  defaultExpanded = false,
  ...props
}: SidebarItemProps) {
  const { collapsed } = useSidebarContext();
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Check if children are nested items (not just text)
  const hasNestedItems = Array.isArray(children)
    ? children.some((child) => child && typeof child === "object" && "type" in child)
    : false;

  const handleClick = () => {
    if (hasNestedItems) {
      setExpanded(!expanded);
    }
    onClick?.();
  };

  const content = (
    <>
      {icon && (
        <span
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center",
            active ? "text-brand" : "text-[#666673]"
          )}
        >
          {icon}
        </span>
      )}
      {!collapsed && (
        <span className="flex-1 truncate">
          {Array.isArray(children) ? children.find((c) => typeof c === "string") : children}
        </span>
      )}
      {hasNestedItems && !collapsed && (
        <span className="flex-shrink-0">
          {expanded ? <ChevronDown size="sm" /> : <ChevronRight size="sm" />}
        </span>
      )}
    </>
  );

  const itemClasses = cn(
    "group relative flex h-10 cursor-pointer items-center rounded-lg text-sm transition-colors",
    active
      ? "bg-[#F5F8FF] font-bold text-brand"
      : "font-medium text-[#666673] hover:bg-[#F5F5F7] hover:text-[#333340]",
    collapsed ? "w-10 justify-center px-0" : "w-full gap-3 px-3",
    className
  );

  const nestedItems = Array.isArray(children)
    ? children.filter((child) => child && typeof child === "object" && "type" in child)
    : null;

  return (
    <div>
      {href ? (
        <a href={href} className={itemClasses} onClick={handleClick} {...props}>
          {active && (
            <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
          )}
          {content}
        </a>
      ) : (
        <button type="button" className={itemClasses} onClick={handleClick} {...props}>
          {active && (
            <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
          )}
          {content}
        </button>
      )}
      {nestedItems && expanded && !collapsed && (
        <div className="ml-8 mt-1 space-y-1">{nestedItems}</div>
      )}
    </div>
  );
}

function SidebarSection({ label, children, className }: SidebarSectionProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div className={cn("space-y-1", collapsed && "flex flex-col items-center", className)}>
      {label && (
        <div
          className={cn(
            "py-2 text-xs font-bold uppercase tracking-wider text-[#808088] transition-all duration-200",
            collapsed ? "opacity-0 h-0 py-0 overflow-hidden" : "opacity-100 delay-150"
          )}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

function SidebarContent({ children, className }: SidebarContentProps) {
  const { collapsed } = useSidebarContext();

  return (
    <nav
      className={cn(
        "flex-1 space-y-2 px-3 py-3",
        collapsed ? "flex flex-col items-center overflow-hidden" : "overflow-y-auto",
        className
      )}
    >
      {children}
    </nav>
  );
}

function SidebarSeparator({ className }: SidebarSeparatorProps) {
  return <div className={cn("my-2 h-px bg-[#E6E6E8]", className)} />;
}

function SidebarCustom({ children, className }: SidebarCustomProps) {
  return <div className={cn("px-3 py-2", className)}>{children}</div>;
}

function SidebarHeader({ title, logo, children, className, ...props }: SidebarHeaderProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div
      className={cn(
        "flex items-center border-b border-[#E6E6E8]",
        collapsed ? "flex-col justify-center gap-3 py-3 px-2" : "h-14 justify-between px-4",
        className
      )}
      {...props}
    >
      {collapsed ? (
        <>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
            {logo || (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                {typeof title === "string" ? title.charAt(0) || "D" : "D"}
              </span>
            )}
          </div>
          {children && (
            <>
              <div className="h-px w-full bg-[#E6E6E8]" />
              {children}
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
              {logo || (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                  {typeof title === "string" ? title.charAt(0) || "D" : "D"}
                </span>
              )}
            </div>
            {title && (
              <h2 className="text-lg font-bold text-[#333340] whitespace-nowrap transition-opacity duration-200 delay-150">
                {title}
              </h2>
            )}
          </div>
          {children && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-px bg-[#E6E6E8]" />
              {children}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SidebarFooter({ children, className, ...props }: SidebarFooterProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div
      className={cn(
        "border-t border-[#E6E6E8] p-3",
        collapsed && "flex flex-col items-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarCollapseButton({
  children,
  iconOnly = false,
  className,
  ...props
}: SidebarCollapseButtonProps) {
  const { collapsed, handleToggleCollapse, ariaLabelCollapse, ariaLabelExpand } =
    useSidebarContext();

  if (children) {
    return (
      <button type="button" onClick={handleToggleCollapse} className={className} {...props}>
        {children}
      </button>
    );
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleToggleCollapse}
        className={cn(
          "flex h-8 w-8 items-center justify-center text-[#666673] transition-colors hover:text-[#333340]",
          className
        )}
        aria-expanded={!collapsed}
        aria-label={collapsed ? ariaLabelExpand : ariaLabelCollapse}
        {...props}
      >
        <ToggleIcon className="h-5 w-6" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleCollapse}
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#666673] transition-colors hover:bg-[#F5F5F7] hover:text-[#333340]",
        collapsed ? "w-10 justify-center px-0" : "w-full",
        className
      )}
      {...props}
    >
      {collapsed ? (
        <Menu size="md" />
      ) : (
        <>
          <ChevronLeft size="md" />
          <span className="transition-opacity duration-200 delay-150">Collapse</span>
        </>
      )}
    </button>
  );
}

function Sidebar({
  className,
  children,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  ariaLabelCollapse = "사이드바 접기",
  ariaLabelExpand = "사이드바 펼치기",
  ...props
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    if (!isControlled) {
      setInternalCollapsed(newCollapsed);
    }
    onCollapsedChange?.(newCollapsed);
  };

  const contextValue: SidebarContextValue = {
    collapsed,
    handleToggleCollapse,
    ariaLabelCollapse,
    ariaLabelExpand,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-[#E6E6E8] bg-white transition-all duration-300 overflow-hidden",
          collapsed ? "w-16" : "w-[280px]",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
}

Sidebar.Header = SidebarHeader;
Sidebar.Content = SidebarContent;
Sidebar.Item = SidebarItem;
Sidebar.Section = SidebarSection;
Sidebar.Separator = SidebarSeparator;
Sidebar.Custom = SidebarCustom;
Sidebar.Footer = SidebarFooter;
Sidebar.CollapseButton = SidebarCollapseButton;

export { Sidebar, useSidebarContext };
