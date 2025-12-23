import { cva } from "class-variance-authority";

export const toggleVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-md font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:hover:bg-brand-hover",
  {
    variants: {
      variant: {
        default: "bg-neutral-50 text-text-secondary",
        outline: "border border-border-default bg-transparent hover:bg-gray-50",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
