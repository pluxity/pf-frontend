import { type ComponentPropsWithoutRef, type ComponentRef, type Ref } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "../../atoms/Icon";
import { cn } from "../../utils";

const Accordion = AccordionPrimitive.Root;

interface AccordionItemProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  ref?: Ref<ComponentRef<typeof AccordionPrimitive.Item>>;
}

function AccordionItem({ className, ref, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b border-gray-200", className)}
      {...props}
    />
  );
}

interface AccordionTriggerProps extends ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> {
  ref?: Ref<ComponentRef<typeof AccordionPrimitive.Trigger>>;
}

function AccordionTrigger({ className, children, ref, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          "focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown size="sm" className="transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

interface AccordionContentProps extends ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Content
> {
  ref?: Ref<ComponentRef<typeof AccordionPrimitive.Content>>;
}

function AccordionContent({ className, children, ref, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
