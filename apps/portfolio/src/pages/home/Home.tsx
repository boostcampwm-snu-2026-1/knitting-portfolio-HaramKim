import { KnitPattern, KnitScrollPattern } from '@knit-ui/core'
import type {
  KnitPatternData,
  KnitStitchPositionTarget,
  StitchKind,
} from '@knit-ui/core'
import './Home.css'

const homePalette = {
  background: '#101010',
  white: '#E7E7E7',
  grey: '#595959',
  darkGrey: '#383838',
}

const homeHighlightPattern = [
  ',....................,',
  ',....................,',
  ',....................,',
  ',....................,',
  ',.......#.....#......,',
  ',......#......#.#....,',
  ',.....###..#..#.#..#.,',
  ',......#..#.#.#.#.#.#,',
  ',......#..#.#.#.#.#.#,',
  ',......#...#..#.#..#.,',
  ',....................,',
  ',............#.......,',
  ',...........###......,',
  ',##...#...#..#.......,',
  ',#.#.#.#.###.#.......,',
  ',#.#.#.#.#...#.......,',
  ',##..#.#.#...#.......,',
  ',#....#..#...#.......,',
  ',#...................,',
  ',#...................,',
  ',....................,',
  ',....................,',
  ',.........#..##..#..#,',
  ',...........#..#.##.#,',
  ',.........#.#....#.##,',
  ',.........#.#....#.##,',
  ',.........#.#.##.#.##,',
  ',.........#.#..#.#.##,',
  ',.........#.###..#..#,',
  ',....................,',
  ',##..###..##.........,',
  ',#.#.#...#...........,',
  ',#.#.#...#...........,',
  ',#.#.###.##..........,',
  ',#.#.#.....#.........,',
  ',#.#.#.....#.........,',
  ',##..###.###.........,',
  ',....................,',
  ',....................,',
] as const

const homeColumnSpecs = Array.from({ length: 22 }, (_, columnIndex) => ({
  kind: columnIndex % 2 === 0 ? 'knit' : 'purl',
  span: 1,
})) satisfies { kind: StitchKind; span: number }[]

const HOME_PATTERN_COLUMN_COUNT = homeColumnSpecs.reduce(
  (columnCount, column) => columnCount + column.span,
  0,
)
const HOME_TEST_LINK_VISUAL_COLUMN = 1
const HOME_TEST_LINK_ROW_START = 6
const HOME_TEST_LINK_ROW_END = 12
const HOME_STITCH_SIZE = 'clamp(34px, 3.47vw, 50px)'
const HOME_STITCH_OVERLAP = 0
const HOME_PATTERN_GAP = 0
const HOME_PATTERN_ROW_GAP = 0
const HOME_NEEDLE_ANGLE = 15
const HOME_NEEDLE_SPEED = 1
const HOME_NEEDLE_THICKNESS = 18
const HOME_PATTERN_ARIA_LABEL =
  'Figma matched grey and white knit purl portfolio pattern'
const HOME_SCROLL_ARIA_LABEL = 'portfolio knitting stage'
const HOME_STITCH_DENSITY = 'compact'
const HOME_MISTAKE_FREQUENCY = 0.01

const homeNeedleOptions = {
  angle: HOME_NEEDLE_ANGLE,
  color: homePalette.grey,
  highlightColor: homePalette.white,
  speed: HOME_NEEDLE_SPEED,
  thickness: HOME_NEEDLE_THICKNESS,
  visible: true,
}

const homePattern: KnitPatternData = {
  castOn: HOME_PATTERN_COLUMN_COUNT,
  palette: {
    colors: [homePalette.darkGrey, homePalette.grey, homePalette.white],
  },
  rows: homeHighlightPattern.map((_, rowIndex) => ({
    stitches: makeHomePatternRow(rowIndex),
  })),
}

const homeTestLinkPositions = getVisualColumnInteractivePositions(
  HOME_TEST_LINK_VISUAL_COLUMN,
  HOME_TEST_LINK_ROW_START,
  HOME_TEST_LINK_ROW_END,
)

interface HomeProps {
  onNavigateToTest?: () => void
}

function makeHomePatternRow(rowIndex: number) {
  const highlightRow = homeHighlightPattern[rowIndex] ?? ''

  return homeColumnSpecs.map(({ kind, span }, visualColumnIndex) => ({
    color: getUnitColor(highlightRow[visualColumnIndex]),
    kind,
    span,
  }))
}

function getUnitColor(unit: string) {
  switch (unit) {
    case '#':
      return homePalette.white
    case '.':
      return homePalette.darkGrey
    case ',':
      return homePalette.grey
    default:
      return undefined
  }
}

function getVisualColumnInteractivePositions(
  visualColumnIndex: number,
  startRow: number,
  endRow: number,
): KnitStitchPositionTarget[] {
  const columnIndex = getVisualColumnStartIndex(visualColumnIndex)

  return Array.from({ length: endRow - startRow + 1 }, (_, rowOffset) => ({
    columnIndex,
    rowIndex: startRow + rowOffset,
  }))
}

function getVisualColumnStartIndex(visualColumnIndex: number): number {
  return homeColumnSpecs
    .slice(0, visualColumnIndex)
    .reduce(
      (columnIndex, columnSpec) => columnIndex + columnSpec.span,
      0,
    )
}

function Home({ onNavigateToTest }: HomeProps) {
  const enableTestNavigation = Boolean(onNavigateToTest)

  function handleHomeStitchClick() {
    onNavigateToTest?.()
  }

  return (
    <main className="home-page">
      <KnitScrollPattern
        aria-label={HOME_SCROLL_ARIA_LABEL}
        className="home-knit-scroll"
        needle={homeNeedleOptions}
      >
        <KnitPattern
          aria-label={HOME_PATTERN_ARIA_LABEL}
          density={HOME_STITCH_DENSITY}
          mistakeFrequency={HOME_MISTAKE_FREQUENCY}
          gap={HOME_PATTERN_GAP}
          interactiveStitchPositions={
            enableTestNavigation ? homeTestLinkPositions : undefined
          }
          onStitchClick={
            enableTestNavigation ? handleHomeStitchClick : undefined
          }
          pattern={homePattern}
          rowAlign="start"
          rowGap={HOME_PATTERN_ROW_GAP}
          stitchOverlap={HOME_STITCH_OVERLAP}
          stitchSize={HOME_STITCH_SIZE}
        />
      </KnitScrollPattern>
    </main>
  )
}

export default Home
