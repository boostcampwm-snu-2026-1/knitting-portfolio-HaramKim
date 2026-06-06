import type { CSSProperties, HTMLAttributes } from 'react'
import type { KnitCable, KnitPattern, KnitRow, KnitStitch } from '../pattern'
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
      <div className="knit-pattern-view__fabric">
        {pattern.rows.flatMap((row, rowIndex) =>
          getPositionedStitches(pattern, row, rowAlign).map(
            ({ stitch, stitchIndex, column }) => (
              <KnitStitchUnit
                className="knit-pattern-view__stitch"
                color={getPatternStitchColor(pattern, stitch)}
                key={`${rowIndex}-${stitchIndex}`}
                kind={stitch.kind}
                size="var(--knit-pattern-stitch-size)"
                style={{
                  gridColumn: `${column} / span ${getKnitStitchSpan(stitch)}`,
                  gridRow: rowIndex + 1,
                }}
              />
            ),
          ),
        )}
        {pattern.cables?.map((cable, cableIndex) => (
          <KnitCableOverlay
            cable={cable}
            color={getPatternCableColor(pattern)}
            key={`${cable.row}-${cable.stitch}-${cableIndex}`}
            pattern={pattern}
            rowAlign={rowAlign}
          />
        ))}
      </div>
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

function getPatternCableColor(pattern: KnitPattern): string | undefined {
  return pattern.palette?.colors[0]
}

function getPositionedStitches(
  pattern: KnitPattern,
  row: KnitRow,
  rowAlign: KnitPatternRowAlign,
) {
  let column = getRowStartColumn(pattern, row, rowAlign)

  return row.stitches.map((stitch, stitchIndex) => {
    const positionedStitch = {
      column,
      stitch,
      stitchIndex,
    }

    column += getKnitStitchSpan(stitch)

    return positionedStitch
  })
}

function getRowStartColumn(
  pattern: KnitPattern,
  row: KnitRow,
  rowAlign: KnitPatternRowAlign,
): number {
  if (rowAlign === 'start') {
    return 1
  }

  const rowWidth = getKnitRowWidth(row.stitches)

  return Math.max(1, Math.floor((pattern.castOn - rowWidth) / 2) + 1)
}

interface KnitCableOverlayProps {
  cable: KnitCable
  color?: string
  pattern: KnitPattern
  rowAlign: KnitPatternRowAlign
}

function KnitCableOverlay({
  cable,
  color,
  pattern,
  rowAlign,
}: KnitCableOverlayProps) {
  const backPath =
    cable.direction === 'left'
      ? 'M25 4 C30 34 70 62 75 96'
      : 'M75 4 C70 34 30 62 25 96'
  const frontPath =
    cable.direction === 'left'
      ? 'M75 4 C70 34 30 62 25 96'
      : 'M25 4 C30 34 70 62 75 96'
  const row = pattern.rows[cable.row]
  const rowStart = row ? getRowStartColumn(pattern, row, rowAlign) : 1
  const column = rowStart + cable.stitch
  const style = {
    '--knit-cable-color': color,
    gridColumn: `${column} / span ${cable.width}`,
    gridRow: `${cable.row + 1} / span ${cable.height}`,
  } as CSSProperties

  return (
    <svg
      aria-hidden="true"
      className={`knit-pattern-view__cable knit-pattern-view__cable--${cable.direction}`}
      focusable="false"
      preserveAspectRatio="none"
      style={style}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="knit-pattern-view__cable-strand knit-pattern-view__cable-strand--back"
        d={backPath}
      />
      <path
        className="knit-pattern-view__cable-strand knit-pattern-view__cable-strand--front"
        d={frontPath}
      />
    </svg>
  )
}
