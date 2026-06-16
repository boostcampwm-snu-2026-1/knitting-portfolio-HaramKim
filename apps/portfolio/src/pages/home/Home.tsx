import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { KnitPattern, KnitScrollPattern } from '@knit-ui/core'
import type {
  KnitPatternData,
  KnitStitchClickDetails,
  KnitStitchPositionTarget,
  StitchKind,
} from '@knit-ui/core'
import './Home.css'

const HOME_PATTERN_COLUMN_COUNT = 28
const HOME_PATTERN_ROW_COUNT = 30
const HOME_LEFT_CABLE_ROW = 1
const HOME_LEFT_CABLE_HEIGHT = 4
const HOME_LEFT_CABLE_COUNT = 7
const HOME_LEFT_CABLE_START = 2
const HOME_LEFT_CABLE_END = 7

const homePalette = {
  canvas: '#FBF4F0',
  primary100: '#ADCCE8',
  primary200: '#B4C9DA',
  primary600: '#1C67B0',
  primary700: '#22609B',
  accentGreen: '#397C43',
  accentOrange: '#DF591E',
  accentYellow: '#E6BD41',
  accentRust: '#9B301C',
}

const homePattern: KnitPatternData = {
  castOn: HOME_PATTERN_COLUMN_COUNT,
  palette: {
    colors: [homePalette.primary600, homePalette.primary700],
  },
  rows: Array.from({ length: HOME_PATTERN_ROW_COUNT }, (_, rowIndex) => ({
    stitches: makeHomePatternRow(rowIndex),
  })),
  cables: [
    {
      row: HOME_LEFT_CABLE_ROW,
      height: HOME_LEFT_CABLE_HEIGHT,
      leftStartStitch: HOME_LEFT_CABLE_START,
      leftEndStitch: 4,
      rightStartStitch: 5,
      rightEndStitch: HOME_LEFT_CABLE_END,
      count: HOME_LEFT_CABLE_COUNT,
      cross: 'left-over-right',
      color: [
        homePalette.primary600,
        homePalette.primary600,
        homePalette.primary700,
        homePalette.primary700,
        homePalette.primary100,
        homePalette.primary100,
      ],
    },
    {
      row: 3,
      height: 4,
      leftStartStitch: 11,
      leftEndStitch: 13,
      rightStartStitch: 14,
      rightEndStitch: 16,
      count: 6,
      cross: 'right-over-left',
      color: [
        homePalette.accentYellow,
        homePalette.accentOrange,
        homePalette.accentRust,
        homePalette.accentRust,
        homePalette.accentGreen,
        homePalette.accentGreen,
      ],
    },
    {
      row: 2,
      height: 4,
      leftStartStitch: 20,
      leftEndStitch: 22,
      rightStartStitch: 23,
      rightEndStitch: 25,
      count: 7,
      cross: 'left-over-right',
      color: [
        homePalette.primary700,
        homePalette.primary700,
        homePalette.primary600,
        homePalette.accentRust,
        homePalette.accentOrange,
        homePalette.accentGreen,
      ],
    },
  ],
}

const homeLeftCableInteractivePositions = getCableInteractivePositions(
  HOME_LEFT_CABLE_ROW,
  HOME_LEFT_CABLE_HEIGHT,
  HOME_LEFT_CABLE_COUNT,
  HOME_LEFT_CABLE_START,
  HOME_LEFT_CABLE_END,
)

const homeLeftCableInteractiveCells = new Set(
  homeLeftCableInteractivePositions.map(({ columnIndex, rowIndex }) =>
    getStitchCellKey(rowIndex, columnIndex),
  ),
)

interface HomeProps {
  onNavigateToTest?: () => void
}

