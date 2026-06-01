import type { ButtonHTMLAttributes, ReactNode } from 'react'
import '../styles/knit-ui.css'

type ButtonVariant = 'primary' | 'secondary'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const classes = ['knit-button', `knit-button--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  )
}
