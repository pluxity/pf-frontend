import { type ComponentPropsWithoutRef, type ComponentRef, type Ref } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../utils";

const Tabs = TabsPrimitive.Root;

type TabsVariant = "underline" | "filled";

interface TabsListProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  ref?: Ref<ComponentRef<typeof TabsPrimitive.List>>;
  variant?: TabsVariant;
}

function TabsList({ className, ref, variant = "underline", ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-variant={variant}
      className={cn(
        "inline-flex items-center",
        variant === "underline" && "h-11 gap-0",
        variant === "filled" && "h-10 border border-gray-200",
        className
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  ref?: Ref<ComponentRef<typeof TabsPrimitive.Trigger>>;
  variant?: TabsVariant;
}

function TabsTrigger({ className, ref, variant = "underline", ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-variant={variant}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "underline" && [
          "h-10 gap-1.5 px-2.5 text-base font-bold",
          "border-b-2 border-transparent -mb-px",
          "text-gray-600",
          "hover:text-gray-700 hover:border-gray-400",
          "data-[state=active]:text-brand data-[state=active]:border-brand",
        ],
        variant === "filled" && [
          "h-full gap-1.5 px-2.5 text-xs border",
          "bg-white text-gray-600",
          "hover:bg-gray-50",
          "data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:border-brand",
          "data-[state=inactive]:font-normal",
        ],
        className
      )}
      {...props}
    />
  );
}

interface TabsContentProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  ref?: Ref<ComponentRef<typeof TabsPrimitive.Content>>;
}

function TabsContent({ className, ref, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsListProps, TabsTriggerProps, TabsContentProps, TabsVariant };
