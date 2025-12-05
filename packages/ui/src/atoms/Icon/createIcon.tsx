import { cn } from "../../utils";
import type { IconProps } from "./types";
import { iconSizes } from "./types";

interface CreateIconOptions {
  displayName: string;
  viewBox?: string;
  defaultClassName?: string;
}

export function createIcon(path: React.ReactNode, options: CreateIconOptions) {
  const { displayName, viewBox = "0 0 24 24", defaultClassName } = options;

  function Icon({ size = "md", className, ref, ...props }: IconProps) {
    const sizeValue = typeof size === "number" ? size : iconSizes[size];

    return (
      <svg
        ref={ref}
        width={sizeValue}
        height={sizeValue}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", defaultClassName, className)}
        {...props}
      >
        {path}
      </svg>
    );
  }

  Icon.displayName = displayName;
  return Icon;
}
