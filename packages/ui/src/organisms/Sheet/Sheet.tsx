import { type ComponentProps, type ReactNode } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "../../atoms/Icon";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({ className, ref, ...props }: ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
      ref={ref}
    />
  );
}

const sheetVariants = cva(
  "fixed z-50 bg-white shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-[#E6E6E8] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t border-[#E6E6E8] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-[400px] border-r border-[#E6E6E8] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right:
          "inset-y-0 right-0 h-full w-[400px] border-l border-[#E6E6E8] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetContentProps
  extends ComponentProps<typeof SheetPrimitive.Content>, VariantProps<typeof sheetVariants> {
  showClose?: boolean;
}

function SheetContent({
  side = "right",
  className,
  children,
  showClose = true,
  ref,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {showClose && (
          <SheetPrimitive.Close className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md border border-[#E6E6E8] text-[#808088] transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
            <X size="sm" />
            <span className="sr-only">닫기</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-8 pb-4", className)} {...props} />;
}

function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto px-8", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-[#E6E6E8] px-8 py-4",
        className
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ref, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      ref={ref}
      className={cn("text-2xl font-bold text-[#1A1A26]", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ref,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      ref={ref}
      className={cn("mt-2 text-sm text-[#808088]", className)}
      {...props}
    />
  );
}

function SheetSection({
  className,
  title,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & { title?: ReactNode }) {
  return (
    <div className={cn("border-t border-[#E6E6E8] py-6", className)} {...props}>
      {title && <h3 className="mb-4 text-base font-bold text-[#333340]">{title}</h3>}
      {children}
    </div>
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetSection,
};
