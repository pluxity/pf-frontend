import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import type * as SliderPrimitive from "@radix-ui/react-slider";

export interface SliderProps extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ref?: Ref<ComponentRef<typeof SliderPrimitive.Root>>;
}
