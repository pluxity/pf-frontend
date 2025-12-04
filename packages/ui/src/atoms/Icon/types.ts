import type { SVGProps, Ref } from "react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: IconSize | number;
  ref?: Ref<SVGSVGElement>;
}

export const iconSizes: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};
