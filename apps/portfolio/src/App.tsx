import { KnitPatternView, KnitStitchUnit } from '@knit-ui/core'
import type { KnitPattern, StitchKind } from '@knit-ui/core'
import './App.css'

const stockinettePattern: KnitPattern = {
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

const cablePattern: KnitPattern = {
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

const colorworkPattern: KnitPattern = {
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
): KnitPattern {
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
        </div>
      </section>

      <section className="test-grid">
        <article className="sample">
          <div className="sample-copy">
            <h2>Basic rows</h2>
            <p>Alternating knit and purl rows rendered from `KnitPattern.rows`.</p>
          </div>
          <KnitPatternView
            aria-label="basic knit and purl pattern"
            pattern={stockinettePattern}
            stitchSize={40}
          />
        </article>

        <article className="sample sample--feature">
          <div className="sample-copy">
            <h2>Cable overlay</h2>
            <p>`KnitPattern.cables` spans four stitches across three rows.</p>
          </div>
          <KnitPatternView
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
          <KnitPatternView
            aria-label="manual grayscale colorwork pattern"
            density="compact"
            pattern={colorworkPattern}
            stitchSize={34}
          />
        </article>
      </section>
    </main>
  )
}

export default App
