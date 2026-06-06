import type { CSSProperties, HTMLAttributes } from 'react'
import type { KnitPattern, KnitStitch } from '../pattern'
import {
  getKnitRowWidth,
  getKnitStitchSpan,
  validateKnitPattern,
} from '../pattern'
import { KnitStitchUnit } from './KnitStitchUnit'
import '../styles/knit-ui.css'

export type KnitPatternDensity = 'compact' | 'regular' | 'loose'
export type KnitPatternRowAlign = 'center' | 'start'

export interface KnitPatternViewProps extends HTMLAttributes<HTMLDivElement> {
  pattern: KnitPattern
  density?: KnitPatternDensity
  stitchSize?: number | string
  gap?: number | string
  rowGap?: number | string
  rowAlign?: KnitPatternRowAlign
  allowIncompleteRows?: boolean
}

export function KnitPatternView({
  pattern,
  density = 'regular',
  stitchSize = 48,
  gap,
  rowGap,
  rowAlign = 'center',
  allowIncompleteRows,
  className,
  style,
  ...props
}: KnitPatternViewProps) {
  const validation = validateKnitPattern(pattern, { allowIncompleteRows })
  const classes = [
    'knit-pattern-view',
    `knit-pattern-view--${density}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const patternStyle = {
    ...style,
    '--knit-pattern-cast-on': pattern.castOn,
    '--knit-pattern-stitch-size': toCssSize(stitchSize),
    ...(gap ? { '--knit-pattern-gap': toCssSize(gap) } : {}),
    ...(rowGap ? { '--knit-pattern-row-gap': toCssSize(rowGap) } : {}),
  } as CSSProperties
  const ariaLabel = props['aria-label']

  return (
    <div
      aria-hidden={ariaLabel ? undefined : true}
      className={classes}
      data-row-count={pattern.rows.length}
      data-valid={validation.valid ? 'true' : 'false'}
      role={ariaLabel ? 'img' : undefined}
      style={patternStyle}
      {...props}
    >
      {pattern.rows.map((row, rowIndex) => {
        const rowColumns =
          rowAlign === 'center' ? getKnitRowWidth(row.stitches) : pattern.castOn

        return (
          <div
            className="knit-pattern-view__row"
            key={rowIndex}
            style={
              {
                '--knit-pattern-row-columns': rowColumns,
              } as CSSProperties
            }
          >
            {row.stitches.map((stitch, stitchIndex) => (
              <KnitStitchUnit
                className="knit-pattern-view__stitch"
                color={getPatternStitchColor(pattern, stitch)}
                key={`${rowIndex}-${stitchIndex}`}
                kind={stitch.kind}
                size="var(--knit-pattern-stitch-size)"
                style={{
                  gridColumn: `span ${getKnitStitchSpan(stitch)}`,
                }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

function getPatternStitchColor(
  pattern: KnitPattern,
  stitch: KnitStitch,
): string | undefined {
  return stitch.color ?? pattern.palette?.colors[0]
}
