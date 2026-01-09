import type { RouteConfig, SectionConfig, MenuSection, MenuItem } from "./types";

export function buildMenuSections(routes: RouteConfig[], sections: SectionConfig[]): MenuSection[] {
  const sectionMap = new Map<string, MenuItem[]>();

  const collectMenuItems = (routeList: RouteConfig[]) => {
    for (const route of routeList) {
      if (route.menu) {
        const { sectionId, label, icon, order = 0 } = route.menu;
        if (!sectionMap.has(sectionId)) {
          sectionMap.set(sectionId, []);
        }
        sectionMap.get(sectionId)!.push({
          label,
          path: route.path,
          icon,
          order,
        });
      }
    }
  };

  collectMenuItems(routes);

  const menuSections: MenuSection[] = sections
    .map((section) => ({
      id: section.id,
      label: section.label,
      collapsible: section.collapsible,
      defaultExpanded: section.defaultExpanded,
      order: section.order,
      items: (sectionMap.get(section.id) || []).sort((a, b) => a.order - b.order),
    }))
    .filter((section) => section.items.length > 0)
    .sort((a, b) => a.order - b.order);

  return menuSections;
}

export function flattenRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = [];

  for (const route of routes) {
    result.push(route);
    if (route.children) {
      result.push(...flattenRoutes(route.children));
    }
  }

  return result;
}

export function isPathActive(currentPath: string, targetPath: string): boolean {
  if (targetPath === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(targetPath);
}
