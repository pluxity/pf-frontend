import { cn } from "../../utils";
import { inputVariants } from "./variants";
import type { InputProps } from "./types";

function Input({ className, type, error, inputSize, ref, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        inputVariants({ inputSize }),
        error && "border-error-brand focus:border-error-brand focus:ring-error-brand/20",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Input };
