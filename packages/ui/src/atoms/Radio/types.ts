import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import type * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

export interface RadioGroupProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  ref?: Ref<ComponentRef<typeof RadioGroupPrimitive.Root>>;
}

export interface RadioGroupItemProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  ref?: Ref<ComponentRef<typeof RadioGroupPrimitive.Item>>;
}
