interface LogoProps {
  /** Render the mark on its own, without the wordmark next to it. */
  markOnly?: boolean;
}

export default function Logo({ markOnly = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white"
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="3" width="3.5" height="10" rx="1.25" />
          <rect x="6.25" y="3" width="3.5" height="7" rx="1.25" />
          <rect x="10.5" y="3" width="3.5" height="4.5" rx="1.25" />
        </svg>
      </span>

      {!markOnly && (
        <span className="text-lg font-semibold tracking-tight text-ink">
          Collab Board
        </span>
      )}
    </span>
  );
}
