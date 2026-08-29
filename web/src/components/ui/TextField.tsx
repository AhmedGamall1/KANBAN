import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export default function TextField({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const description = error ?? hint
  const descriptionId = `${inputId}-description`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={[
          'h-10 w-full rounded-control border bg-surface px-2.5',
          'text-ink transition-colors placeholder:text-ink-faint',
          error ? 'border-danger' : 'border-line hover:border-line-strong',
          className,
        ].join(' ')}
        {...props}
      />

      {description && (
        <p
          id={descriptionId}
          className={`text-sm ${error ? 'text-danger' : 'text-ink-muted'}`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
