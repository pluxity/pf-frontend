import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "../Icon";
import { cn } from "../../utils";
import type { CheckboxProps } from "./types";

function Checkbox({ className, ref, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-5 w-5 shrink-0 cursor-pointer rounded border border-border-default transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-white",
        "data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand data-[state=indeterminate]:text-white",
        "dark:border-dark-border-default dark:bg-dark-bg-secondary",
        "dark:data-[state=checked]:border-primary-500 dark:data-[state=checked]:bg-primary-600",
        "dark:data-[state=indeterminate]:border-primary-500 dark:data-[state=indeterminate]:bg-primary-600",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === "indeterminate" ? <Minus size="sm" /> : <Check size="sm" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
