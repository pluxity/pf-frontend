interface JoystickIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function JoystickIcon({ size = 20, ...props }: JoystickIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      {...props}
    >
      <circle cx="12" cy="6.5" r="4" strokeWidth={1.6} />
      <line x1="12" y1="10.5" x2="12" y2="17" strokeWidth={1.6} strokeLinecap="round" />
      <ellipse cx="12" cy="20" rx="7" ry="2.2" strokeWidth={1.6} />
    </svg>
  );
}
