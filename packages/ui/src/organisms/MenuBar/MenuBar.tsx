import { type ComponentPropsWithoutRef, type ComponentRef, type Ref } from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { ChevronRight, Check, Circle } from "../../atoms/Icon";
import { cn } from "../../utils";

const MenubarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu;
const MenubarGroup: typeof MenubarPrimitive.Group = MenubarPrimitive.Group;
const MenubarPortal: typeof MenubarPrimitive.Portal = MenubarPrimitive.Portal;
const MenubarSub: typeof MenubarPrimitive.Sub = MenubarPrimitive.Sub;
const MenubarRadioGroup: typeof MenubarPrimitive.RadioGroup = MenubarPrimitive.RadioGroup;

interface MenubarProps extends ComponentPropsWithoutRef<typeof MenubarPrimitive.Root> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.Root>>;
}

function Menubar({ className, ref, ...props }: MenubarProps) {
  return (
    <MenubarPrimitive.Root
      ref={ref}
      className={cn("flex h-10 items-center bg-white px-1", className)}
      {...props}
    />
  );
}

interface MenubarTriggerProps extends ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.Trigger>>;
}

function MenubarTrigger({ className, ref, ...props }: MenubarTriggerProps) {
  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm font-normal text-gray-700 outline-none",
        "focus:bg-gray-50 data-[state=open]:bg-brand data-[state=open]:text-white",
        "hover:bg-gray-50",
        className
      )}
      {...props}
    />
  );
}

interface MenubarSubTriggerProps extends ComponentPropsWithoutRef<
  typeof MenubarPrimitive.SubTrigger
> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.SubTrigger>>;
  inset?: boolean;
}

function MenubarSubTrigger({ className, inset, children, ref, ...props }: MenubarSubTriggerProps) {
  return (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-text-primary outline-none",
        "focus:bg-gray-50 data-[state=open]:bg-gray-50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight size="xs" className="ml-auto" />
    </MenubarPrimitive.SubTrigger>
  );
}

interface MenubarSubContentProps extends ComponentPropsWithoutRef<
  typeof MenubarPrimitive.SubContent
> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.SubContent>>;
}

function MenubarSubContent({ className, ref, ...props }: MenubarSubContentProps) {
  return (
    <MenubarPrimitive.SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border-light bg-white p-2 text-text-primary shadow-lg",
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

interface MenubarContentProps extends ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.Content>>;
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ref,
  ...props
}: MenubarContentProps) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-lg border border-border-light bg-white p-2 text-text-primary shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
}

interface MenubarItemProps extends ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.Item>>;
  inset?: boolean;
  shortcut?: string;
}

function MenubarItem({ className, inset, shortcut, children, ref, ...props }: MenubarItemProps) {
  return (
    <MenubarPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-text-primary outline-none",
        "focus:bg-gray-50",
        "data-[disabled]:pointer-events-none data-[disabled]:text-text-muted",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      {shortcut && (
        <span className="ml-auto text-xs tracking-widest text-text-muted">{shortcut}</span>
      )}
    </MenubarPrimitive.Item>
  );
}

interface MenubarCheckboxItemProps extends ComponentPropsWithoutRef<
  typeof MenubarPrimitive.CheckboxItem
> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.CheckboxItem>>;
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ref,
  ...props
}: MenubarCheckboxItemProps) {
  return (
    <MenubarPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-text-primary outline-none",
        "focus:bg-gray-50",
        "data-[disabled]:pointer-events-none data-[disabled]:text-text-muted",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Check size="sm" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

interface MenubarRadioItemProps extends ComponentPropsWithoutRef<
  typeof MenubarPrimitive.RadioItem
> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.RadioItem>>;
}

function MenubarRadioItem({ className, children, ref, ...props }: MenubarRadioItemProps) {
  return (
    <MenubarPrimitive.RadioItem
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-text-primary outline-none",
        "focus:bg-gray-50",
        "data-[disabled]:pointer-events-none data-[disabled]:text-text-muted",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Circle size={8} className="fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

interface MenubarLabelProps extends ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.Label>>;
  inset?: boolean;
}

function MenubarLabel({ className, inset, ref, ...props }: MenubarLabelProps) {
  return (
    <MenubarPrimitive.Label
      ref={ref}
      className={cn("px-3 py-2 text-xs font-semibold text-text-muted", inset && "pl-8", className)}
      {...props}
    />
  );
}

interface MenubarSeparatorProps extends ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Separator
> {
  ref?: Ref<ComponentRef<typeof MenubarPrimitive.Separator>>;
}

function MenubarSeparator({ className, ref, ...props }: MenubarSeparatorProps) {
  return (
    <MenubarPrimitive.Separator
      ref={ref}
      className={cn("mx-1 my-1 h-px bg-border-light", className)}
      {...props}
    />
  );
}

function MenubarShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("ml-auto text-xs tracking-widest text-text-muted", className)} {...props} />
  );
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};

export type {
  MenubarProps,
  MenubarTriggerProps,
  MenubarContentProps,
  MenubarItemProps,
  MenubarSeparatorProps,
  MenubarLabelProps,
  MenubarCheckboxItemProps,
  MenubarRadioItemProps,
  MenubarSubTriggerProps,
  MenubarSubContentProps,
};
