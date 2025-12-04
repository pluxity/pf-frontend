import { useState, type Ref } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, Menu } from "../../atoms/Icon";
import { cn } from "../../utils";

export interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  children?: SidebarItemProps[];
}

export interface SidebarSectionProps {
  label?: string;
  items: SidebarItemProps[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  logo?: React.ReactNode;
  sections?: SidebarSectionProps[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  footer?: React.ReactNode;
  ref?: Ref<HTMLElement>;
}

function SidebarItem({ icon, label, href, active, onClick, children, collapsed, ref }: SidebarItemProps & { collapsed?: boolean; ref?: Ref<HTMLDivElement> }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = children && children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
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
        <>
          <span className="flex-1 truncate">{label}</span>
          {hasChildren && (
            <span className="flex-shrink-0">
              {expanded ? (
                <ChevronDown size="sm" />
              ) : (
                <ChevronRight size="sm" />
              )}
            </span>
          )}
        </>
      )}
    </>
  );

  const itemClasses = cn(
    "group relative flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm transition-colors",
    active
      ? "bg-[#F5F8FF] font-bold text-brand"
      : "font-medium text-[#666673] hover:bg-[#F5F5F7] hover:text-[#333340]",
    collapsed && "justify-center px-0"
  );

  return (
    <div ref={ref}>
      {href ? (
        <a href={href} className={itemClasses} onClick={handleClick}>
          {active && !collapsed && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
          )}
          {content}
          {collapsed && (
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-[#333340] px-2 py-1 text-xs text-white group-hover:block">
              {label}
            </span>
          )}
        </a>
      ) : (
        <button type="button" className={itemClasses} onClick={handleClick}>
          {active && !collapsed && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
          )}
          {content}
          {collapsed && (
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-[#333340] px-2 py-1 text-xs text-white group-hover:block">
              {label}
            </span>
          )}
        </button>
      )}
      {hasChildren && expanded && !collapsed && (
        <div className="ml-8 mt-1 space-y-1">
          {children.map((child, index) => (
            <SidebarItem key={index} {...child} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarSection({ label, items, collapsed, ref }: SidebarSectionProps & { collapsed?: boolean; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="space-y-1">
      {label && !collapsed && (
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#808088]">
          {label}
        </div>
      )}
      {collapsed && label && <div className="my-2 h-px bg-[#E6E6E8]" />}
      {items.map((item, index) => (
        <SidebarItem key={index} {...item} collapsed={collapsed} />
      ))}
    </div>
  );
}

function Sidebar({
  className,
  title,
  logo,
  sections = [],
  collapsible = true,
  defaultCollapsed = false,
  onCollapsedChange,
  footer,
  ref,
  ...props
}: SidebarProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const handleToggleCollapse = () => {
      const newCollapsed = !collapsed;
      setCollapsed(newCollapsed);
      onCollapsedChange?.(newCollapsed);
    };

    return (
      <aside
        ref={ref}
        className={cn(
          "flex h-full flex-col border-r border-[#E6E6E8] bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-[280px]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-[#E6E6E8]",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {collapsed ? (
            logo || (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                {title?.charAt(0) || "D"}
              </span>
            )
          ) : (
            <>
              <div className="flex items-center gap-3">
                {logo || (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                    {title?.charAt(0) || "D"}
                  </span>
                )}
                {title && (
                  <h2 className="text-lg font-bold text-[#333340]">{title}</h2>
                )}
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {sections.map((section, index) => (
            <SidebarSection key={index} {...section} collapsed={collapsed} />
          ))}
        </nav>

        {collapsible && (
          <div
            className={cn(
              "border-t border-[#E6E6E8] p-3",
              collapsed && "flex justify-center"
            )}
          >
            <button
              type="button"
              onClick={handleToggleCollapse}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#666673] transition-colors hover:bg-[#F5F5F7] hover:text-[#333340]",
                collapsed ? "w-10 justify-center px-0" : "w-full"
              )}
            >
              {collapsed ? (
                <Menu size="md" />
              ) : (
                <>
                  <ChevronLeft size="md" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        )}

        {footer && !collapsed && (
          <div className="border-t border-[#E6E6E8] p-3">{footer}</div>
        )}
      </aside>
    );
}

const CollapsibleSidebar = Sidebar;

export { Sidebar, CollapsibleSidebar, SidebarSection, SidebarItem };
