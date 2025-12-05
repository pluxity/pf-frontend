import type { ComponentPropsWithoutRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

export interface SelectProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  placeholder?: string;
}

export type SelectTriggerProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;

export type SelectContentProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;

export type SelectItemProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

export type SelectGroupProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Group>;

export type SelectLabelProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;

export type SelectSeparatorProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>;
