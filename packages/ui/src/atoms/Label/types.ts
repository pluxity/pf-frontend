import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import type * as LabelPrimitive from "@radix-ui/react-label";

export interface LabelProps
  extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean;
  ref?: Ref<ComponentRef<typeof LabelPrimitive.Root>>;
}
