import { useState } from 'react'
import {
  KnitPattern,
  KnitScrollPattern,
  KnitStitchUnit,
} from '@knit-ui/core'
import type {
  KnitPatternData,
  KnitStitchClickDetails,
  KnitStitchPositionTarget,
  StitchKind,
} from '@knit-ui/core'
import { StitchInspectorModal } from './StitchInspectorModal'
import type { SelectedStitch } from './StitchInspectorModal'
import styles from './Test.module.css'

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

const scrollCablePattern: KnitPatternData = {
  castOn: 15,
  palette: {
    colors: ['#16171d', '#6D58F2', '#D6A15F'],
  },
  rows: Array.from({ length: 18 }, (_, rowIndex) => ({
    stitches: makeScrollCableRow(rowIndex),
  })),
  cables: [
    {
      row: 1,
      height: 4,
      leftStartStitch: 3,
      leftEndStitch: 5,
      rightStartStitch: 6,
      rightEndStitch: 8,
      count: 3,
      cross: 'left-over-right',
      color: ['#8B7BFF', '#8B7BFF', '#8B7BFF', '#4E3DB8', '#4E3DB8', '#4E3DB8'],
    },
    {
      row: 3,
      height: 3,
      leftStartStitch: 10,
      leftEndStitch: 11,
      rightStartStitch: 12,
      rightEndStitch: 13,
      count: 3,
      cross: 'right-over-left',
      color: ['#E2B26D', '#E2B26D', '#A66E3F', '#A66E3F'],
    },
  ],
}

const stitchPrinciples: {
  description: string
  kind: StitchKind
  title: string
}[] = [
  {
    description: '안뜨기는 표면을 뒤집어 요철을 만듭니다. 같은 반복 안에서도 밀도, 그림자, 리듬을 바꾸는 단위입니다.',
    kind: 'purl',
    title: 'purl',
  },
  {
    description: '겉뜨기는 화면의 앞면을 세우는 기본 단위입니다. 반복될수록 방향과 흐름이 생기고, 패턴의 골격이 됩니다.',
    kind: 'knit',
    title: 'knit',
  },
  {
    description: 'mistake는 오류가 아니라 감각이 개입하는 지점입니다. 시스템 안에서 어긋남을 사건과 인터랙션으로 남깁니다.',
    kind: 'mistake',
    title: 'mistake',
  },
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

function makeScrollCableRow(rowIndex: number) {
  const centerColor = rowIndex % 2 === 0 ? '#6D58F2' : '#5A48C7'
  const sideColor = rowIndex % 3 === 0 ? '#D6A15F' : '#B8844B'

  return [
    ...makeColorRow('purl', ['#D8D0C1', '#C9BEAD', '#D8D0C1']),
    ...makeColorRow('knit', [
      centerColor,
      centerColor,
      centerColor,
      '#4B3AA8',
      '#4B3AA8',
      '#4B3AA8',
    ]),
    ...makeColorRow('purl', ['#C9BEAD']),
    ...makeColorRow('knit', [sideColor, sideColor, '#9A6538', '#9A6538']),
    ...makeColorRow('purl', ['#D8D0C1']),
  ]
}

function repeatRow(row: StitchKind[], count: number): StitchKind[] {
  return Array.from({ length: count }, () => row).flat()
}

function getSelectedStitch(details: KnitStitchClickDetails): SelectedStitch {
  return {
    color: details.stitch.color,
    columnIndex: details.columnIndex,
    renderedKind: details.renderedKind,
    rowIndex: details.rowIndex,
    source: details.source,
  }
}

function Test() {
  const [selectedStitch, setSelectedStitch] = useState<SelectedStitch | null>(
    null,
  )

  return (
    <main className={styles.testPage}>
      <section className={styles.testHero}>
        <div className={styles.testHeroIntro}>
          <p className={styles.eyebrow}>Design portfolio</p>
          <h1>Knit UI System</h1>
        </div>

        <div className={styles.stitchPrinciplesBlock}>
          <h2>기본 단위</h2>
          <div className={styles.stitchPrinciples} aria-label="basic stitch units">
            {stitchPrinciples.map(({ description, kind, title }) => (
              <article className={styles.stitchPrinciple} key={kind}>
                <div className={styles.stitchPrincipleSample}>
                  <KnitStitchUnit
                    aria-label={`${title} stitch unit`}
                    kind={kind}
                    size={96}
                  />
                </div>
                <div className={styles.stitchPrincipleCopy}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testGrid}>
        <article className={styles.sample}>
          <div className={styles.sampleCopy}>
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

        <article className={`${styles.sample} ${styles.sampleFeature}`}>
          <div className={styles.sampleCopy}>
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

        <article className={styles.sample}>
          <div className={styles.sampleCopy}>
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

        <article className={`${styles.sample} ${styles.sampleInteractive}`}>
          <div className={styles.sampleCopy}>
            <p className={styles.clickInspectorEyebrow}>onStitchClick</p>
            <h2>Stitch inspector</h2>
            <p>A highlighted stitch turns pattern data into inspectable UI state.</p>
          </div>
          <KnitPattern
            aria-label="clickable knit pattern"
            interactiveStitchPositions={clickableStitchPositions}
            onStitchClick={(details) =>
              setSelectedStitch(getSelectedStitch(details))
            }
            pattern={clickablePattern}
            stitchSize={44}
          />
          <div className={styles.clickInspectorSummary} aria-live="polite">
            <span>target</span>
            <strong>
              {selectedStitch
                ? `row ${selectedStitch.rowIndex + 1} / column ${selectedStitch.columnIndex + 1}`
                : 'row 2 / column 3'}
            </strong>
          </div>
        </article>
      </section>

      <section className={styles.scrollDemo}>
        <div className={styles.sampleCopy}>
          <h2>Scroll knitting</h2>
          <p>Scroll through the stage to knit and unravel stitch units.</p>
        </div>
        <KnitScrollPattern
          aria-label="scroll knitted cable pattern"
          needle={{ visible: true }}
          scrollLength="500vh"
        >
          <KnitPattern
            aria-label="15 stitch scroll cable pattern"
            gap={2}
            mistakeFrequency={0.06}
            pattern={scrollCablePattern}
            rowGap={1}
            stitchSize={34}
          />
        </KnitScrollPattern>
      </section>

      {selectedStitch ? (
        <StitchInspectorModal
          onClose={() => setSelectedStitch(null)}
          stitch={selectedStitch}
        />
      ) : null}
    </main>
  )
}

export default Test
