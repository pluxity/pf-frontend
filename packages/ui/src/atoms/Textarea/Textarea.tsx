import { cn } from "../../utils";
import { textareaVariants } from "./variants";
import type { TextareaProps } from "./types";

function Textarea({ className, error, textareaSize, ref, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        textareaVariants({ textareaSize }),
        error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Textarea };
