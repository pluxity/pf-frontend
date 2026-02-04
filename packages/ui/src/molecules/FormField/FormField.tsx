import { useId, cloneElement, isValidElement, type ReactElement, type Ref } from "react";
import { cn } from "../../utils";
import type {
  FormFieldProps,
  FormFieldLabelProps,
  FormFieldDescriptionProps,
  FormFieldErrorProps,
} from "./types";

interface FormFieldLabelPropsWithRef extends FormFieldLabelProps {
  ref?: Ref<HTMLLabelElement>;
}

function FormFieldLabel({
  className,
  required,
  children,
  ref,
  ...props
}: FormFieldLabelPropsWithRef) {
  return (
    <label ref={ref} className={cn("text-sm font-medium text-gray-700", className)} {...props}>
      {children}
      {required && <span className="ml-1 text-error-500">*</span>}
    </label>
  );
}

interface FormFieldDescriptionPropsWithRef extends FormFieldDescriptionProps {
  ref?: Ref<HTMLParagraphElement>;
}

function FormFieldDescription({ className, ref, ...props }: FormFieldDescriptionPropsWithRef) {
  return <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />;
}

interface FormFieldErrorPropsWithRef extends FormFieldErrorProps {
  ref?: Ref<HTMLParagraphElement>;
}

function FormFieldError({ className, ref, ...props }: FormFieldErrorPropsWithRef) {
  return (
    <p ref={ref} className={cn("text-sm text-error-500", className)} role="alert" {...props} />
  );
}

interface FormFieldPropsWithRef extends FormFieldProps {
  ref?: Ref<HTMLDivElement>;
}

function FormField({
  className,
  label,
  description,
  error,
  required,
  children,
  ref,
  ...props
}: FormFieldPropsWithRef) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const enhancedChildren = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id })
    : children;

  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {label && (
        <FormFieldLabel htmlFor={id} required={required}>
          {label}
        </FormFieldLabel>
      )}
      {description && <FormFieldDescription id={descriptionId}>{description}</FormFieldDescription>}
      <div>{enhancedChildren}</div>
      {error && <FormFieldError id={errorId}>{error}</FormFieldError>}
    </div>
  );
}

export { FormField, FormFieldLabel, FormFieldDescription, FormFieldError };
