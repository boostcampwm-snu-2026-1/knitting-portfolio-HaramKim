import { useState } from 'react'
import type { CSSProperties, HTMLAttributes, KeyboardEvent } from 'react'
import type {
  KnitCable,
  KnitCableColor,
  KnitPattern,
  KnitRow,
  KnitStitch,
} from '../pattern'
import {
  getKnitCableCount,
  getKnitCableWidth,
  getKnitRowWidth,
  getKnitStitchSpan,
  validateKnitPattern,
} from '../pattern'
import { KnitStitchUnit } from './KnitStitchUnit'
import '../styles/knit-ui.css'

export type KnitPatternDensity = 'compact' | 'regular' | 'loose'
export type KnitPatternRowAlign = 'center' | 'start'
export type KnitPatternRevealOrder =
  | 'left-to-right'
  | 'right-to-left'
  | 'alternating'

export interface KnitPatternRevealOptions {
  direction?: 'top-to-bottom' | 'bottom-to-top'
  order?: KnitPatternRevealOrder
  visibleStitchCount: number
}

export interface KnitPatternViewProps extends HTMLAttributes<HTMLDivElement> {
  pattern: KnitPattern
  density?: KnitPatternDensity
  stitchSize?: number | string
  stitchOverlap?: number | string
  gap?: number | string
  rowGap?: number | string
  rowAlign?: KnitPatternRowAlign
  reveal?: KnitPatternRevealOptions
  allowIncompleteRows?: boolean
  mistakeFrequency?: number
}

export function KnitPatternView({
  pattern,
  density = 'regular',
  stitchSize = 48,
  stitchOverlap,
  gap,
  rowGap,
  rowAlign = 'center',
  reveal,
  allowIncompleteRows,
  mistakeFrequency = 0,
  className,
  style,
  ...props
}: KnitPatternViewProps) {
  const [resolvedMistakeCells, setResolvedMistakeCells] = useState<Set<string>>(
    () => new Set(),
  )
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
    ...(stitchOverlap
      ? { '--knit-pattern-stitch-overlap': toCssSize(stitchOverlap) }
      : {}),
    ...(gap ? { '--knit-pattern-gap': toCssSize(gap) } : {}),
    ...(rowGap ? { '--knit-pattern-row-gap': toCssSize(rowGap) } : {}),
  } as CSSProperties
  const ariaLabel = props['aria-label']
  const cables = getExpandedCables(pattern.cables)
  const hiddenStitchCells = getHiddenStitchCells(cables)
  const normalizedMistakeFrequency = normalizeMistakeFrequency(mistakeFrequency)
  const hasInteractiveMistakes = normalizedMistakeFrequency > 0

  function resolveMistake(cellKey: string) {
    setResolvedMistakeCells((currentCells) => {
      if (currentCells.has(cellKey)) {
        return currentCells
      }

      const nextCells = new Set(currentCells)
      nextCells.add(cellKey)

      return nextCells
    })
  }

  return (
    <div
      aria-hidden={ariaLabel || hasInteractiveMistakes ? undefined : true}
      className={classes}
      data-row-count={pattern.rows.length}
      data-valid={validation.valid ? 'true' : 'false'}
      role={ariaLabel && !hasInteractiveMistakes ? 'img' : undefined}
      style={patternStyle}
      {...props}
    >
      <div className="knit-pattern-view__fabric">
        {pattern.rows.flatMap((row, rowIndex) =>
          getPositionedStitches(pattern, row, rowAlign).map(
            ({ stitch, stitchIndex, column }) => {
              const columnIndex = column - 1
              const cellKey = getStitchCellKey(rowIndex, columnIndex)
              const isResolvedMistake = resolvedMistakeCells.has(cellKey)
              const isResolvableMistake =
                !isResolvedMistake &&
                isGeneratedMistakeStitch(
                  stitch,
                  normalizedMistakeFrequency,
                  rowIndex,
                  columnIndex,
                )
              const renderedKind = isResolvableMistake ? 'mistake' : stitch.kind
              const stitchClassName = getRevealClasses(
                [
                  'knit-pattern-view__stitch',
                  isResolvableMistake
                    ? 'knit-stitch-unit--resolvable-mistake'
                    : undefined,
                  isResolvedMistake
                    ? 'knit-stitch-unit--resolved-mistake'
                    : undefined,
                ]
                  .filter(Boolean)
                  .join(' '),
                pattern,
                reveal,
                rowIndex,
                columnIndex,
              )

              return isStitchHidden(
                hiddenStitchCells,
                rowIndex,
                column,
                stitch,
              ) ? null : (
                <KnitStitchUnit
                  aria-label={
                    isResolvableMistake
                      ? 'Resolve mistake stitch'
                      : undefined
                  }
                  className={stitchClassName}
                  color={getPatternStitchColor(pattern, stitch)}
                  key={`${rowIndex}-${stitchIndex}`}
                  kind={renderedKind}
                  onClick={
                    isResolvableMistake
                      ? () => resolveMistake(cellKey)
                      : undefined
                  }
                  onKeyDown={
                    isResolvableMistake
                      ? (event) => handleMistakeKeyDown(event, cellKey, resolveMistake)
                      : undefined
                  }
                  role={isResolvableMistake ? 'button' : undefined}
                  size="var(--knit-pattern-stitch-size)"
                  style={{
                    gridColumn: `${column} / span ${getKnitStitchSpan(stitch)}`,
                    gridRow: rowIndex + 1,
                  }}
                  tabIndex={isResolvableMistake ? 0 : undefined}
                />
              )
            },
          ),
        )}
        {cables.map((cable, cableIndex) => (
          <KnitCableOverlay
            cable={cable}
            key={`${cable.row}-${cable.leftStartStitch}-${cableIndex}`}
            pattern={pattern}
            reveal={reveal}
            rowAlign={rowAlign}
          />
        ))}
      </div>
    </div>
  )
}

