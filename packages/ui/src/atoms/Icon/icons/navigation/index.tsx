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
        d="M11.2 1.2515L9.926 0L2.8 7L9.926 14L11.2 12.7485L5.3481 7L11.2 1.2515Z"
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
        d="M2.8 1.2515L4.074 0L11.2 7L4.074 14L2.8 12.7485L8.6519 7L2.8 1.2515Z"
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
        d="M12.748 11.25L14 9.9608L7 2.75L0 9.9608L1.251 11.25L7 5.3284L12.748 11.25Z"
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
        d="M1.252 2.75L0 4.0392L7 11.25L14 4.0392L12.749 2.75L7 8.6716L1.252 2.75Z"
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
        d="M11.2 1.2515L9.926 0L2.8 7L9.926 14L11.2 12.7485L5.3481 7L11.2 1.2515Z"
        fill="currentColor"
      />
      <path
        d="M16.6 1.2515L15.326 0L8.2 7L15.326 14L16.6 12.7485L10.7481 7L16.6 1.2515Z"
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
        d="M2.8 1.2515L4.074 0L11.2 7L4.074 14L2.8 12.7485L8.652 7L2.8 1.2515Z"
        fill="currentColor"
      />
      <path
        d="M-2.2 1.2515L-0.926 0L6.2 7L-0.926 14L-2.2 12.7485L3.652 7L-2.2 1.2515Z"
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
        d="M7.5 8.2848L6.742 9L2.5 5L6.742 1L7.5 1.7152L4.017 5L7.5 8.2848Z"
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
        d="M2.5 8.2848L3.258 9L7.5 5L3.258 1L2.5 1.7152L5.983 5L2.5 8.2848Z"
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
        d="M8.285 7.5L9 6.7416L5 2.5L1 6.7416L1.715 7.5L5 4.0167L8.285 7.5Z"
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
        d="M8.285 2.5L9 3.2584L5 7.5L1 3.2584L1.715 2.5L5 5.9833L8.285 2.5Z"
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
      <path d="M7.285 7L8 7.7584L4 12L0 7.7584L0.715 7L4 10.4833L7.285 7Z" fill="currentColor" />
      <path d="M7.285 5L8 4.2416L4 0L0 4.2416L0.715 5L4 1.5167L7.285 5Z" fill="currentColor" />
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
      <path d="M7 0.5L1 4.8333V13.5H5.5V8.4444H8.5V13.5H13V4.8333L7 0.5Z" fill="currentColor" />
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
