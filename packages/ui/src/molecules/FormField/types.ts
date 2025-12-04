import type { ReactNode, HTMLAttributes, LabelHTMLAttributes } from "react";

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export interface FormFieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export type FormFieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export type FormFieldErrorProps = HTMLAttributes<HTMLParagraphElement>;
