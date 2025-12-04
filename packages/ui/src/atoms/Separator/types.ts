import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import type * as SeparatorPrimitive from "@radix-ui/react-separator";

export interface SeparatorProps extends ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  ref?: Ref<ComponentRef<typeof SeparatorPrimitive.Root>>;
}
