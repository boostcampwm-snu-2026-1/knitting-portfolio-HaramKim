import { useState } from 'react'
import {
  KnitPattern,
  KnitPatternGroup,
  KnitScrollPattern,
  KnitStitchUnit,
} from '@knit-ui/core'
import type {
  KnitPatternData,
  KnitStitchPositionTarget,
  StitchKind,
} from '@knit-ui/core'
import './App.css'

const stockinettePattern: KnitPatternData = {
  ...makePattern(
    [
      makeRowKinds('knit', 8),
      makeRowKinds('purl', 8),
    ],
    1,
    5,
  ),
  palette: {
    colors: ['#070707'],
  },
}

const cablePattern: KnitPatternData = {
  ...makePattern(
    [
      makeRowKinds('purl', 2).concat(
        makeRowKinds('knit', 6),
      ),
    ],
    1,
    10,
  ),
  palette: {
    colors: ['#E88C8C'],
  },
  cables: [
    {
      row: 1,
      height: 4,
      leftStartStitch: 2,
      leftEndStitch: 4,
      rightStartStitch: 5,
      rightEndStitch: 7,
      count: 2,
      cross: 'left-over-right',
      color: ['#F79999', '#F79999', '#F79999', '#B26666', '#B26666', '#B26666'],
    },
  ],
}

const colorworkPattern: KnitPatternData = {
  castOn: 10,
  palette: {
    colors: ['#f2f2f2', '#bfbfbf', '#7d7d7d', '#434343', '#070707'],
  },
  rows: [
    {
      stitches: [
        ...makeColorRow('knit', ['#f2f2f2', '#bfbfbf', '#7d7d7d', '#434343', '#070707']),
        ...makeColorRow('knit', ['#070707', '#434343', '#7d7d7d', '#bfbfbf', '#f2f2f2']),
      ],
    },
    {
      stitches: [
        ...makeColorRow('purl', ['#070707', '#434343', '#7d7d7d', '#bfbfbf', '#f2f2f2']),
        ...makeColorRow('purl', ['#f2f2f2', '#bfbfbf', '#7d7d7d', '#434343', '#070707']),
      ],
    },
    {
      stitches: [
        ...makeColorRow('knit', ['#bfbfbf', '#7d7d7d', '#434343', '#070707', '#434343']),
        ...makeColorRow('knit', ['#434343', '#070707', '#434343', '#7d7d7d', '#bfbfbf']),
      ],
    },
  ],
}

const clickablePattern: KnitPatternData = {
  castOn: 5,
  palette: {
    colors: ['#070707', '#AA3BFF'],
  },
  rows: [
    {
      stitches: makeColorRow('knit', ['#070707', '#070707', '#070707', '#070707', '#070707']),
    },
    {
      stitches: makeColorRow('knit', ['#070707', '#070707', '#AA3BFF', '#070707', '#070707']),
    },
    {
      stitches: makeColorRow('knit', ['#070707', '#070707', '#070707', '#070707', '#070707']),
    },
  ],
}

const clickableStitchPositions: KnitStitchPositionTarget[] = [
  { rowIndex: 1, columnIndex: 2 },
]

function makeRowKinds(kind: StitchKind, count: number) {
  return Array.from({ length: count }, () => kind)
}

function makeColorRow(kind: StitchKind, colors: string[]) {
  return colors.map((color) => ({ kind, color }))
}

function makePattern(
  rows: StitchKind[][],
  r_count: number,
  c_count = 1,
): KnitPatternData {
  const repeatedRows = rows.map((row) => repeatRow(row, r_count))

  return {
    castOn: repeatedRows[0].length,
    rows: Array.from({ length: c_count }, () => repeatedRows)
      .flat()
      .map((row) => ({
        stitches: makeRowFromKinds(row),
      })),
  }
}

function makeRowFromKinds(kinds: StitchKind[]) {
  return kinds.map((kind) => ({ kind }))
}

function repeatRow(row: StitchKind[], count: number): StitchKind[] {
  return Array.from({ length: count }, () => row).flat()
}

function App() {
  const [isClickModalOpen, setIsClickModalOpen] = useState(false)

  return (
    <main className="test-page">
      <section className="test-hero">
        <div>
          <p className="eyebrow">Knit UI System test page</p>
          <h1>Pattern renderer checkpoint</h1>
        </div>
        <div className="unit-row" aria-label="stitch unit samples">
          <KnitStitchUnit aria-label="knit stitch" kind="knit" size={72} />
          <KnitStitchUnit aria-label="purl stitch" kind="purl" size={72} />
          <KnitStitchUnit aria-label="mistake stitch" kind="mistake" size={72} />
        </div>
      </section>

      <section className="test-grid">
        <article className="sample">
          <div className="sample-copy">
            <h2>Basic rows</h2>
            <p>Alternating knit and purl rows rendered from `KnitPatternData.rows`.</p>
          </div>
          <KnitPattern
            aria-label="basic knit and purl pattern"
            mistakeFrequency={0.18}
            pattern={stockinettePattern}
            stitchSize={40}
          />
        </article>

        <article className="sample sample--feature">
          <div className="sample-copy">
            <h2>Cable overlay</h2>
            <p>`KnitPatternData.cables` spans four stitches across three rows.</p>
          </div>
          <KnitPattern
            aria-label="left cable pattern"
            gap={2}
            pattern={cablePattern}
            rowGap={1}
            stitchSize={44}
          />
        </article>

        <article className="sample">
          <div className="sample-copy">
            <h2>Manual colorwork</h2>
            <p>Per-stitch colors override the pattern palette for quick visual checks.</p>
          </div>
          <KnitPattern
            aria-label="manual grayscale colorwork pattern"
            density="compact"
            pattern={colorworkPattern}
            stitchSize={34}
          />
        </article>

        <article className="sample">
          <div className="sample-copy">
            <h2>Click event</h2>
            <p>`onStitchClick` opens a modal from a selected stitch.</p>
          </div>
          <KnitPattern
            aria-label="clickable knit pattern"
            interactiveStitchPositions={clickableStitchPositions}
            onStitchClick={() => setIsClickModalOpen(true)}
            pattern={clickablePattern}
            stitchSize={44}
          />
        </article>
      </section>

      <section className="scroll-demo">
        <div className="sample-copy">
          <h2>Scroll knitting</h2>
          <p>Scroll through the stage to knit and unravel stitch units.</p>
        </div>
        <KnitScrollPattern
          aria-label="scroll knitted cable pattern"
          needle={{ visible: true }}
          scrollLength="500vh"
        >
          <KnitPatternGroup gap={32}>
            <KnitPattern
              gap={2}
              mistakeFrequency={0.08}
              pattern={cablePattern}
              rowGap={1}
              stitchSize={44}
            />
            <KnitPattern
              density="compact"
              pattern={colorworkPattern}
              stitchSize={34}
            />
          </KnitPatternGroup>
        </KnitScrollPattern>
      </section>

      {isClickModalOpen ? (
        <ClickResultModal onClose={() => setIsClickModalOpen(false)} />
      ) : null}
    </main>
  )
}

interface ClickResultModalProps {
  onClose: () => void
}

function ClickResultModal({ onClose }: ClickResultModalProps) {
  return (
    <div className="click-modal-backdrop">
      <section
        aria-labelledby="click-modal-title"
        aria-modal="true"
        className="click-modal"
        role="dialog"
      >
        <h2 id="click-modal-title">클릭 가능</h2>
        <button
          className="click-modal__button"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
      </section>
    </div>
  )
}

export default App
