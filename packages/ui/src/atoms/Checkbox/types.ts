import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import type * as CheckboxPrimitive from "@radix-ui/react-checkbox";

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  ref?: Ref<ComponentRef<typeof CheckboxPrimitive.Root>>;
}
