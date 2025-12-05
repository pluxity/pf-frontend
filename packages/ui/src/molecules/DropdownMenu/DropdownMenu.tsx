import { type ComponentPropsWithoutRef, type ComponentRef, type Ref } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "../../atoms/Icon";
import { cn } from "../../utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

interface DropdownMenuSubTriggerProps extends ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubTrigger
> {
  inset?: boolean;
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>>;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ref,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none",
        "focus:bg-gray-50 data-[state=open]:bg-gray-50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight size="sm" className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

interface DropdownMenuSubContentProps extends ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubContent
> {
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.SubContent>>;
}

function DropdownMenuSubContent({ className, ref, ...props }: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border-light bg-white p-1 text-text-primary shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  );
}

interface DropdownMenuContentProps extends ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> {
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.Content>>;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ref,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border-light bg-white p-1 text-text-primary shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

interface DropdownMenuItemProps extends ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> {
  inset?: boolean;
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.Item>>;
}

function DropdownMenuItem({ className, inset, ref, ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-gray-50 focus:text-text-primary",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

interface DropdownMenuCheckboxItemProps extends ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.CheckboxItem
> {
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>>;
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ref,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "focus:bg-gray-50 focus:text-text-primary",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check size="sm" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

interface DropdownMenuRadioItemProps extends ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioItem
> {
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.RadioItem>>;
}

function DropdownMenuRadioItem({ className, children, ref, ...props }: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "focus:bg-gray-50 focus:text-text-primary",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle size={8} className="fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

interface DropdownMenuLabelProps extends ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
> {
  inset?: boolean;
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.Label>>;
}

function DropdownMenuLabel({ className, inset, ref, ...props }: DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-text-primary",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

interface DropdownMenuSeparatorProps extends ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
> {
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.Separator>>;
}

function DropdownMenuSeparator({ className, ref, ...props }: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border-light", className)}
      {...props}
    />
  );
}

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest text-text-muted", className)} {...props} />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
