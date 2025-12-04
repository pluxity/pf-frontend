import { cn } from "../../../../utils";
import type { IconProps } from "../../types";
import { iconSizes } from "../../types";

export function Twitter({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M11.025 1.167H13.172L8.482 6.56L14 12.833H9.68L6.294 8.412L2.424 12.833H0.275L5.291 7.068L0 1.168H4.43L7.486 5.21L11.025 1.167ZM10.272 11.614H11.462L3.78 2.385H2.504L10.272 11.614Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Github({ size = "md", className, ref, ...props }: IconProps) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 0C3.1325 0 0 3.1325 0 7C0 10.0975 2.00375 12.7137 4.78625 13.6413C5.13625 13.7044 5.2675 13.4925 5.2675 13.3087C5.2675 13.1425 5.25875 12.5913 5.25875 12.005C3.5 12.3462 3.045 11.5937 2.905 11.2C2.82625 11.0162 2.485 10.395 2.1875 10.2288C1.9425 10.0975 1.5925 9.7563 2.17875 9.7475C2.73 9.7388 3.12375 10.2638 3.255 10.4737C3.885 11.5413 4.89125 11.2437 5.29375 11.06C5.355 10.605 5.53875 10.2987 5.74 10.1238C4.1825 9.9488 2.555 9.345 2.555 6.6588C2.555 5.8975 2.82625 5.26375 3.2725 4.77375C3.2025 4.59875 2.9575 3.87625 3.3425 2.91375C3.3425 2.91375 3.92875 2.73 5.2675 3.6313C5.8275 3.4738 6.4225 3.395 7.0175 3.395C7.6125 3.395 8.2075 3.4738 8.7675 3.6313C10.1063 2.72125 10.6925 2.91375 10.6925 2.91375C11.0775 3.87625 10.8325 4.59875 10.7625 4.77375C11.2087 5.26375 11.48 5.88875 11.48 6.6588C11.48 9.3538 9.84375 9.9488 8.28625 10.1238C8.54 10.3425 8.75875 10.7625 8.75875 11.4238C8.75875 12.3688 8.75 13.125 8.75 13.3087C8.75 13.4925 8.88125 13.7131 9.23125 13.6413C11.9963 12.7137 14 10.0888 14 7C14 3.1325 10.8675 0 7 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Linkedin({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M12.6 0H1.4C0.63 0 0 0.63 0 1.4V12.6C0 13.37 0.63 14 1.4 14H12.6C13.37 14 14 13.37 14 12.6V1.4C14 0.63 13.37 0 12.6 0ZM4.2 11.9H2.1V5.25H4.2V11.9ZM3.15 4.34C2.485 4.34 1.96 3.815 1.96 3.15C1.96 2.485 2.485 1.96 3.15 1.96C3.815 1.96 4.34 2.485 4.34 3.15C4.34 3.815 3.815 4.34 3.15 4.34ZM11.9 11.9H9.8V8.54C9.8 7.77 9.8 6.79 8.75 6.79C7.7 6.79 7.56 7.63 7.56 8.47V11.9H5.46V5.25H7.49V6.16H7.52C7.77 5.67 8.47 5.11 9.45 5.11C11.62 5.11 11.9 6.58 11.9 8.33V11.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Youtube({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M13.707 3.64C13.546 3.023 13.062 2.533 12.453 2.373C11.358 2.083 7 2.083 7 2.083C7 2.083 2.642 2.083 1.547 2.373C0.938 2.533 0.454 3.023 0.293 3.64C0 4.753 0 7.083 0 7.083C0 7.083 0 9.413 0.293 10.527C0.454 11.143 0.938 11.617 1.547 11.777C2.642 12.083 7 12.083 7 12.083C7 12.083 11.358 12.083 12.453 11.777C13.062 11.617 13.546 11.143 13.707 10.527C14 9.413 14 7.083 14 7.083C14 7.083 14 4.753 13.707 3.64ZM5.583 9.333V4.833L9.333 7.083L5.583 9.333Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Facebook({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M14 7C14 3.134 10.866 0 7 0C3.134 0 0 3.134 0 7C0 10.486 2.561 13.373 5.906 13.906V9.023H4.13V7H5.906V5.46C5.906 3.714 6.951 2.747 8.549 2.747C9.316 2.747 10.117 2.885 10.117 2.885V4.6H9.234C8.365 4.6 8.094 5.137 8.094 5.688V7H10.035L9.724 9.023H8.094V13.906C11.439 13.373 14 10.486 14 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Instagram({ size = "md", className, ref, ...props }: IconProps) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.2 0H9.8C12.1196 0 14 1.8804 14 4.2V9.8C14 12.1196 12.1196 14 9.8 14H4.2C1.8804 14 0 12.1196 0 9.8V4.2C0 1.8804 1.8804 0 4.2 0ZM9.8 12.6C11.348 12.6 12.6 11.348 12.6 9.8V4.2C12.6 2.652 11.348 1.4 9.8 1.4H4.2C2.652 1.4 1.4 2.652 1.4 4.2V9.8C1.4 11.348 2.652 12.6 4.2 12.6H9.8Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 7C3.5 5.067 5.067 3.5 7 3.5C8.933 3.5 10.5 5.067 10.5 7C10.5 8.933 8.933 10.5 7 10.5C5.067 10.5 3.5 8.933 3.5 7ZM4.9 7C4.9 8.161 5.839 9.1 7 9.1C8.161 9.1 9.1 8.161 9.1 7C9.1 5.839 8.161 4.9 7 4.9C5.839 4.9 4.9 5.839 4.9 7Z"
        fill="currentColor"
      />
      <circle cx="10.675" cy="3.325" r="0.525" fill="currentColor" />
    </svg>
  );
}
