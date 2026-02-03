import { type ComponentProps } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

function PopoverContent({
  className,
  align = "center",
  sideOffset = 8,
  showArrow = true,
  children,
  ref,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content> & {
  showArrow?: boolean;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-lg border border-[#E6E6E8] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.10)] outline-none",
          "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out",
          "motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:fade-in-0",
          "motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=open]:zoom-in-95",
          "motion-safe:data-[side=bottom]:slide-in-from-top-2",
          "motion-safe:data-[side=left]:slide-in-from-right-2",
          "motion-safe:data-[side=right]:slide-in-from-left-2",
          "motion-safe:data-[side=top]:slide-in-from-bottom-2",
          "motion-reduce:opacity-100",
          className
        )}
        {...props}
      >
        {children}
        {showArrow && <PopoverPrimitive.Arrow className="fill-white stroke-[#E6E6E8] stroke-2" />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

const PopoverClose = PopoverPrimitive.Close;

function PopoverHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-2", className)} {...props} />;
}

function PopoverTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("text-sm font-bold text-[#333340]", className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-[#666673]", className)} {...props} />;
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
};
