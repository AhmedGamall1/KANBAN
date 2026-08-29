import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses } from './buttonStyles'
import type { ButtonSize, ButtonVariant } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export default function Button({
  variant,
  size,
  fullWidth,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  )
}
