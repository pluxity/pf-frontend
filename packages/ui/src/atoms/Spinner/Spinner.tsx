import { cn } from "../../utils";
import { spinnerVariants } from "./variants";
import type { SpinnerProps } from "./types";

function Spinner({
  className,
  size,
  color,
  ref,
  "aria-label": ariaLabel = "loading",
  ...props
}: SpinnerProps) {
  return (
    <div
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      className={cn(spinnerVariants({ size, color, className }))}
      {...props}
    />
  );
}

export { Spinner };