function getExpandedCables(cables: KnitCable[] | undefined): KnitCable[] {
  return (
    cables?.flatMap((cable) =>
      Array.from({ length: getKnitCableCount(cable) }, (_, repeatIndex) =>
        getRepeatedCable(cable, repeatIndex),
      ),
    ) ?? []
  )
}

function getRepeatedCable(cable: KnitCable, repeatIndex: number): KnitCable {
  return {
    color: cable.color,
    cross: getRepeatedCableCross(cable.cross, repeatIndex),
    height: cable.height,
    leftEndStitch: cable.leftEndStitch,
    leftStartStitch: cable.leftStartStitch,
    rightEndStitch: cable.rightEndStitch,
    rightStartStitch: cable.rightStartStitch,
    row: cable.row + cable.height * repeatIndex,
  }
}

function getRepeatedCableCross(
  cross: KnitCable['cross'],
  repeatIndex: number,
): KnitCable['cross'] {
  if (repeatIndex % 2 === 0) {
    return cross
  }

  return cross === 'left-over-right' ? 'right-over-left' : 'left-over-right'
}

function getHiddenStitchCells(cables: KnitCable[]): Set<string> {
  const cells = new Set<string>()

  cables.forEach((cable) => {
    for (let row = cable.row; row < cable.row + cable.height; row += 1) {
      for (
        let column = cable.leftStartStitch;
        column <= cable.rightEndStitch;
        column += 1
      ) {
        cells.add(getStitchCellKey(row, column))
      }
    }
  })

  return cells
}

function isStitchHidden(
  cells: Set<string>,
  rowIndex: number,
  column: number,
  stitch: KnitStitch,
): boolean {
  const span = getKnitStitchSpan(stitch)

  return Array.from({ length: span }, (_, spanIndex) =>
    cells.has(getStitchCellKey(rowIndex, column + spanIndex - 1)),
  ).some(Boolean)
}

function getStitchCellKey(row: number, column: number): string {
  return `${row}:${column}`
}

function getRevealClasses(
  className: string,
  pattern: KnitPattern,
  reveal: KnitPatternRevealOptions | undefined,
  rowIndex: number,
  columnIndex: number,
): string {
  if (!reveal) {
    return className
  }

  const revealIndex = getRevealIndex(
    pattern,
    rowIndex,
    columnIndex,
    reveal.direction ?? 'top-to-bottom',
    reveal.order ?? 'left-to-right',
  )
  const revealClass =
    revealIndex < reveal.visibleStitchCount
      ? 'knit-pattern-view__reveal-stitch--visible'
      : 'knit-pattern-view__reveal-stitch--hidden'

  return `${className} knit-pattern-view__reveal-stitch ${revealClass}`
}

function getRevealIndex(
  pattern: KnitPattern,
  rowIndex: number,
  columnIndex: number,
  direction: KnitPatternRevealOptions['direction'],
  order: KnitPatternRevealOrder,
): number {
  const revealRowIndex =
    direction === 'bottom-to-top'
      ? pattern.rows.length - rowIndex - 1
      : rowIndex

  return (
    revealRowIndex * pattern.castOn +
    getRevealColumnIndex(pattern, revealRowIndex, columnIndex, order)
  )
}

