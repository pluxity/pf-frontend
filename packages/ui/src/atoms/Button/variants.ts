import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white hover:bg-brand-hover active:bg-brand-active dark:bg-primary-600 dark:hover:bg-primary-700 dark:active:bg-primary-800",
        secondary:
          "bg-neutral-50 text-text-secondary hover:bg-gray-100 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600",
        outline:
          "border border-border-default bg-white text-brand hover:bg-gray-50 active:bg-gray-100 dark:border-dark-border-default dark:bg-dark-bg-primary dark:text-primary-400 dark:hover:bg-dark-bg-hover dark:active:bg-dark-bg-tertiary",
        ghost:
          "text-brand hover:bg-gray-50 active:bg-gray-100 dark:text-primary-400 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        link: "text-brand underline-offset-4 hover:underline dark:text-primary-400",
        success:
          "bg-success-brand text-white hover:opacity-90 active:opacity-80 dark:bg-success-600 dark:hover:opacity-90",
        warning:
          "bg-warning-brand text-white hover:opacity-90 active:opacity-80 dark:bg-warning-600 dark:hover:opacity-90",
        error:
          "bg-error-brand text-white hover:opacity-90 active:opacity-80 dark:bg-error-600 dark:hover:opacity-90",
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
