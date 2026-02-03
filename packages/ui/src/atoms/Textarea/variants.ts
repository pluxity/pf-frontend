import { cva } from "class-variance-authority";

export const textareaVariants = cva(
  "flex w-full rounded-md border border-border-default bg-white px-3 py-2 text-text-primary transition-colors placeholder:text-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-text-disabled resize-none",
  {
    variants: {
      textareaSize: {
        sm: "min-h-20 text-xs",
        md: "min-h-32 text-sm",
        lg: "min-h-40 text-base",
      },
    },
    defaultVariants: {
      textareaSize: "md",
    },
  }
);
