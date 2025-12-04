import { cn } from "../../../../utils";
import type { IconProps } from "../../types";
import { iconSizes } from "../../types";

export function Plus({ size = "md", className, ref, ...props }: IconProps) {
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
      <rect x="0" y="6" width="14" height="2" fill="currentColor" />
      <rect x="6" y="14" width="14" height="2" transform="rotate(-90 6 14)" fill="currentColor" />
    </svg>
  );
}

export function Minus({ size = "md", className, ref, ...props }: IconProps) {
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
      <rect x="0" y="6" width="14" height="2" fill="currentColor" />
    </svg>
  );
}

export function Edit({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M0 11.0808V13.9971H2.916L11.517 5.396L8.601 2.4798L0 11.0808ZM13.773 3.1408C14.076 2.8375 14.076 2.3476 13.773 2.0443L11.953 0.2245C11.649 -0.0788 11.16 -0.0788 10.856 0.2245L9.433 1.6477L12.349 4.5639L13.773 3.1408Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Refresh({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M11.455 2.5L8.909 5H10.818C10.818 7.0687 9.106 8.75 7 8.75C6.357 8.75 5.746 8.5937 5.218 8.3125L4.289 9.225C5.072 9.7125 6.001 10 7 10C9.813 10 12.091 7.7625 12.091 5H14L11.455 2.5ZM3.182 5C3.182 2.9313 4.894 1.25 7 1.25C7.643 1.25 8.254 1.4062 8.782 1.6875L9.711 0.775C8.928 0.2875 7.999 0 7 0C4.187 0 1.909 2.2375 1.909 5H0L2.545 7.5L5.091 5H3.182Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Search({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M11.309 9.9284H10.659L10.976 10.3529C11.917 9.253 12.484 7.825 12.484 6.2716C12.484 2.8077 9.689 0 6.242 0C2.794 0 0 2.8077 0 6.2716C0 9.7354 2.794 12.5432 6.242 12.5432C7.788 12.5432 9.209 11.9739 10.304 11.0283L9.977 10.6134V11.2921L12.569 14L14 12.5624L11.309 9.9284ZM6.242 10.6134C3.851 10.6134 1.921 8.6741 1.921 6.2716C1.921 3.8691 3.851 1.9297 6.242 1.9297C8.633 1.9297 10.563 3.8691 10.563 6.2716C10.563 8.6741 8.633 10.6134 6.242 10.6134Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Close({ size = "md", className, ref, ...props }: IconProps) {
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
      <circle cx="5" cy="5" r="5" fill="currentColor" />
      <path
        d="M3.5 2.793L5 4.293L6.5 2.793L7.207 3.5L5.707 5L7.207 6.5L6.5 7.207L5 5.707L3.5 7.207L2.793 6.5L4.293 5L2.793 3.5L3.5 2.793Z"
        fill="white"
      />
    </svg>
  );
}

export function Menu({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="0" y="0" width="18" height="2" fill="currentColor" />
      <rect x="0" y="6" width="18" height="2" fill="currentColor" />
      <rect x="0" y="12" width="18" height="2" fill="currentColor" />
    </svg>
  );
}

export function MoreVertical({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 4 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="0" y="0" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="0" y="6" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="0" y="12" width="4" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Shrink({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M8.4 1.2515L7.126 0L0 7L7.126 14L8.4 12.7485L2.548 7L8.4 1.2515Z"
        fill="currentColor"
      />
    </svg>
  );
}
