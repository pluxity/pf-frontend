import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import type * as SwitchPrimitive from "@radix-ui/react-switch";

export interface SwitchProps extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  ref?: Ref<ComponentRef<typeof SwitchPrimitive.Root>>;
}
