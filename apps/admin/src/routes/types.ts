import type { ComponentType, LazyExoticComponent } from "react";

export interface IconProps {
  size?: "sm" | "md" | "lg";
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
}

export interface SectionConfig {
  id: string;
  label?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  order: number;
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
}
