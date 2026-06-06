export type StitchKind = 'knit' | 'purl' | 'cable'

export type CableDirection = 'left' | 'right'

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
  cableDirection?: CableDirection
}

export interface KnitRow {
  stitches: KnitStitch[]
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
  accidents?: KnitAccident[]
}

export interface KnitPatternValidationIssue {
  code:
    | 'invalid-cast-on'
    | 'empty-row'
    | 'row-stitch-count-mismatch'
    | 'invalid-stitch-span'
    | 'missing-cable-direction'
    | 'invalid-accident-position'
  message: string
  row?: number
  stitch?: number
}

export interface KnitPatternValidationResult {
  valid: boolean
  issues: KnitPatternValidationIssue[]
}