function getRevealColumnIndex(
  pattern: KnitPattern,
  revealRowIndex: number,
  columnIndex: number,
  order: KnitPatternRevealOrder,
): number {
  if (order === 'right-to-left') {
    return pattern.castOn - columnIndex - 1
  }

  if (order === 'alternating' && revealRowIndex % 2 === 1) {
    return pattern.castOn - columnIndex - 1
  }

  return columnIndex
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

function isGeneratedMistakeStitch(
  stitch: KnitStitch,
  mistakeFrequency: number,
  rowIndex: number,
  columnIndex: number,
): boolean {
  if (stitch.kind === 'mistake' || mistakeFrequency <= 0) {
    return false
  }

  return getStitchRandomValue(rowIndex, columnIndex) < mistakeFrequency
}

function handleMistakeKeyDown(
  event: KeyboardEvent<SVGSVGElement>,
  cellKey: string,
  resolveMistake: (cellKey: string) => void,
) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  resolveMistake(cellKey)
}

function normalizeMistakeFrequency(frequency: number): number {
  if (!Number.isFinite(frequency)) {
    return 0
  }

  return clampNumber(frequency, 0, 1)
}

function getStitchRandomValue(rowIndex: number, columnIndex: number): number {
  let hash =
    Math.imul(rowIndex + 1, 374761393) ^
    Math.imul(columnIndex + 1, 668265263)

  hash = Math.imul(hash ^ (hash >>> 13), 1274126177)

  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296
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
  pattern: KnitPattern
  reveal?: KnitPatternRevealOptions
  rowAlign: KnitPatternRowAlign
}

function KnitCableOverlay({
  cable,
  pattern,
  reveal,
  rowAlign,
}: KnitCableOverlayProps) {
  const row = pattern.rows[cable.row]
  const rowStart = row ? getRowStartColumn(pattern, row, rowAlign) : 1
  const column = rowStart + cable.leftStartStitch
  const cableWidth = getKnitCableWidth(cable)
  const segments = getCableStitchSegments(cable)
  const style = {
    '--knit-cable-height': cable.height,
    gridColumn: `${column} / span ${cableWidth}`,
    gridRow: `${cable.row + 1} / span ${cable.height}`,
  } as CSSProperties

  return (
    <div
      aria-hidden="true"
      className={`knit-pattern-view__cable knit-pattern-view__cable--${cable.cross}`}
      style={style}
    >
      {segments.map((segment) => (
        <KnitStitchUnit
          className={getRevealClasses(
            [
              'knit-pattern-view__cable-stitch',
              `knit-pattern-view__cable-stitch--${segment.strand}`,
            ].join(' '),
            pattern,
            reveal,
            cable.row + segment.rowIndex,
            cable.leftStartStitch + segment.columnIndex,
          )}
          color={getCableSegmentColor(pattern, cable, segment)}
          key={`${segment.strand}-${segment.laneIndex}-${segment.rowIndex}`}
          kind="knit"
          size="var(--knit-pattern-stitch-size)"
          style={{
            left: `${segment.left}%`,
            top: `${segment.top}%`,
            transform: `translate(-50%, -50%) rotate(${segment.rotate}deg) scaleY(${segment.scaleY}) scale(var(--knit-stitch-hover-scale))`,
            zIndex: segment.zIndex,
          }}
        />
      ))}
    </div>
  )
}

interface KnitCableStitchSegment {
  columnIndex: number
  index: number
  laneIndex: number
  left: number
  rotate: number
  rowIndex: number
  scaleY: number
  sourceColumnIndex: number
  strand: 'left' | 'right'
  top: number
  zIndex: number
}

function getCableStitchSegments(cable: KnitCable): KnitCableStitchSegment[] {
  return [
    ...getCableStrandSegments(cable, 'left'),
    ...getCableStrandSegments(cable, 'right'),
  ]
}

type KnitCableStrandSide = 'left' | 'right'

