import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-50 text-text-secondary",
        primary:
          "bg-brand text-white",
        success:
          "bg-success-brand text-white",
        warning:
          "bg-warning-brand text-white",
        error:
          "bg-error-brand text-white",
        outline:
          "border border-border-default bg-transparent text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
