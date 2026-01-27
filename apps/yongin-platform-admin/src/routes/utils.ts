import type {
  RouteConfig,
  SectionConfig,
  MenuSection,
  MenuItem,
  PermissionLevel,
  PermissionRequirement,
  DomainPermission,
} from "./types";

const PERMISSION_LEVEL_HIERARCHY: Record<PermissionLevel, number> = {
  READ: 1,
  WRITE: 2,
  ADMIN: 3,
};

function hasRequiredRole(requiredRoles: string[] | undefined, userRoles: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function hasPermission(
  requirements: PermissionRequirement[] | undefined,
  userPermissions: DomainPermission[]
): boolean {
  if (!requirements || requirements.length === 0) {
    return true;
  }

  return requirements.every((req) => {
    const userPerm = userPermissions.find((p) => p.resourceType === req.resourceType);
    if (!userPerm) {
      return false;
    }
    return PERMISSION_LEVEL_HIERARCHY[userPerm.level] >= PERMISSION_LEVEL_HIERARCHY[req.minLevel];
  });
}

export function buildMenuSections(
  routes: RouteConfig[],
  sections: SectionConfig[],
  userRoles: string[] = [],
  userPermissions: DomainPermission[] = []
): MenuSection[] {
  const sectionMap = new Map<string, MenuItem[]>();

  const isAdmin = userRoles.some((role) => role.toUpperCase() === "ADMIN");

  const collectMenuItems = (routeList: RouteConfig[]) => {
    for (const route of routeList) {
      const hasRole = hasRequiredRole(route.roles, userRoles);
      const hasPerm = isAdmin || hasPermission(route.permissions, userPermissions);

      if (route.menu && hasRole && hasPerm) {
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
    .filter((section) => {
      const hasRole = hasRequiredRole(section.roles, userRoles);
      const hasPerm = isAdmin || hasPermission(section.permissions, userPermissions);
      return hasRole && hasPerm;
    })
    .map((section) => ({
      id: section.id,
      label: section.label,
      collapsible: section.collapsible,
      defaultExpanded: section.defaultExpanded,
      order: section.order,
      dividerBefore: section.dividerBefore,
      items: (sectionMap.get(section.id) || []).sort((a, b) => a.order - b.order),
    }))
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

export function getDefaultRoute(
  routes: RouteConfig[],
  userRoles: string[],
  userPermissions: DomainPermission[],
  fallbackPath = "/settings/account"
): string {
  const isAdmin = userRoles.some((role) => role.toUpperCase() === "ADMIN");
  const canAccess = (route: RouteConfig) =>
    hasRequiredRole(route.roles, userRoles) &&
    (isAdmin || hasPermission(route.permissions, userPermissions));

  const firstAccessibleRoute = routes
    .filter((route) => route.menu?.sectionId === "management")
    .find(canAccess);

  return firstAccessibleRoute?.path ?? fallbackPath;
}

export function extractDomainPermissions(
  roles: Array<{ permissions?: Array<{ domainPermissions?: DomainPermission[] }> }> | undefined
): DomainPermission[] {
  if (!roles) return [];

  const permissionMap = new Map<string, DomainPermission>();

  for (const role of roles) {
    if (!role.permissions) continue;

    for (const permission of role.permissions) {
      if (!permission.domainPermissions) continue;

      for (const dp of permission.domainPermissions) {
        const existing = permissionMap.get(dp.resourceType);
        if (
          !existing ||
          PERMISSION_LEVEL_HIERARCHY[dp.level] > PERMISSION_LEVEL_HIERARCHY[existing.level]
        ) {
          permissionMap.set(dp.resourceType, dp);
        }
      }
    }
  }

  return Array.from(permissionMap.values());
}
