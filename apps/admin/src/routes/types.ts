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
  roles?: string[];
}

export interface SectionConfig {
  id: string;
  label?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  order: number;
  roles?: string[];
  dividerBefore?: boolean | string; // true면 디바이더만, string이면 라벨 포함
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
