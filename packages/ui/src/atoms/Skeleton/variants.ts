import { cva } from "class-variance-authority";

export const skeletonVariants = cva("animate-pulse bg-gray-100", {
  variants: {
    variant: {
      text: "h-4 w-full rounded",
      avatar: "rounded-full",
      card: "rounded-lg",
      rectangle: "rounded-md",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  compoundVariants: [
    { variant: "avatar", size: "sm", className: "h-8 w-8" },
    { variant: "avatar", size: "md", className: "h-12 w-12" },
    { variant: "avatar", size: "lg", className: "h-16 w-16" },
  ],
  defaultVariants: {
    variant: "text",
    size: "md",
  },
});
