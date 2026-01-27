import type { ComponentType, LazyExoticComponent } from "react";

export interface IconProps {
  size?: "sm" | "md" | "lg";
}

export type PermissionLevel = "READ" | "WRITE" | "ADMIN";

export interface DomainPermission {
  resourceType: string;
  level: PermissionLevel;
}

export interface PermissionRequirement {
  resourceType: string;
  minLevel: PermissionLevel;
}

export interface MenuConfig {
  label: string;
  icon: ComponentType<IconProps>;
  sectionId: string;
  order?: number;
}

export interface RouteConfig {
  path: string;
  element: LazyExoticComponent<ComponentType> | ComponentType;
  menu?: MenuConfig;
  children?: RouteConfig[];
  roles?: string[];
  permissions?: PermissionRequirement[];
}

export interface SectionConfig {
  id: string;
  label?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  order: number;
  roles?: string[];
  permissions?: PermissionRequirement[];
  dividerBefore?: boolean | string;
}

export interface MenuItem {
  label: string;
  path: string;
  icon: ComponentType<IconProps>;
  order: number;
}

export interface MenuSection {
  id: string;
  label?: string;
  items: MenuItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  order: number;
  dividerBefore?: boolean | string;
}
