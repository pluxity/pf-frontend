import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand text-white hover:bg-brand-hover active:bg-brand-active",
        secondary: "bg-neutral-50 text-text-secondary hover:bg-gray-100 active:bg-gray-200",
        outline:
          "border border-border-default bg-white text-brand hover:bg-gray-50 active:bg-gray-100",
        ghost: "text-brand hover:bg-gray-50 active:bg-gray-100",
        link: "text-brand underline-offset-4 hover:underline",
        success: "bg-success-brand text-white hover:opacity-90 active:opacity-80",
        warning: "bg-warning-brand text-white hover:opacity-90 active:opacity-80",
        error: "bg-error-brand text-white hover:opacity-90 active:opacity-80",
      },
      size: {
        sm: "h-8 rounded-md px-4 text-xs",
        md: "h-10 rounded-md px-5 text-sm",
        lg: "h-12 rounded-md px-6 text-base",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
