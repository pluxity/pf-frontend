import type { ComponentRef, Ref } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../utils";
import type { RadioGroupProps, RadioGroupItemProps } from "./types";

interface RadioGroupPropsWithRef extends RadioGroupProps {
  ref?: Ref<ComponentRef<typeof RadioGroupPrimitive.Root>>;
}

function RadioGroup({ className, label, ref, ...props }: RadioGroupPropsWithRef) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />
    </div>
  );
}

interface RadioGroupItemPropsWithRef extends RadioGroupItemProps {
  ref?: Ref<ComponentRef<typeof RadioGroupPrimitive.Item>>;
}

function RadioGroupItem({ className, label, ref, ...props }: RadioGroupItemPropsWithRef) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "aspect-square h-5 w-5 rounded-full border border-border-default text-brand ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-brand",
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-brand" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-medium leading-none text-text-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
