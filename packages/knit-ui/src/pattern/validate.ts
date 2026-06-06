import type {
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
    const hasInvalidSize =
      !Number.isInteger(cable.width) ||
      cable.width < 2 ||
      !Number.isInteger(cable.height) ||
      cable.height < 2

    if (hasInvalidSize) {
      issues.push({
        code: 'invalid-cable-size',
        message: 'Cable width and height must be integers greater than 1.',
        row: cable.row,
        stitch: cable.stitch,
      })
    }

    const hasInvalidPosition =
      !Number.isInteger(cable.row) ||
      cable.row < 0 ||
      !Number.isInteger(cable.stitch) ||
      cable.stitch < 0
    const coveredRows = hasInvalidSize
      ? []
      : pattern.rows.slice(cable.row, cable.row + cable.height)
    const cableFitsRows =
      !hasInvalidPosition &&
      coveredRows.length === cable.height &&
      coveredRows.every(
        (row) => cable.stitch + cable.width <= getKnitRowWidth(row.stitches),
      )

    if (!cableFitsRows) {
      issues.push({
        code: 'invalid-cable-position',
        message: 'Cable must fit inside existing rows and stitches.',
        row: cable.row,
        stitch: cable.stitch,
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
