import type { CSSProperties, SVGProps } from 'react'
import type { StitchKind } from '../pattern'
import '../styles/knit-ui.css'

export interface KnitStitchUnitProps
  extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  kind: StitchKind
  color?: string
  size?: number | string
  strokeWidth?: number | string
}

export function KnitStitchUnit({
  kind,
  color,
  size = 48,
  strokeWidth,
  className,
  style,
  ...props
}: KnitStitchUnitProps) {
  const classes = ['knit-stitch-unit', `knit-stitch-unit--${kind}`, className]
    .filter(Boolean)
    .join(' ')
  const stitchStyle = {
    ...style,
    '--knit-stitch-color': color,
    '--knit-stitch-size': typeof size === 'number' ? `${size}px` : size,
    ...(strokeWidth
      ? {
          '--knit-stitch-stroke-width':
            typeof strokeWidth === 'number' ? `${strokeWidth}px` : strokeWidth,
        }
      : {}),
  } as CSSProperties
  const ariaLabel = props['aria-label']

  return (
    <svg
      aria-hidden={ariaLabel ? undefined : true}
      className={classes}
      focusable="false"
      role={ariaLabel ? 'img' : undefined}
      style={stitchStyle}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {kind === 'knit' ? <KnitShape /> : null}
      {kind === 'purl' ? <PurlShape /> : null}
      {kind === 'mistake' ? <MistakeShape /> : null}
    </svg>
  )
}

function KnitShape() {
  return (
    <>
      <path
        className="knit-stitch-unit__thread"
        d="M22.6 28.4C22.6 28.4 36 44.1 40.9 56.1C45.8 68.1 48.6 91.6 48.6 91.6"
      />
      <path
        className="knit-stitch-unit__thread"
        d="M105.6 28.4C105.6 28.4 94.8 37.9 89.9 49.9C85 61.9 79.5 91.6 79.5 91.6"
      />
    </>
  )
}

function PurlShape() {
  return (
    <path
      className="knit-stitch-unit__thread"
      d="M20.1 65.8C20.1 65.8 48.1 54.4 66 53.2C83.9 52 112 61.6 112 61.6"
    />
  )
}

function MistakeShape() {
  return (
    <path
      className="knit-stitch-unit__thread"
      d="M51.6 103.7C22.6 74.7 12.5 22.2 60.3 22.2C108.1 22.2 99.4 73.8 67.5 103.7"
    />
  )
}
