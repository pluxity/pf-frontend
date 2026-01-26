import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "@pf-dev/ui/organisms";
import { ChevronDown } from "@pf-dev/ui/atoms";
import { cn } from "@pf-dev/ui/utils";
import { useAuthStore, selectUser } from "@pf-dev/services";

import { sectionConfigs, protectedRoutes } from "@/routes/config";
import { buildMenuSections, isPathActive } from "@/routes/utils";
import type { MenuSection } from "@/routes/types";

import ciSvg from "/ci.svg";

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onItemClick?: () => void;
}

export function AdminSidebar({
  collapsed: sidebarCollapsed,
  onCollapsedChange,
  onItemClick,
}: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);

  const userRoles = useMemo(() => user?.roles.map((r) => r.name) ?? [], [user]);
  const menuSections = useMemo(
    () => buildMenuSections(protectedRoutes, sectionConfigs, userRoles),
    [userRoles]
  );

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuSections.forEach((section) => {
      if (section.collapsible) {
        initial[section.id] = section.defaultExpanded ?? true;
      }
    });
    return initial;
  });

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const renderSection = (section: MenuSection) => {
    const isExpanded = expandedSections[section.id] ?? true;
    const hasActiveItem = section.items.some((item) => isPathActive(location.pathname, item.path));

    const renderDivider = () => {
      if (!section.dividerBefore) return null;

      if (typeof section.dividerBefore === "string") {
        return (
          <div className="mb-2 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200" />
              {!sidebarCollapsed && (
                <span className="text-xs font-medium text-gray-400">{section.dividerBefore}</span>
              )}
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          </div>
        );
      }

      return <div className="my-3 border-t border-gray-200" />;
    };

    const divider = renderDivider();

    if (section.collapsible && section.label) {
      return (
        <div key={section.id}>
          {divider}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "flex w-full items-center justify-between py-2 pl-2 pr-1 text-xs font-bold uppercase tracking-wider transition-colors",
                  hasActiveItem ? "text-brand" : "text-[#808088] hover:text-[#333340]"
                )}
              >
                <span>{section.label}</span>
                <ChevronDown
                  size="sm"
                  className={cn("transition-transform duration-200", isExpanded && "-rotate-180")}
                />
              </button>
            )}
            {(isExpanded || sidebarCollapsed) && (
              <div className={cn(!sidebarCollapsed && "pl-3")}>
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Sidebar.Item
                      key={item.path}
                      icon={<IconComponent size="md" />}
                      active={isPathActive(location.pathname, item.path)}
                      onClick={() => handleItemClick(item.path)}
                    >
                      {item.label}
                    </Sidebar.Item>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={section.id}>
        {divider}
        <Sidebar.Section label={section.label}>
          {section.items.map((item) => {
            const IconComponent = item.icon;
            return (
              <Sidebar.Item
                key={item.path}
                icon={<IconComponent size="md" />}
                active={isPathActive(location.pathname, item.path)}
                onClick={() => handleItemClick(item.path)}
              >
                {item.label}
              </Sidebar.Item>
            );
          })}
        </Sidebar.Section>
      </div>
    );
  };

  return (
    <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={onCollapsedChange}>
      <Sidebar.Header
        logo={<img src={ciSvg} alt="용인 플랫폼 시티 CI" className="h-8 w-8 object-contain" />}
        title="용인 플랫폼 시티"
      >
        <Sidebar.CollapseButton iconOnly />
      </Sidebar.Header>

      <Sidebar.Content>{menuSections.map(renderSection)}</Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  );
}
