import { cn } from "../../../../utils";
import type { IconProps } from "../../types";
import { iconSizes } from "../../types";

export function Play({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M4 6.13352V17.8681C4 20.2714 6.38344 21.7796 8.28571 20.578L12.9295 17.6474L17.5733 14.7045C19.4756 13.5029 19.4756 10.4987 17.5733 9.29708L12.9295 6.35424L8.28571 3.42366C6.38344 2.222 4 3.71794 4 6.13352Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Pause({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M10.65 19.11V4.89C10.65 3.54 10.08 3 8.64 3H5.01C3.57 3 3 3.54 3 4.89V19.11C3 20.46 3.57 21 5.01 21H8.64C10.08 21 10.65 20.46 10.65 19.11Z"
        fill="currentColor"
      />
      <path
        d="M21.0001 19.11V4.89C21.0001 3.54 20.4301 3 18.9901 3H15.3601C13.9301 3 13.3501 3.54 13.3501 4.89V19.11C13.3501 20.46 13.9201 21 15.3601 21H18.9901C20.4301 21 21.0001 20.46 21.0001 19.11Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Stop({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
    </svg>
  );
}

export function Replay({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M12.5 4.8V0L6.5625 6L12.5 12V7.2C16.4306 7.2 19.625 10.428 19.625 14.4C19.625 18.372 16.4306 21.6 12.5 21.6C8.56938 21.6 5.375 18.372 5.375 14.4H3C3 19.704 7.25125 24 12.5 24C17.7487 24 22 19.704 22 14.4C22 9.096 17.7487 4.8 12.5 4.8Z"
        fill="currentColor"
      />
    </svg>
  );
}
