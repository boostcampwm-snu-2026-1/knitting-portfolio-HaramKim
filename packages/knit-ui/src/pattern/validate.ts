import type {
  KnitCable,
  KnitCableColor,
  KnitPattern,
  KnitPatternValidationIssue,
  KnitPatternValidationResult,
  KnitStitch,
} from './types'

export interface ValidateKnitPatternOptions {
  allowIncompleteRows?: boolean
}

export function getKnitStitchSpan(stitch: KnitStitch): number {
  return stitch.span ?? 1
}

export function getKnitRowWidth(stitches: KnitStitch[]): number {
  return stitches.reduce((width, stitch) => width + getKnitStitchSpan(stitch), 0)
}

export function getKnitCableWidth(cable: KnitCable): number {
  return cable.rightEndStitch - cable.leftStartStitch + 1
}

export function getKnitCableCount(cable: KnitCable): number {
  return cable.count ?? 1
}

export function validateKnitPattern(
  pattern: KnitPattern,
  options: ValidateKnitPatternOptions = {},
): KnitPatternValidationResult {
  const issues: KnitPatternValidationIssue[] = []

  if (!Number.isInteger(pattern.castOn) || pattern.castOn < 1) {
    issues.push({
      code: 'invalid-cast-on',
      message: 'castOn must be a positive integer.',
    })
  }

  pattern.rows.forEach((row, rowIndex) => {
    if (row.stitches.length === 0) {
      issues.push({
        code: 'empty-row',
        message: 'Rows must include at least one stitch.',
        row: rowIndex,
      })
    }

    row.stitches.forEach((stitch, stitchIndex) => {
      const span = getKnitStitchSpan(stitch)

      if (!Number.isInteger(span) || span < 1) {
        issues.push({
          code: 'invalid-stitch-span',
          message: 'Stitch span must be a positive integer.',
          row: rowIndex,
          stitch: stitchIndex,
        })
      }

    })

    const rowWidth = getKnitRowWidth(row.stitches)

    if (!options.allowIncompleteRows && rowWidth !== pattern.castOn) {
      issues.push({
        code: 'row-stitch-count-mismatch',
        message: `Row width must match castOn. Expected ${pattern.castOn}, received ${rowWidth}.`,
        row: rowIndex,
      })
    }
  })

  pattern.cables?.forEach((cable) => {
    const count = getKnitCableCount(cable)
    const hasInvalidSize =
      !Number.isInteger(cable.height) ||
      cable.height < 2 ||
      !Number.isInteger(count) ||
      count < 1
    const hasInvalidPosition =
      !Number.isInteger(cable.row) ||
      cable.row < 0 ||
      !Number.isInteger(cable.leftStartStitch) ||
      !Number.isInteger(cable.leftEndStitch) ||
      !Number.isInteger(cable.rightStartStitch) ||
      !Number.isInteger(cable.rightEndStitch) ||
      cable.leftStartStitch < 0 ||
      cable.leftStartStitch > cable.leftEndStitch ||
      cable.rightStartStitch > cable.rightEndStitch ||
      cable.leftEndStitch + 1 !== cable.rightStartStitch
    const width = hasInvalidPosition ? 0 : getKnitCableWidth(cable)

    if (hasInvalidSize) {
      issues.push({
        code: 'invalid-cable-size',
        message:
          'Cable height must be an integer greater than 1 and count must be a positive integer.',
        row: cable.row,
        stitch: cable.leftStartStitch,
      })
    }

    if (
      cable.cross !== 'left-over-right' &&
      cable.cross !== 'right-over-left'
    ) {
      issues.push({
        code: 'invalid-cable-cross',
        message: 'Cable cross must be left-over-right or right-over-left.',
        row: cable.row,
        stitch: cable.leftStartStitch,
      })
    }

    if (
      !hasInvalidSize &&
      !hasInvalidPosition &&
      !hasValidCableColorShape(cable.color, width, cable.height)
    ) {
      issues.push({
        code: 'invalid-cable-color',
        message:
          'Cable color must be a string, a width-sized array, or a height by width matrix.',
        row: cable.row,
        stitch: cable.leftStartStitch,
      })
    }

    const lastCableRow = cable.row + cable.height * count
    const coveredRows = hasInvalidSize || hasInvalidPosition
      ? []
      : pattern.rows.slice(cable.row, lastCableRow)
    const cableFitsRows =
      !hasInvalidPosition &&
      coveredRows.length === cable.height * count &&
      coveredRows.every(
        (row) => cable.rightEndStitch < getKnitRowWidth(row.stitches),
      )

    if (!cableFitsRows) {
      issues.push({
        code: 'invalid-cable-position',
        message:
          'Cable must fit inside existing rows and use adjacent left/right stitch ranges.',
        row: cable.row,
        stitch: cable.leftStartStitch,
      })
    }
  })

  pattern.accidents?.forEach((accident) => {
    const row = pattern.rows[accident.row]

    if (!row || accident.stitch < 0 || accident.stitch >= getKnitRowWidth(row.stitches)) {
      issues.push({
        code: 'invalid-accident-position',
        message: 'Accident position must target an existing row and stitch.',
        row: accident.row,
        stitch: accident.stitch,
      })
    }
  })

  return {
    valid: issues.length === 0,
    issues,
  }
}

function hasValidCableColorShape(
  color: KnitCableColor | undefined,
  width: number,
  height: number,
): boolean {
  if (!color || typeof color === 'string') {
    return true
  }

  if (color.every((item) => typeof item === 'string')) {
    return color.length === width
  }

  return (
    color.length === height &&
    color.every(
      (row) =>
        Array.isArray(row) &&
        row.length === width &&
        row.every((item) => typeof item === 'string'),
    )
  )
}
