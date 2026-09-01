interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label = "Loading" }: SpinnerProps) {
  return (
    <div className="flex min-h-40 flex-1 items-center justify-center">
      <span
        role="status"
        aria-label={label}
        className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand"
      />
    </div>
  );
}
