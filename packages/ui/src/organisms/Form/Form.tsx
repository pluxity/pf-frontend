import { type Ref } from "react";
import { cn } from "../../utils";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  ref?: Ref<HTMLFormElement>;
}

function Form({ className, ref, ...props }: FormProps) {
  return <form ref={ref} className={cn("space-y-6", className)} {...props} />;
}

export interface FormContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  ref?: Ref<HTMLDivElement>;
}

function FormContainer({
  className,
  title,
  description,
  children,
  ref,
  ...props
}: FormContainerProps) {
  return (
    <div
      ref={ref}
      className={cn("rounded-lg border border-[#E6E6E8] bg-white p-8", className)}
      {...props}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold text-[#1A1A26]">{title}</h2>}
          {description && <p className="mt-2 text-sm text-[#808088]">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  ref?: Ref<HTMLDivElement>;
}

function FormSection({ className, title, description, children, ref, ...props }: FormSectionProps) {
  return (
    <div
      ref={ref}
      className={cn("space-y-4 border-b border-[#E6E6E8] pb-6 last:border-0 last:pb-0", className)}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-bold text-[#333340]">{title}</h3>}
          {description && <p className="mt-1 text-sm text-[#808088]">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  horizontal?: boolean;
  labelWidth?: string;
  ref?: Ref<HTMLDivElement>;
}

function FormField({
  className,
  label,
  required,
  error,
  hint,
  horizontal = false,
  labelWidth = "180px",
  children,
  ref,
  ...props
}: FormFieldProps) {
  return (
    <div
      ref={ref}
      className={cn(horizontal ? "flex items-start gap-4" : "space-y-2", className)}
      {...props}
    >
      {label && (
        <label
          className={cn(
            "text-sm font-bold text-[#333340]",
            horizontal && "flex-shrink-0 pt-2.5",
            horizontal && `w-[${labelWidth}]`
          )}
          style={horizontal ? { width: labelWidth } : undefined}
        >
          {label}
          {required && <span className="ml-0.5 text-error-brand">*</span>}
        </label>
      )}
      <div className={cn("flex-1", horizontal && "min-w-0")}>
        {children}
        {hint && !error && <p className="mt-1 text-xs text-[#808088]">{hint}</p>}
        {error && <p className="mt-1 text-xs text-error-brand">{error}</p>}
      </div>
    </div>
  );
}

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right" | "between";
  ref?: Ref<HTMLDivElement>;
}

function FormActions({ className, align = "right", children, ref, ...props }: FormActionsProps) {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 border-t border-[#E6E6E8] pt-6",
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  ref?: Ref<HTMLDivElement>;
}

function FormRow({ className, columns = 2, children, ref, ...props }: FormRowProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div ref={ref} className={cn("grid gap-4", gridClasses[columns], className)} {...props}>
      {children}
    </div>
  );
}

export { Form, FormContainer, FormSection, FormField, FormActions, FormRow };