function getCableStrandSegments(
  cable: KnitCable,
  strand: KnitCableStrandSide,
): KnitCableStitchSegment[] {
  const cableWidth = getKnitCableWidth(cable)
  const strandStart =
    strand === 'left' ? cable.leftStartStitch : cable.rightStartStitch
  const strandEnd =
    strand === 'left' ? cable.leftEndStitch : cable.rightEndStitch
  const targetStart =
    strand === 'left' ? cable.rightStartStitch : cable.leftStartStitch
  const targetEnd =
    strand === 'left' ? cable.rightEndStitch : cable.leftEndStitch
  const strandWidth = strandEnd - strandStart + 1
  const stitchDelta = Math.abs(
    getColumnCenter(targetStart, targetEnd) -
      getColumnCenter(strandStart, strandEnd),
  )

  return Array.from({ length: strandWidth }, (_, laneIndex) =>
    Array.from({ length: cable.height }, (_, rowIndex) => {
      const pathProgress =
        cable.height === 1 ? 0.5 : rowIndex / (cable.height - 1)
      const curveProgress = smoothstep(pathProgress)
      const sourceColumn = strandStart + laneIndex
      const targetColumn = targetStart + laneIndex
      const columnDelta = targetColumn - sourceColumn
      const visualColumn = sourceColumn + columnDelta * curveProgress
      const rotation = getCableSegmentRotation(
        columnDelta,
        cable.height,
        pathProgress,
      )
      const columnIndex = clampIndex(
        Math.round(visualColumn - cable.leftStartStitch),
        cableWidth,
      )
      const sourceColumnIndex = sourceColumn - cable.leftStartStitch

      return {
        columnIndex,
        index: rowIndex,
        laneIndex,
        left: getColumnLeft(visualColumn, cable),
        rotate: rotation,
        rowIndex,
        scaleY: 1 + Math.min(stitchDelta / cable.height, 1.2) * 0.18,
        sourceColumnIndex,
        strand,
        top: getRowCenterTop(rowIndex, cable.height),
        zIndex: getCableSegmentZIndex(cable.cross, strand),
      }
    }),
  ).flat()
}

function getRowCenterTop(rowIndex: number, rowCount: number): number {
  return ((rowIndex + 0.5) / rowCount) * 100
}

function getColumnCenter(start: number, end: number): number {
  return (start + end) / 2
}

function getColumnLeft(column: number, cable: KnitCable): number {
  return ((column - cable.leftStartStitch + 0.5) / getKnitCableWidth(cable)) * 100
}

function getCableSegmentZIndex(
  cross: KnitCable['cross'],
  strand: KnitCableStrandSide,
): number {
  const overStrand = cross === 'left-over-right' ? 'left' : 'right'

  return strand === overStrand ? 4 : 2
}

function getCableSegmentRotation(
  columnDelta: number,
  height: number,
  progress: number,
): number {
  const tangent = columnDelta * smoothstepDerivative(progress)

  return clampNumber(-Math.atan(tangent / height) * (180 / Math.PI), -58, 58)
}

function smoothstep(progress: number): number {
  return progress * progress * (3 - 2 * progress)
}

function smoothstepDerivative(progress: number): number {
  return 6 * progress * (1 - progress)
}

function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), length - 1)
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getCableSegmentColor(
  pattern: KnitPattern,
  cable: KnitCable,
  segment: KnitCableStitchSegment,
): string | undefined {
  const cableColor = getCableColorOverride(
    cable.color,
    segment.rowIndex,
    segment.columnIndex,
    segment.sourceColumnIndex,
  )

  return (
    cableColor ??
    getBaseCableColor(pattern, cable, segment.sourceColumnIndex)
  )
}

function getCableColorOverride(
  color: KnitCableColor | undefined,
  rowIndex: number,
  columnIndex: number,
  sourceColumnIndex: number,
): string | undefined {
  if (!color) {
    return undefined
  }

  if (typeof color === 'string') {
    return color
  }

  if (isCableColumnColor(color)) {
    return color[sourceColumnIndex]
  }

  return color[rowIndex]?.[columnIndex]
}

function isCableColumnColor(
  color: string[] | string[][],
): color is string[] {
  return color.every((item) => typeof item === 'string')
}

function getBaseCableColor(
  pattern: KnitPattern,
  cable: KnitCable,
  sourceColumnIndex: number,
): string | undefined {
  const row = pattern.rows[cable.row]
  const stitch = row
    ? getStitchAtColumn(row.stitches, cable.leftStartStitch + sourceColumnIndex)
    : undefined

  return stitch ? getPatternStitchColor(pattern, stitch) : pattern.palette?.colors[0]
}

function getStitchAtColumn(
  stitches: KnitStitch[],
  targetColumn: number,
): KnitStitch | undefined {
  let column = 0

  return stitches.find((stitch) => {
    const span = getKnitStitchSpan(stitch)
    const isTargetStitch =
      targetColumn >= column && targetColumn < column + span

    column += span

    return isTargetStitch
  })
}
