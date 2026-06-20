import type { CSSProperties, HTMLAttributes } from 'react'
import '../styles/knit-ui.css'

export type KnitPatternGroupDirection = 'vertical' | 'horizontal'

export interface KnitPatternGroupProps extends HTMLAttributes<HTMLDivElement> {
  direction?: KnitPatternGroupDirection
  gap?: number | string
}

export function KnitPatternGroup({
  children,
  className,
  direction = 'vertical',
  gap,
  style,
  ...props
}: KnitPatternGroupProps) {
  const classes = [
    'knit-pattern-group',
    `knit-pattern-group--${direction}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const groupStyle = {
    ...style,
    ...(gap !== undefined ? { '--knit-pattern-group-gap': toCssSize(gap) } : {}),
  } as CSSProperties

  return (
    <div className={classes} style={groupStyle} {...props}>
      {children}
    </div>
  )
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}
