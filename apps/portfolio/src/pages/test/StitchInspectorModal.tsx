import type { CSSProperties } from 'react'
import { KnitStitchUnit } from '@knit-ui/core'
import type { KnitStitchClickDetails, StitchKind } from '@knit-ui/core'
import styles from './Test.module.css'

export interface SelectedStitch {
  color?: string
  columnIndex: number
  renderedKind: StitchKind
  rowIndex: number
  source: KnitStitchClickDetails['source']
}

export interface StitchInspectorModalProps {
  onClose: () => void
  stitch: SelectedStitch
}

export function StitchInspectorModal({
  onClose,
  stitch,
}: StitchInspectorModalProps) {
  const stitchColor = stitch.color ?? '#22609B'
  const stitchColorStyle = {
    '--stitch-inspector-color': stitchColor,
  } as CSSProperties

  return (
    <div className={styles.clickModalBackdrop}>
      <section
        aria-labelledby="stitch-inspector-title"
        aria-modal="true"
        className={styles.stitchInspector}
        role="dialog"
      >
        <div className={styles.stitchInspectorHeader}>
          <div
            className={styles.stitchInspectorPreview}
            style={stitchColorStyle}
          >
            <KnitStitchUnit
              aria-label={`${stitch.renderedKind} stitch preview`}
              color={stitchColor}
              kind={stitch.renderedKind}
              size={72}
            />
          </div>
          <div>
            <p className={styles.stitchInspectorEyebrow}>event payload</p>
            <h2 id="stitch-inspector-title">Selected stitch</h2>
            <p>Pattern coordinates and material state returned from the stitch.</p>
          </div>
        </div>
        <dl className={styles.stitchInspectorDetails}>
          <div>
            <dt>row</dt>
            <dd>row {stitch.rowIndex + 1}</dd>
          </div>
          <div>
            <dt>column</dt>
            <dd>column {stitch.columnIndex + 1}</dd>
          </div>
          <div>
            <dt>kind</dt>
            <dd>kind {stitch.renderedKind}</dd>
          </div>
          <div>
            <dt>source</dt>
            <dd>{stitch.source}</dd>
          </div>
          <div>
            <dt>color</dt>
            <dd>
              <span
                aria-hidden="true"
                className={styles.stitchInspectorSwatch}
                style={stitchColorStyle}
              />
              {stitchColor}
            </dd>
          </div>
        </dl>
        <button
          className={styles.stitchInspectorButton}
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </section>
    </div>
  )
}
