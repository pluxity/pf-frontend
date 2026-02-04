import { type ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "../../atoms/Icon";
import { cn } from "../../utils";

const Modal = DialogPrimitive.Root;

const ModalTrigger = DialogPrimitive.Trigger;

const ModalPortal = DialogPrimitive.Portal;

const ModalClose = DialogPrimitive.Close;

function ModalOverlay({
  className,
  ref,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 dark:bg-black/70",
        "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out",
        "motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:fade-in-0",
        "motion-reduce:opacity-100",
        className
      )}
      {...props}
    />
  );
}

function ModalContent({
  className,
  children,
  showClose = true,
  ref,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  showClose?: boolean;
}) {
  return (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white shadow-[0_0.5rem_2rem_rgba(0,0,0,0.25)]",
          "rounded-2xl",
          "dark:bg-dark-bg-card dark:shadow-[0_0.5rem_2rem_rgba(0,0,0,0.5)]",
          "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out",
          "motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:fade-in-0",
          "motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=open]:zoom-in-95",
          "motion-safe:data-[state=closed]:slide-out-to-left-1/2 motion-safe:data-[state=closed]:slide-out-to-top-[48%]",
          "motion-safe:data-[state=open]:slide-in-from-left-1/2 motion-safe:data-[state=open]:slide-in-from-top-[48%]",
          "motion-reduce:opacity-100",
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md border border-neutral-100 text-muted transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 dark:border-dark-border-default dark:text-dark-text-muted dark:hover:bg-dark-bg-hover dark:hover:text-dark-text-primary">
            <X size="sm" />
            <span className="sr-only">닫기</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </ModalPortal>
  );
}

function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-8 pb-4", className)} {...props} />;
}

function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-8 pb-8", className)} {...props} />;
}

function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-neutral-100 px-8 py-4",
        "dark:border-dark-border-default",
        className
      )}
      {...props}
    />
  );
}

function ModalTitle({ className, ref, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-xl font-bold text-primary dark:text-primary-400", className)}
      {...props}
    />
  );
}

function ModalDescription({
  className,
  ref,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("mt-2 text-sm text-muted dark:text-dark-text-muted", className)}
      {...props}
    />
  );
}

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
};