function makeHomePatternRow(rowIndex: number) {
  const firstCable =
    rowIndex % 2 === 0
      ? [
          homePalette.primary600,
          homePalette.primary600,
          homePalette.primary700,
          homePalette.primary700,
          homePalette.primary100,
          homePalette.primary100,
        ]
      : [
          homePalette.primary700,
          homePalette.primary700,
          homePalette.primary600,
          homePalette.primary600,
          homePalette.primary200,
          homePalette.primary200,
        ]
  const secondCable =
    rowIndex % 3 === 0
      ? [
          homePalette.accentYellow,
          homePalette.accentOrange,
          homePalette.accentRust,
          homePalette.accentRust,
          homePalette.accentGreen,
          homePalette.accentGreen,
        ]
      : [
          homePalette.accentOrange,
          homePalette.accentRust,
          homePalette.accentRust,
          homePalette.accentGreen,
          homePalette.accentGreen,
          homePalette.primary700,
        ]
  const thirdCable =
    rowIndex % 4 === 0
      ? [
          homePalette.primary700,
          homePalette.primary700,
          homePalette.primary600,
          homePalette.accentRust,
          homePalette.accentOrange,
          homePalette.accentGreen,
        ]
      : [
          homePalette.primary600,
          homePalette.primary700,
          homePalette.primary700,
          homePalette.accentOrange,
          homePalette.accentGreen,
          homePalette.accentGreen,
        ]
  const centerKnit =
    rowIndex % 3 === 0 ? homePalette.primary700 : homePalette.primary600

  return [
    ...makeColorRow('knit', [homePalette.primary700]),
    ...makeColorRow('purl', [homePalette.primary200]),
    ...makeColorRow('knit', firstCable),
    ...makeColorRow('purl', [homePalette.primary100]),
    ...makeColorRow('knit', [centerKnit]),
    ...makeColorRow('purl', [homePalette.primary200]),
    ...makeColorRow('knit', secondCable),
    ...makeColorRow('purl', [homePalette.primary100]),
    ...makeColorRow('knit', [homePalette.primary700]),
    ...makeColorRow('purl', [homePalette.primary200]),
    ...makeColorRow('knit', thirdCable),
    ...makeColorRow('purl', [homePalette.primary100]),
    ...makeColorRow('knit', [homePalette.primary700]),
  ]
}

function makeColorRow(kind: StitchKind, colors: string[]) {
  return colors.map((color) => ({ kind, color }))
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getCableInteractivePositions(
  row: number,
  height: number,
  count: number,
  startColumn: number,
  endColumn: number,
): KnitStitchPositionTarget[] {
  return Array.from({ length: count }, (_, repeatIndex) =>
    Array.from({ length: height }, (_, rowOffset) =>
      Array.from(
        { length: endColumn - startColumn + 1 },
        (_, columnOffset) => ({
          columnIndex: startColumn + columnOffset,
          rowIndex: row + repeatIndex * height + rowOffset,
        }),
      ),
    ),
  ).flat(2)
}

function getStitchCellKey(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}:${columnIndex}`
}

function isHomeLeftCableClick(details: KnitStitchClickDetails): boolean {
  return (
    details.source === 'cable' &&
    homeLeftCableInteractiveCells.has(
      getStitchCellKey(details.rowIndex, details.columnIndex),
    )
  )
}

function Home({ onNavigateToTest }: HomeProps) {
  const introRef = useRef<HTMLElement>(null)
  const [introProgress, setIntroProgress] = useState(0)
  const titleOpacity = clampNumber(1 - introProgress * 1.45, 0, 1)
  const scrollProgress = clampNumber(introProgress / 0.78, 0, 1)
  const homeStyle = {
    '--home-title-opacity': titleOpacity,
    '--home-title-y': `${introProgress * -180}px`,
    '--home-scroll-opacity': clampNumber((scrollProgress - 0.08) / 0.72, 0, 1),
    '--home-scroll-y': `${(1 - scrollProgress) * 96}px`,
  } as CSSProperties

  useEffect(() => {
    let frame = 0

    function updateIntroProgress() {
      const intro = introRef.current

      if (!intro) {
        return
      }

      const rect = intro.getBoundingClientRect()
      const scrollDistance = Math.max(1, intro.offsetHeight - window.innerHeight)

      setIntroProgress(clampNumber(-rect.top / scrollDistance, 0, 1))
    }

    function requestUpdate() {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateIntroProgress)
    }

    requestUpdate()
    window.addEventListener('resize', requestUpdate)
    window.addEventListener('scroll', requestUpdate, { passive: true })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('scroll', requestUpdate)
    }
  }, [])

  function handleHomeStitchClick(details: KnitStitchClickDetails) {
    if (isHomeLeftCableClick(details)) {
      onNavigateToTest?.()
    }
  }

  return (
    <main className="home-page" style={homeStyle}>
      <section className="home-intro" ref={introRef}>
        <div className="home-intro__stage">
          <div className="home-intro__title-shell">
            <h1 className="home-intro__title" aria-label="Design Portfolio">
              <span>Design</span>
              <span>Portfolio</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="home-scroll-section" aria-label="portfolio knitting stage">
        <KnitScrollPattern
          aria-label="home knit scroll pattern"
          className="home-knit-scroll"
          needle={{
            visible: true,
            color: '#d69a45',
            highlightColor: '#f2c986',
          }}
          scrollLength="600vh"
        >
          <KnitPattern
            aria-label="28 by 30 knit purl cable repeat pattern"
            density="compact"
            mistakeFrequency={0.02}
            gap={2}
            interactiveStitchPositions={homeLeftCableInteractivePositions}
            onStitchClick={handleHomeStitchClick}
            pattern={homePattern}
            rowGap={1}
            stitchSize={44}
          />
        </KnitScrollPattern>
      </section>
    </main>
  )
}

export default Home
