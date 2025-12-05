import { cn } from "../../../../utils";
import type { IconProps } from "../../types";
import { iconSizes } from "../../types";

export function Upload({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M7 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M3 5L7 1L11 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 10V12C1 12.552 1.448 13 2 13H12C12.552 13 13 12.552 13 12V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function File({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M2 1.5C2 0.948 2.448 0.5 3 0.5H8L12 4.5V12.5C12 13.052 11.552 13.5 11 13.5H3C2.448 13.5 2 13.052 2 12.5V1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 0.5V4.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function FileText({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M2 1.5C2 0.948 2.448 0.5 3 0.5H8L12 4.5V12.5C12 13.052 11.552 13.5 11 13.5H3C2.448 13.5 2 13.052 2 12.5V1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 0.5V4.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.5 7.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 10H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Folder({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M1 3C1 2.448 1.448 2 2 2H5L6.5 4H12C12.552 4 13 4.448 13 5V11C13 11.552 12.552 12 12 12H2C1.448 12 1 11.552 1 11V3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Image({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4.5" cy="4.5" r="1.5" fill="currentColor" />
      <path
        d="M1 10L4 7L6.5 9.5L9 6L13 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Music({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M5 10.5V3L12 1.5V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Video({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="1" y="3" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6L13 4V10L10 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Code({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M4.5 4L1.5 7L4.5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 4L12.5 7L9.5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 2L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
