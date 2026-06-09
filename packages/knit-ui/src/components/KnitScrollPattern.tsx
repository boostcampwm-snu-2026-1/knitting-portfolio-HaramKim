import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { KnitPattern } from '../pattern'
import {
  KnitPatternView,
  type KnitPatternRevealOrder,
  type KnitPatternViewProps,
} from './KnitPatternView'
import '../styles/knit-ui.css'

export type KnitScrollStitchOrder = KnitPatternRevealOrder

export interface KnitScrollNeedleOptions {
  visible?: boolean
  color?: string
  highlightColor?: string
  thickness?: number | string
  angle?: number
}

export interface KnitScrollPatternProps
  extends Omit<KnitPatternViewProps, 'aria-hidden' | 'role' | 'reveal'> {
  needle?: KnitScrollNeedleOptions
  scrollLength?: number | string
  stitchOrder?: KnitScrollStitchOrder
}

export function KnitScrollPattern({
  className,
  density = 'regular',
  gap,
  needle,
  pattern,
  rowGap,
  scrollLength = '160vh',
  stitchOrder = 'alternating',
  stitchOverlap,
  stitchSize = 48,
  style,
  ...patternViewProps
}: KnitScrollPatternProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const progress = useKnitScrollProgress(rootRef)
  const visibleStitchCount = useMemo(
    () => Math.ceil(getScrollableStitchCount(pattern) * progress),
    [pattern, progress],
  )
  const totalStitchCount = getScrollableStitchCount(pattern)
  const stitchMotionProgress = getLoopProgress(progress * totalStitchCount*0.25)
  const needlePierceProgress = Math.sin(stitchMotionProgress * Math.PI)
  const needleLiftProgress = Math.sin(stitchMotionProgress * Math.PI * 2)
  const needleAngle = needle?.angle ?? 13.63
  const visibleRowCount = Math.min(
    pattern.rows.length,
    Math.max(1, Math.ceil(visibleStitchCount / pattern.castOn)),
  )
  const classes = ['knit-scroll-pattern', className].filter(Boolean).join(' ')
  const scrollStyle = {
    ...style,
    '--knit-scroll-progress': progress,
    '--knit-scroll-needle-left-angle': `${(needleAngle + needleLiftProgress * 2) * -1}deg`,
    '--knit-scroll-needle-left-x': `${needlePierceProgress * -12}px`,
    '--knit-scroll-needle-left-y': `${needleLiftProgress * -7}px`,
    '--knit-scroll-needle-right-angle': `${needleAngle + needlePierceProgress * -5}deg`,
    '--knit-scroll-needle-right-x': `${needlePierceProgress * -34}px`,
    '--knit-scroll-needle-right-y': `${needleLiftProgress * 12}px`,
    '--knit-scroll-total-rows': pattern.rows.length,
    '--knit-scroll-visible-rows': visibleRowCount,
    '--knit-scroll-length': toCssSize(scrollLength),
    '--knit-scroll-stitch-size': toCssSize(stitchSize),
    '--knit-scroll-stitch-overlap': toCssSize(stitchOverlap ?? 6),
    '--knit-scroll-row-gap': toCssSize(
      rowGap ?? gap ?? getDensityGap(density),
    ),
    '--knit-scroll-needle-angle': `${needleAngle}deg`,
    '--knit-scroll-needle-color': needle?.color,
    '--knit-scroll-needle-highlight': needle?.highlightColor,
    '--knit-scroll-needle-thickness': needle?.thickness
      ? toCssSize(needle.thickness)
      : undefined,
  } as CSSProperties

  return (
    <div className={classes} ref={rootRef} style={scrollStyle}>
      <div className="knit-scroll-pattern__stage">
        {needle?.visible ? <KnitScrollNeedles /> : null}
        <div className="knit-scroll-pattern__fabric">
          <KnitPatternView
            {...patternViewProps}
            density={density}
            gap={gap}
            pattern={pattern}
            reveal={{
              direction: 'bottom-to-top',
              order: stitchOrder,
              visibleStitchCount,
            }}
            rowGap={rowGap}
            stitchOverlap={stitchOverlap}
            stitchSize={stitchSize}
          />
        </div>
      </div>
    </div>
  )
}

function KnitScrollNeedles() {
  return (
    <div aria-hidden="true" className="knit-scroll-pattern__needles">
      <span className="knit-scroll-pattern__needle knit-scroll-pattern__needle--left" />
      <span className="knit-scroll-pattern__needle knit-scroll-pattern__needle--right" />
    </div>
  )
}

function useKnitScrollProgress(rootRef: RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    let frame = 0

    if (prefersReducedMotion.matches) {
      frame = window.requestAnimationFrame(() => setProgress(1))

      return () => window.cancelAnimationFrame(frame)
    }

    const updateProgress = () => {
      const root = rootRef.current

      if (!root) {
        return
      }

      const rect = root.getBoundingClientRect()
      const scrollDistance = Math.max(1, root.offsetHeight - window.innerHeight)
      const nextProgress = clampNumber(-rect.top / scrollDistance, 0, 1)

      setProgress(nextProgress)
    }
    const requestUpdate = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateProgress)
    }

    requestUpdate()
    window.addEventListener('resize', requestUpdate)
    window.addEventListener('scroll', requestUpdate, { passive: true })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('scroll', requestUpdate)
    }
  }, [rootRef])

  return progress
}

function getScrollableStitchCount(pattern: KnitPattern): number {
  return pattern.castOn * pattern.rows.length
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

function getDensityGap(density: KnitPatternViewProps['density']): number {
  if (density === 'compact') {
    return 2
  }

  if (density === 'loose') {
    return 8
  }

  return 4
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getLoopProgress(value: number): number {
  return value - Math.floor(value)
}
