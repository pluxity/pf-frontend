import type { ComponentRef, Ref } from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "../../atoms/Icon";
import { cn } from "../../utils";
import { toastVariants } from "./variants";
import type { VariantProps } from "class-variance-authority";

const ToastProvider = ToastPrimitives.Provider;

type ToastViewportProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Viewport>>;
};

const positionClasses = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
};

function ToastViewport({
  className,
  position = "bottom-right",
  ref,
  ...props
}: ToastViewportProps) {
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-md",
        positionClasses[position],
        className
      )}
      {...props}
    />
  );
}

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export interface ToastProps
  extends
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Root>>;
}

function Toast({ className, variant = "default", children, ref, ...props }: ToastProps) {
  const Icon = iconMap[variant || "default"];

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        toastVariants({ variant }),
        "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out",
        "motion-safe:data-[swipe=end]:animate-out motion-safe:data-[state=closed]:fade-out-80",
        "motion-safe:data-[state=closed]:slide-out-to-right-full",
        "motion-safe:data-[state=open]:slide-in-from-bottom-full",
        "motion-reduce:data-[state=open]:fade-in-0 motion-reduce:data-[state=closed]:fade-out-0",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
        className
      )}
      {...props}
    >
      <Icon size="md" className="shrink-0" />
      <div className="flex-1">{children}</div>
    </ToastPrimitives.Root>
  );
}

interface ToastTitleProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Title>>;
}

function ToastTitle({ className, ref, ...props }: ToastTitleProps) {
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
}

interface ToastDescriptionProps extends React.ComponentPropsWithoutRef<
  typeof ToastPrimitives.Description
> {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Description>>;
}

function ToastDescription({ className, ref, ...props }: ToastDescriptionProps) {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  );
}

interface ToastCloseProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Close>>;
}

function ToastClose({ className, ref, ...props }: ToastCloseProps) {
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity",
        "hover:opacity-100 hover:bg-black/5",
        "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
        className
      )}
      toast-close=""
      {...props}
    >
      <X size="sm" />
    </ToastPrimitives.Close>
  );
}

interface ToastActionProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Action>>;
}

function ToastAction({ className, ref, ...props }: ToastActionProps) {
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md px-3 py-1.5",
        "text-sm font-medium transition-colors",
        "bg-transparent border border-current",
        "hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
