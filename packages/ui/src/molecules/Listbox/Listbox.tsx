import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDownSmall } from "../../atoms/Icon";
import { cn } from "../../utils";
import type {
  ListboxContentProps,
  ListboxIconProps,
  ListboxItemDescriptionProps,
  ListboxItemProps,
  ListboxItemTextProps,
  ListboxLabelProps,
  ListboxSeparatorProps,
  ListboxTriggerProps,
} from "./types";

const Listbox = SelectPrimitive.Root;

const ListboxValue = SelectPrimitive.Value;

const ListboxGroup = SelectPrimitive.Group;

function ListboxTrigger({ className, children, ref, ...props }: ListboxTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-border-default bg-white px-3 text-sm dark:border-dark-border-default dark:bg-dark-bg-secondary dark:text-dark-text-primary",
        "placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-border-focus dark:placeholder:text-dark-text-placeholder dark:focus:ring-primary-500/20 dark:focus:border-dark-border-focus",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
    </SelectPrimitive.Trigger>
  );
}

function ListboxIcon({ className, ref, ...props }: ListboxIconProps) {
  return (
    <SelectPrimitive.Icon asChild>
      <span
        ref={ref}
        className={cn("ml-2 text-placeholder dark:text-dark-text-placeholder", className)}
        {...props}
      >
        <ChevronDownSmall />
      </span>
    </SelectPrimitive.Icon>
  );
}

function ListboxContent({
  className,
  children,
  position = "popper",
  ref,
  ...props
}: ListboxContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-border-default bg-white shadow-lg dark:border-dark-border-default dark:bg-dark-bg-card dark:text-dark-text-primary",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function ListboxItem({ className, children, ref, ...props }: ListboxItemProps) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none",
        "focus:bg-neutral-50 focus:text-primary dark:focus:bg-dark-bg-hover dark:focus:text-dark-text-primary",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check size="sm" className="text-primary-500" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function ListboxItemText({ className, ref, ...props }: ListboxItemTextProps) {
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        "block truncate text-sm font-medium text-primary dark:text-dark-text-primary",
        className
      )}
      {...props}
    />
  );
}

function ListboxItemDescription({ className, ref, ...props }: ListboxItemDescriptionProps) {
  return (
    <p
      ref={ref}
      className={cn("text-xs text-secondary dark:text-dark-text-secondary", className)}
      {...props}
    />
  );
}

function ListboxLabel({ className, ref, ...props }: ListboxLabelProps) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-secondary dark:text-dark-text-secondary",
        className
      )}
      {...props}
    />
  );
}

function ListboxSeparator({ className, ref, ...props }: ListboxSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border-default dark:bg-dark-border-default", className)}
      {...props}
    />
  );
}

export {
  Listbox,
  ListboxTrigger,
  ListboxValue,
  ListboxIcon,
  ListboxContent,
  ListboxItem,
  ListboxItemText,
  ListboxItemDescription,
  ListboxGroup,
  ListboxLabel,
  ListboxSeparator,
};
