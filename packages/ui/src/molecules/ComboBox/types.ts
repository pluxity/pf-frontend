import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export type ComboBoxValueType<TValue, TMultiple extends boolean = false> = TMultiple extends true
  ? TValue[]
  : TValue | null;

export interface ComboBoxContextValue<TValue, TMultiple extends boolean = false> {
  value: ComboBoxValueType<TValue, TMultiple>;
  onValueChange: (value: ComboBoxValueType<TValue, TMultiple>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (search: string) => void;
  disabled?: boolean;
  multiple?: TMultiple;
}

export interface ComboBoxProps<TValue, TMultiple extends boolean = false> {
  value: ComboBoxValueType<TValue, TMultiple>;
  onValueChange: (value: ComboBoxValueType<TValue, TMultiple>) => void;
  multiple?: TMultiple;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
}

export interface ComboBoxTriggerProps extends ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Trigger
> {
  ref?: Ref<HTMLButtonElement>;
}

export interface ComboBoxValueProps extends ComponentPropsWithoutRef<"span"> {
  placeholder?: string;
  ref?: Ref<HTMLSpanElement>;
}

export type ComboBoxIconProps = ComponentPropsWithoutRef<"span"> & {
  ref?: Ref<HTMLSpanElement>;
};

export interface ComboBoxContentProps extends ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> {
  ref?: Ref<HTMLDivElement>;
}

export interface ComboBoxInputProps extends ComponentPropsWithoutRef<"input"> {
  ref?: Ref<HTMLInputElement>;
}

export interface ComboBoxListProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

export interface ComboBoxEmptyProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

export interface ComboBoxGroupProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

export interface ComboBoxLabelProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

export interface ComboBoxItemProps<TValue> extends ComponentPropsWithoutRef<"div"> {
  value: TValue;
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type ComboBoxSeparatorProps = ComponentPropsWithoutRef<"div"> & {
  ref?: Ref<HTMLDivElement>;
};
