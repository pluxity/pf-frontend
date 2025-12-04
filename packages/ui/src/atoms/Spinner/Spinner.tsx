import { cn } from "../../utils";
import { spinnerVariants } from "./variants";
import type { SpinnerProps } from "./types";

function Spinner({ className, size, color, ref, ...props }: SpinnerProps) {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, color, className }))}
      {...props}
    />
  );
}

export { Spinner };
