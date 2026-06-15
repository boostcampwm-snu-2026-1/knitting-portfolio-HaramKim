import type { CSSProperties, SVGProps } from 'react'
import type { StitchKind } from '../pattern'
import '../styles/knit-ui.css'

export interface KnitStitchUnitProps
  extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  kind: StitchKind
  color?: string
  size?: number | string
}

export function KnitStitchUnit({
  kind,
  color,
  size = 48,
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
  } as CSSProperties
  const ariaLabel = props['aria-label']
  const viewBox = kind === 'mistake' ? '0 0 75 81' : '0 0 120 96'

  return (
    <svg
      aria-hidden={ariaLabel ? undefined : true}
      className={classes}
      focusable="false"
      role={ariaLabel ? 'img' : undefined}
      style={stitchStyle}
      viewBox={viewBox}
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
        className="knit-stitch-unit__fill"
        d="M20 90C18 66 10 47 2 36C15 23 24 11 34 0C48 19 58 42 60 88L20 90Z"
      />
      <path
        className="knit-stitch-unit__fill"
        d="M100 90C102 66 110 47 118 36C105 23 96 11 86 0C72 19 62 42 60 88L100 90Z"
      />
    </>
  )
}

function PurlShape() {
  return (
    <path
      className="knit-stitch-unit__fill"
      d="M8 34C28 26 45 22 60 22C75 22 92 26 112 34L101 68C84 62 70 59 60 59C50 59 36 62 19 68L8 34Z"
    />
  )
}

function MistakeShape() {
  return (
    <path
      className="knit-stitch-unit__mistake-thread"
      d="M31.5085 70C11.9446 50.4444 5.09774 15 37.3779 15C69.658 15 63.7885 49.8333 42.2686 70"
    />
  )
}
