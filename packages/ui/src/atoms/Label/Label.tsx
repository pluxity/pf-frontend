import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../../utils";
import type { LabelProps } from "./types";

function Label({ className, required, children, ref, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:text-dark-text-primary",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-error-500">*</span>}
    </LabelPrimitive.Root>
  );
}

export { Label };
