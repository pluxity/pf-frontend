import type { ComponentPropsWithoutRef } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

export interface RadioGroupProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  label?: string;
}

export interface RadioGroupItemProps extends ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  label?: string;
}
