import type { SVGProps, Ref } from "react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: IconSize | number;
  ref?: Ref<SVGSVGElement>;
}

export const iconSizes: Record<IconSize, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
};
