import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-subtle',
  ghost: 'text-ink-muted hover:bg-subtle hover:text-ink',
  danger: 'bg-danger text-white hover:brightness-95',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1 px-2.5 text-sm',
  md: 'h-9 gap-1.5 px-3',
  lg: 'h-10 gap-2 px-4',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      // Buttons default to type="submit" in HTML, which silently submits any
      // surrounding form. Every button here is inert unless it asks not to be.
      type={type}
      className={[
        'inline-flex items-center justify-center rounded-control font-medium',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    />
  )
}
