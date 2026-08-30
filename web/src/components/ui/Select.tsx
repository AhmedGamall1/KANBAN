import { useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  labelHidden?: boolean;
  children: ReactNode;
}

export default function Select({
  label,
  labelHidden = false,
  id,
  className = "",
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className={
          labelHidden ? "sr-only" : "text-sm font-medium text-ink"
        }
      >
        {label}
      </label>

      <select
        id={selectId}
        className={[
          "h-9 rounded-control border border-line bg-surface px-2 capitalize",
          "text-ink transition-colors hover:border-line-strong",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
