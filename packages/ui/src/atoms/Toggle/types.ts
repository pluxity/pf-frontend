import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import type { VariantProps } from "class-variance-authority";
import { toggleVariants } from "./variants";

export interface ToggleProps
  extends ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {
  ref?: Ref<ComponentRef<typeof TogglePrimitive.Root>>;
}
