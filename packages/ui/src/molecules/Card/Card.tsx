import type { Ref } from "react";
import { cn } from "../../utils";
import type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from "./types";

interface CardPropsWithRef extends CardProps {
  ref?: Ref<HTMLDivElement>;
}

function Card({ className, ref, ...props }: CardPropsWithRef) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border-light bg-white shadow-card dark:border-dark-border-light dark:bg-dark-bg-card",
        className
      )}
      {...props}
    />
  );
}

interface CardHeaderPropsWithRef extends CardHeaderProps {
  ref?: Ref<HTMLDivElement>;
}

function CardHeader({ className, ref, ...props }: CardHeaderPropsWithRef) {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

interface CardTitlePropsWithRef extends CardTitleProps {
  ref?: Ref<HTMLParagraphElement>;
}

function CardTitle({ className, ref, ...props }: CardTitlePropsWithRef) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-text-primary dark:text-dark-text-primary",
        className
      )}
      {...props}
    />
  );
}

interface CardDescriptionPropsWithRef extends CardDescriptionProps {
  ref?: Ref<HTMLParagraphElement>;
}

function CardDescription({ className, ref, ...props }: CardDescriptionPropsWithRef) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-text-muted dark:text-dark-text-muted", className)}
      {...props}
    />
  );
}

interface CardContentPropsWithRef extends CardContentProps {
  ref?: Ref<HTMLDivElement>;
}

function CardContent({ className, ref, ...props }: CardContentPropsWithRef) {
  return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />;
}

interface CardFooterPropsWithRef extends CardFooterProps {
  ref?: Ref<HTMLDivElement>;
}

function CardFooter({ className, ref, ...props }: CardFooterPropsWithRef) {
  return <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
