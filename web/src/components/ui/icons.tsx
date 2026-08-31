interface IconProps {
  className?: string;
}

export function PlusIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 6.5 8 10l3.5-3.5" />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

export function BoardIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="3.5" height="10" rx="1" />
      <rect x="6.25" y="3" width="3.5" height="7" rx="1" />
      <rect x="10.5" y="3" width="3.5" height="4.5" rx="1" />
    </svg>
  );
}

export function MembersIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.75 13.25a4.25 4.25 0 0 1 8.5 0" />
      <path d="M10.5 3.2a2.5 2.5 0 0 1 0 4.6M11.5 9.4a4.25 4.25 0 0 1 2.75 3.85" />
    </svg>
  );
}

export function LogOutIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 2.75H3.75A1.25 1.25 0 0 0 2.5 4v8a1.25 1.25 0 0 0 1.25 1.25H6.5" />
      <path d="M10.5 11 13.5 8l-3-3M13.5 8H6.5" />
    </svg>
  );
}
