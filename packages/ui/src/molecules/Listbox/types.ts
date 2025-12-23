import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

// Radix Select primitive types
export type ListboxRootProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;

export interface ListboxTriggerProps extends ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Trigger>>;
}

export interface ListboxValueProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Value> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Value>>;
}

export interface ListboxContentProps extends ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Content>>;
}

export interface ListboxViewportProps extends ComponentPropsWithoutRef<
  typeof SelectPrimitive.Viewport
> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Viewport>>;
}

export interface ListboxItemProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Item>>;
}

export interface ListboxGroupProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Group>>;
}

export interface ListboxLabelProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Label>>;
}

export interface ListboxSeparatorProps extends ComponentPropsWithoutRef<
  typeof SelectPrimitive.Separator
> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Separator>>;
}

export type ListboxIconProps = ComponentPropsWithoutRef<"span"> & {
  ref?: Ref<HTMLSpanElement>;
};

export interface ListboxItemTextProps extends ComponentPropsWithoutRef<
  typeof SelectPrimitive.ItemText
> {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.ItemText>>;
}

export type ListboxItemDescriptionProps = ComponentPropsWithoutRef<"p"> & {
  ref?: Ref<HTMLParagraphElement>;
};
