import type { Ref } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "../../atoms/Icon";
import { cn } from "../../utils";
import { alertVariants } from "./variants";
import type { AlertProps, AlertTitleProps, AlertDescriptionProps } from "./types";

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

interface AlertPropsWithRef extends AlertProps {
  ref?: Ref<HTMLDivElement>;
}

function Alert({ className, variant = "default", icon = true, children, ref, ...props }: AlertPropsWithRef) {
  const Icon = iconMap[variant || "default"];
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), icon && "pl-12", className)}
      {...props}
    >
      {icon && (
        <Icon size="md" className="absolute left-4 top-4" />
      )}
      {children}
    </div>
  );
}

interface AlertTitlePropsWithRef extends AlertTitleProps {
  ref?: Ref<HTMLParagraphElement>;
}

function AlertTitle({ className, ref, ...props }: AlertTitlePropsWithRef) {
  return (
    <h5
      ref={ref}
      className={cn("alert-title mb-1 font-bold leading-none tracking-tight text-sm", className)}
      {...props}
    />
  );
}

interface AlertDescriptionPropsWithRef extends AlertDescriptionProps {
  ref?: Ref<HTMLParagraphElement>;
}

function AlertDescription({ className, ref, ...props }: AlertDescriptionPropsWithRef) {
  return (
    <div
      ref={ref}
      className={cn("text-[13px] text-gray-700", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
