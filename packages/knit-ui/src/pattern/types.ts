export type StitchKind = 'knit' | 'purl'

export type CableCross = 'left-over-right' | 'right-over-left'

export type KnitCableColor = string | string[] | string[][]

export type AccidentKind =
  | 'dropped-stitch'
  | 'tangled-yarn'
  | 'irregular-stitch'
  | 'yarn-runout'

export interface KnitPalette {
  colors: string[]
}

export interface KnitStitch {
  kind: StitchKind
  color?: string
  span?: number
}

export interface KnitRow {
  stitches: KnitStitch[]
}

export interface KnitCable {
  row: number
  height: number
  leftStartStitch: number
  leftEndStitch: number
  rightStartStitch: number
  rightEndStitch: number
  cross: CableCross
  color?: KnitCableColor
}

export interface KnitAccident {
  kind: AccidentKind
  row: number
  stitch: number
}

export interface KnitPattern {
  castOn: number
  rows: KnitRow[]
  palette?: KnitPalette
  cables?: KnitCable[]
  accidents?: KnitAccident[]
}

export interface KnitPatternValidationIssue {
  code:
    | 'invalid-cast-on'
    | 'empty-row'
    | 'row-stitch-count-mismatch'
    | 'invalid-stitch-span'
    | 'invalid-cable-size'
    | 'invalid-cable-cross'
    | 'invalid-cable-color'
    | 'invalid-cable-position'
    | 'invalid-accident-position'
  message: string
  row?: number
  stitch?: number
}

export interface KnitPatternValidationResult {
  valid: boolean
  issues: KnitPatternValidationIssue[]
}
