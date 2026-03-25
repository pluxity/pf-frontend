import * as PopoverPrimitive from "@radix-ui/react-popover";
import { createContext, useContext, useMemo, useState, type JSX } from "react";
import { Check, ChevronDownSmall, Search } from "../../atoms/Icon";
import { cn } from "../../utils";
import type {
  ComboBoxContentProps,
  ComboBoxContextValue,
  ComboBoxEmptyProps,
  ComboBoxGroupProps,
  ComboBoxIconProps,
  ComboBoxInputProps,
  ComboBoxItemProps,
  ComboBoxLabelProps,
  ComboBoxListProps,
  ComboBoxProps,
  ComboBoxSeparatorProps,
  ComboBoxTriggerProps,
  ComboBoxValueProps,
} from "./types";

const ComboBoxContext = createContext<ComboBoxContextValue<unknown, boolean> | null>(null);

function useComboBox<TValue, TMultiple extends boolean = false>() {
  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBox components must be used within a ComboBox");
  }
  return context as ComboBoxContextValue<TValue, TMultiple>;
}

function ComboBoxRoot<TValue, TMultiple extends boolean = false>({
  value,
  onValueChange,
  multiple,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  disabled,
  children,
}: ComboBoxProps<TValue, TMultiple>) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [search, setSearch] = useState("");

  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen;

  const contextValue = useMemo(
    () => ({
      value,
      onValueChange: onValueChange as (value: unknown) => void,
      open,
      onOpenChange: (nextOpen: boolean) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setSearch("");
        }
      },
      search,
      onSearchChange: setSearch,
      disabled,
      multiple,
    }),
    [value, onValueChange, open, onOpenChange, search, disabled, multiple]
  );

  return (
    <ComboBoxContext.Provider value={contextValue}>
      <PopoverPrimitive.Root open={open} onOpenChange={contextValue.onOpenChange}>
        {children}
      </PopoverPrimitive.Root>
    </ComboBoxContext.Provider>
  );
}

function ComboBoxTrigger({ className, children, ref, ...props }: ComboBoxTriggerProps) {
  const { disabled } = useComboBox();

  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-border-default bg-white px-3 text-sm dark:border-dark-border-default dark:bg-dark-bg-secondary dark:text-dark-text-primary",
        "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  );
}

function ComboBoxValue({
  placeholder = "Select...",
  className,
  ref,
  ...props
}: ComboBoxValueProps) {
  const { value, multiple } = useComboBox();

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return null;
      return value.map((v) => String(v)).join(", ");
    }
    return value;
  };

  const displayValue = getDisplayValue();
  const hasValue = displayValue !== null && displayValue !== undefined && displayValue !== "";

  return (
    <span
      ref={ref}
      className={cn(
        "flex-1 truncate text-left",
        hasValue
          ? "text-primary dark:text-dark-text-primary"
          : "text-placeholder dark:text-dark-text-placeholder",
        className
      )}
      {...props}
    >
      {hasValue ? String(displayValue) : placeholder}
    </span>
  );
}

function ComboBoxIcon({ className, ref, ...props }: ComboBoxIconProps) {
  return (
    <span
      ref={ref}
      className={cn("ml-2 text-placeholder dark:text-dark-text-placeholder", className)}
      aria-hidden
      {...props}
    >
      <ChevronDownSmall />
    </span>
  );
}

function ComboBoxContent({
  className,
  children,
  sideOffset = 4,
  ref,
  ...props
}: ComboBoxContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border-default bg-white shadow-lg dark:border-dark-border-default dark:bg-dark-bg-card dark:text-dark-text-primary",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        align="start"
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function ComboBoxInput({
  className,
  placeholder = "Search...",
  ref,
  ...props
}: ComboBoxInputProps) {
  const { search, onSearchChange } = useComboBox();

  return (
    <div className="flex items-center border-b border-border-default px-3 dark:border-dark-border-default">
      <Search size="sm" className="text-placeholder dark:text-dark-text-placeholder" />
      <input
        ref={ref}
        type="text"
        className={cn(
          "flex-1 bg-transparent py-2.5 pl-2 text-sm outline-none",
          "placeholder:text-placeholder dark:text-dark-text-primary dark:placeholder:text-dark-text-placeholder",
          className
        )}
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        {...props}
      />
    </div>
  );
}

function ComboBoxList({ className, children, ref, ...props }: ComboBoxListProps) {
  return (
    <div
      ref={ref}
      className={cn("max-h-64 overflow-auto p-1", className)}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
}

function ComboBoxEmpty({
  className,
  children = "No results found",
  ref,
  ...props
}: ComboBoxEmptyProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "px-3 py-6 text-center text-sm text-secondary dark:text-dark-text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ComboBoxGroup({ className, children, ref, ...props }: ComboBoxGroupProps) {
  return (
    <div ref={ref} className={cn("py-1", className)} role="group" {...props}>
      {children}
    </div>
  );
}

function ComboBoxLabel({ className, children, ref, ...props }: ComboBoxLabelProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-secondary dark:text-dark-text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ComboBoxItemComponent<TValue>({
  value: itemValue,
  disabled,
  className,
  children,
  ref,
  ...props
}: ComboBoxItemProps<TValue>) {
  const { value, onValueChange, onOpenChange, multiple } = useComboBox<TValue, boolean>();

  const isSelected =
    multiple && Array.isArray(value) ? value.includes(itemValue) : value === itemValue;

  const handleSelect = () => {
    if (disabled) return;

    if (multiple && Array.isArray(value)) {
      // Toggle selection for multiple mode
      const newValue = isSelected ? value.filter((v) => v !== itemValue) : [...value, itemValue];
      onValueChange(newValue as typeof value);
      // Don't close on multiple selection
    } else {
      // Single selection
      onValueChange(itemValue as typeof value);
      onOpenChange(false);
    }
  };

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      data-disabled={disabled ? "" : undefined}
      data-selected={isSelected ? "" : undefined}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none",
        "hover:bg-neutral-50 focus:bg-neutral-50 dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover",
        isSelected && "bg-primary-50 text-primary-600",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      }}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {isSelected && <Check size="sm" className="text-primary-500" />}
      </span>
      {children}
    </div>
  );
}

function ComboBoxSeparator({ className, ref, ...props }: ComboBoxSeparatorProps) {
  return (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border-default dark:bg-dark-border-default", className)}
      role="separator"
      {...props}
    />
  );
}

const ComboBox = ComboBoxRoot as <TValue, TMultiple extends boolean = false>(
  props: ComboBoxProps<TValue, TMultiple>
) => JSX.Element;

const ComboBoxItem = ComboBoxItemComponent as <TValue>(
  props: ComboBoxItemProps<TValue>
) => JSX.Element;

export {
  ComboBox,
  ComboBoxTrigger,
  ComboBoxValue,
  ComboBoxIcon,
  ComboBoxContent,
  ComboBoxInput,
  ComboBoxList,
  ComboBoxEmpty,
  ComboBoxGroup,
  ComboBoxLabel,
  ComboBoxItem,
  ComboBoxSeparator,
  useComboBox,
};
