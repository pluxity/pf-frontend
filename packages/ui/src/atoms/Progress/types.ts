import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import type * as ProgressPrimitive from "@radix-ui/react-progress";

export interface ProgressProps extends ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  ref?: Ref<ComponentRef<typeof ProgressPrimitive.Root>>;
}
