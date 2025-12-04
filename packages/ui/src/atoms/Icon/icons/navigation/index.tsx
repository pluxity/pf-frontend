import { cn } from "../../../../utils";
import type { IconProps } from "../../types";
import { iconSizes } from "../../types";

export function ChevronLeft({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M8.4 1.2515L7.126 0L0 7L7.126 14L8.4 12.7485L2.5481 7L8.4 1.2515Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronRight({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M5.6 1.2515L6.874 0L14 7L6.874 14L5.6 12.7485L11.4519 7L5.6 1.2515Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronUp({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M12.748 11L14 9.7108L7 2.5L0 9.7108L1.251 11L7 5.0784L12.748 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronDown({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M1.252 2.5L0 3.7892L7 11L14 3.7892L12.749 2.5L7 8.4216L1.252 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronLeftDouble({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M8.4 1.2515L7.126 0L0 7L7.126 14L8.4 12.7485L2.5481 7L8.4 1.2515Z"
        fill="currentColor"
      />
      <path
        d="M13.8 1.2515L12.526 0L5.4 7L12.526 14L13.8 12.7485L7.9481 7L13.8 1.2515Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronRightDouble({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M5.6 1.2515L6.874 0L14 7L6.874 14L5.6 12.7485L11.452 7L5.6 1.2515Z"
        fill="currentColor"
      />
      <path
        d="M0.6 1.2515L1.874 0L9 7L1.874 14L0.6 12.7485L6.452 7L0.6 1.2515Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function X({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M12.748 14L14 12.7553L7 5.7931L0 12.7553L1.252 14L7 8.2826L12.748 14Z"
        fill="currentColor"
      />
      <path
        d="M1.252 0L0 1.2447L7 8.2069L14 1.2447L12.748 0L7 5.7174L1.252 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronLeftSmall({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M6 7.2848L5.242 8L1 4L5.242 0L6 0.7152L2.517 4L6 7.2848Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronRightSmall({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M4 7.2848L4.758 8L9 4L4.758 0L4 0.7152L7.483 4L4 7.2848Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronUpSmall({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M7.285 6L8 5.2416L4 1L0 5.2416L0.715 6L4 2.5167L7.285 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronDownSmall({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M7.285 2L8 2.7584L4 7L0 2.7584L0.715 2L4 5.4833L7.285 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronUpDownSmall({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 8 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M7.285 7L8 7.7584L4 12L0 7.7584L0.715 7L4 10.4833L7.285 7Z"
        fill="currentColor"
      />
      <path
        d="M7.285 5L8 4.2416L4 0L0 4.2416L0.715 5L4 1.5167L7.285 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Home({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M7 0.5L1 4.8333V13.5H5.5V8.4444H8.5V13.5H13V4.8333L7 0.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ExternalLink({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M12.444 12.4444H1.556V1.5556H6V0H1.556C0.692 0 0 0.7 0 1.5556V12.4444C0 13.3 0.692 14 1.556 14H12.444C13.3 14 14 13.3 14 12.4444V8H12.444V12.4444ZM8.556 0V1.5556H11.348L3.702 9.2011L4.799 10.2978L12.444 2.6522V5.4444H14V0H8.556Z"
        fill="currentColor"
      />
    </svg>
  );
}
