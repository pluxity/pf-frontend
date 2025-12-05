import { cn } from "../../../../utils";
import type { IconProps } from "../../types";
import { iconSizes } from "../../types";

export function Info({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M7 0C10.866 0 14 3.134 14 7C14 10.866 10.866 14 7 14C3.134 14 0 10.866 0 7C0 3.134 3.134 0 7 0ZM6 9.5V11.5H8V9.5H6ZM6 2.5V8H8V2.5H6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Help({ size = "md", className, ref, ...props }: IconProps) {
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
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
      <path
        d="M7.52 8.6123H6.431C6.434 8.3096 6.46 8.0557 6.509 7.8506C6.558 7.6423 6.639 7.4535 6.753 7.2842C6.87 7.1149 7.025 6.9359 7.217 6.7471C7.367 6.6038 7.502 6.4688 7.622 6.3418C7.743 6.2116 7.839 6.0749 7.91 5.9316C7.982 5.7852 8.018 5.6175 8.018 5.4287C8.018 5.2236 7.983 5.0495 7.915 4.9062C7.847 4.763 7.746 4.654 7.612 4.5791C7.482 4.5042 7.319 4.4668 7.124 4.4668C6.961 4.4668 6.808 4.4993 6.665 4.5645C6.522 4.6263 6.406 4.724 6.318 4.8574C6.23 4.9876 6.183 5.1602 6.177 5.375H5C5.007 4.9648 5.104 4.6198 5.293 4.3398C5.482 4.0599 5.736 3.8499 6.055 3.71C6.374 3.57 6.73 3.5 7.124 3.5C7.56 3.5 7.933 3.5749 8.242 3.7246C8.551 3.8711 8.787 4.0859 8.95 4.3691C9.116 4.6491 9.199 4.9876 9.199 5.3848C9.199 5.6712 9.142 5.9316 9.028 6.166C8.914 6.3971 8.766 6.6136 8.584 6.8154C8.402 7.014 8.205 7.2126 7.993 7.4111C7.811 7.5771 7.687 7.7578 7.622 7.9531C7.557 8.1452 7.523 8.3649 7.52 8.6123ZM6.333 10.1357C6.333 9.96 6.393 9.8118 6.514 9.6914C6.634 9.5677 6.799 9.5059 7.007 9.5059C7.215 9.5059 7.38 9.5677 7.5 9.6914C7.62 9.8118 7.681 9.96 7.681 10.1357C7.681 10.3115 7.62 10.4613 7.5 10.585C7.38 10.7054 7.215 10.7656 7.007 10.7656C6.799 10.7656 6.634 10.7054 6.514 10.585C6.393 10.4613 6.333 10.3115 6.333 10.1357Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Calendar({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M12.6 1.2727H11.9V0H10.5V1.2727H3.5V0H2.1V1.2727H1.4C0.63 1.2727 0 1.8455 0 2.5455V12.7273C0 13.4273 0.63 14 1.4 14H12.6C13.37 14 14 13.4273 14 12.7273V2.5455C14 1.8455 13.37 1.2727 12.6 1.2727ZM12.6 12.7273H1.4V4.4545H12.6V12.7273Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Eye({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M7 2C3.818 2 1.101 4.0733 0 7C1.101 9.9267 3.818 12 7 12C10.182 12 12.899 9.9267 14 7C12.899 4.0733 10.182 2 7 2ZM7 10.3333C5.244 10.3333 3.818 8.84 3.818 7C3.818 5.16 5.244 3.6667 7 3.6667C8.756 3.6667 10.182 5.16 10.182 7C10.182 8.84 8.756 10.3333 7 10.3333ZM7 5C5.944 5 5.091 5.8933 5.091 7C5.091 8.1067 5.944 9 7 9C8.056 9 8.909 8.1067 8.909 7C8.909 5.8933 8.056 5 7 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EyeOff({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M7.003 3.8261C8.76 3.8261 10.186 5.2409 10.186 6.984C10.186 7.3945 10.104 7.7798 9.957 8.1398L11.816 9.984C12.778 9.1882 13.535 8.1588 14 6.984C12.899 4.2114 10.18 2.2472 6.997 2.2472C6.106 2.2472 5.252 2.4051 4.463 2.6893L5.838 4.0535C6.201 3.9082 6.589 3.8261 7.003 3.8261ZM0.637 2.1019L2.088 3.5419L2.381 3.8324C1.324 4.6472 0.497 5.7335 0 6.984C1.101 9.7566 3.82 11.7209 7.003 11.7209C7.99 11.7209 8.932 11.5314 9.792 11.1903L10.059 11.4556L11.925 13.2998L12.733 12.4977L1.445 1.2998L0.637 2.1019ZM4.157 5.5945L5.144 6.5735C5.112 6.7061 5.093 6.8451 5.093 6.984C5.093 8.0324 5.946 8.8788 7.003 8.8788C7.143 8.8788 7.283 8.8598 7.417 8.8282L8.404 9.8072C7.977 10.0156 7.506 10.1419 7.003 10.1419C5.246 10.1419 3.82 8.7272 3.82 6.984C3.82 6.4851 3.947 6.0177 4.157 5.5945ZM6.901 5.1019L8.907 7.0914L8.92 6.9903C8.92 5.9419 8.066 5.0956 7.01 5.0956L6.901 5.1019Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Bell({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M7.479 5.1333C7.479 3.1574 9.055 1.5556 11 1.5556C12.945 1.5556 14.521 3.1574 14.521 5.1333V8.4506L14.621 8.6297L15.365 9.9556H6.635L7.379 8.6296L7.479 8.4505V5.1333ZM11 0C8.21 0 5.948 2.2983 5.948 5.1333V8.0384L4.652 10.3482L4 11.5111H18L17.348 10.3481L16.052 8.0383V5.1333C16.052 2.2983 13.79 0 11 0ZM9.775 14H12.225V12.4444H9.775V14Z"
        fill="currentColor"
        transform="translate(-4, 0)"
      />
    </svg>
  );
}

export function User({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M9.188 3.5C9.188 2.2127 8.287 1.3125 7 1.3125C5.713 1.3125 4.812 2.2127 4.812 3.5C4.812 4.7873 5.713 5.6875 7 5.6875C8.287 5.6875 9.188 4.7873 9.188 3.5ZM3.5 3.5C3.5 1.5717 4.869 0 7 0C9.131 0 10.5 1.5717 10.5 3.5C10.5 5.4283 9.131 7 7 7C4.869 7 3.5 5.4283 3.5 3.5ZM2.223 12.6875H11.777C11.534 10.9566 10.046 9.625 8.25 9.625H5.75C3.954 9.625 2.466 10.9566 2.223 12.6875ZM0.875 13.1879C0.875 10.4945 3.057 8.3125 5.75 8.3125H8.25C10.943 8.3125 13.125 10.4945 13.125 13.1879C13.125 13.6363 12.761 14 12.313 14H1.687C1.239 14 0.875 13.6363 0.875 13.1879Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Mic({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M4 13H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 6.5V7.4286C11 9.4714 9.2 11.1429 7 11.1429M7 11.1429C4.8 11.1429 3 9.4714 3 7.4286V6.5M7 11.1429L7 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 2.8506C4.9989 2.5708 5.0511 2.2935 5.1533 2.0361C5.2555 1.7788 5.4048 1.5465 5.5918 1.3525C5.7795 1.1589 5.9998 1.0071 6.2402 0.9043C6.481 0.8014 6.7384 0.7489 6.9971 0.75H7C8.1019 0.75 8.9998 1.641 9 2.8525V6.8115C8.9999 8.0247 8.0682 8.9487 7.001 8.9492C6.7427 8.9484 6.4864 8.8948 6.2471 8.7891C6.0075 8.6832 5.7891 8.5276 5.6055 8.3301L5.5986 8.3223L5.4639 8.167C5.1674 7.7889 5.0003 7.3105 5 6.8105V2.8506Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function Settings({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M5.487 1H8.513V2.4388C9.147 2.6456 9.73 2.98 10.227 3.421L11.486 2.701L12.999 5.299L11.742 6.019C11.878 6.6661 11.878 7.3339 11.742 7.981L13 8.701L11.487 11.299L10.227 10.579C9.73 11.0201 9.147 11.3545 8.513 11.5612V13H5.486V11.5612C4.853 11.3543 4.269 11.0199 3.773 10.579L2.514 11.299L1.001 8.701L2.258 7.981C2.122 7.3339 2.122 6.6661 2.258 6.019L1 5.299L2.513 2.701L3.773 3.421C4.27 2.98 4.853 2.6456 5.487 2.4388V1Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="7" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}

export function Check({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M1 7.5L5 11.5L13 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckCircle({ size = "md", className, ref, ...props }: IconProps) {
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
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 7L6 9L10 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlertCircle({ size = "md", className, ref, ...props }: IconProps) {
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
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 4V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function AlertTriangle({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M6.134 1.5C6.519 0.833 7.481 0.833 7.866 1.5L13.062 10.5C13.447 11.167 12.966 12 12.196 12H1.804C1.034 12 0.553 11.167 0.938 10.5L6.134 1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="9.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function Circle({ size = "md", className, ref, ...props }: IconProps) {
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
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Clock({ size = "md", className, ref, ...props }: IconProps) {
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
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 4V7L9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Lock({ size = "md", className, ref, ...props }: IconProps) {
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
      <rect x="2" y="6" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 6V4C4 2.343 5.343 1 7 1C8.657 1 10 2.343 10 4V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="7" cy="9.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function Loader({ size = "md", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 animate-spin", className)}
      {...props}
    >
      <path d="M7 1V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M7 11V13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M11.243 2.757L9.828 4.172"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M4.172 9.828L2.757 11.243"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M13 7H11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M3 7H1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M11.243 11.243L9.828 9.828"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M4.172 4.172L2.757 2.757"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function Inbox({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M1 7.5H4L5 9.5H9L10 7.5H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 3L1 7.5V11.5C1 12.0523 1.4477 12.5 2 12.5H12C12.5523 12.5 13 12.0523 13 11.5V7.5L11.5 3C11.3 2.4 10.8 2 10.2 2H3.8C3.2 2 2.7 2.4 2.5 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Database({ size = "md", className, ref, ...props }: IconProps) {
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
      <ellipse cx="7" cy="3" rx="5.5" ry="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12.5 3V7C12.5 8.1046 10.0376 9 7 9C3.9624 9 1.5 8.1046 1.5 7V3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.5 7V11C12.5 12.1046 10.0376 13 7 13C3.9624 13 1.5 12.1046 1.5 11V7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function SearchX({ size = "md", className, ref, ...props }: IconProps) {
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
      <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 4L7 7M7 4L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Grid({ size = "md", className, ref, ...props }: IconProps) {
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
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Package({ size = "md", className, ref, ...props }: IconProps) {
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
        d="M1 4L7 1L13 4V10L7 13L1 10V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 7V13" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 4L7 7L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 2.5L10 5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Users({ size = "md", className, ref, ...props }: IconProps) {
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
      <circle cx="5" cy="3.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M1 12C1 9.791 2.791 8 5 8C7.209 8 9 9.791 9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 8.5C11.657 8.5 13 9.843 13 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BarChart({ size = "md", className, ref, ...props }: IconProps) {
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
      <path d="M3 10V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 10V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 10V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M1 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
