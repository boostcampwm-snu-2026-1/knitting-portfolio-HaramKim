import { KnitPattern, KnitScrollPattern } from '@knit-ui/core'
import type { KnitPatternData, StitchKind } from '@knit-ui/core'
import './Home.css'

const HOME_PATTERN_COLUMN_COUNT = 20
const HOME_PATTERN_ROW_COUNT = 50

const homePattern: KnitPatternData = {
  castOn: HOME_PATTERN_COLUMN_COUNT,
  rows: Array.from({ length: HOME_PATTERN_ROW_COUNT }, () => ({
    stitches: Array.from({ length: HOME_PATTERN_COLUMN_COUNT }, (_, stitchIndex) => ({
      color: stitchIndex % 2 === 0 ? '#f0a39a' : '#e4d28e',
      kind: getRepeatStitchKind(stitchIndex),
    })),
  })),
}

function getRepeatStitchKind(stitchIndex: number): StitchKind {
  return stitchIndex % 2 === 0 ? 'knit' : 'purl'
}

function Home() {
  return (
    <main className="home-page">
      <KnitScrollPattern
        aria-label="home knit scroll pattern"
        className="home-knit-scroll"
        needle={{ visible: true }}
        scrollLength="3000vh"
      >
        <KnitPattern
          aria-label="20 by 50 knit purl repeat pattern"
          density="compact"
          gap={2}
          pattern={homePattern}
          rowGap={1}
          stitchSize={32}
        />
      </KnitScrollPattern>
    </main>
  )
}

export default Home
