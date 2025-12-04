import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cn } from "../../utils";
import { toggleVariants } from "./variants";
import type { ToggleProps } from "./types";

function Toggle({ className, variant, size, ref, ...props }: ToggleProps) {
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle };
