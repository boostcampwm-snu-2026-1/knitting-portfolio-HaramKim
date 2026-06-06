## 전체 개발 계획서

  ### 0. 설계 원칙 문서화

  목표: 지금 작성한 Knitting UI System 원칙을 구현 기준으로 고정합니다.

  TODO:

  - packages/knit-ui/AGENTS.md에 “Knitting UI System” 설계 원칙 요약 추가
  - README 또는 packages/knit-ui/README.md에 사용자가 이해할 수 있는 public-facing 개념 문서 추가
  - 용어 확정:
      - cast-on: 시작 코 수
      - row: 단
      - stitch: 코
      - colorwork: 배색
      - join: 편물 이어 붙이기
      - accident: 실수/우연성 이벤트

  ———

  ### 1. Core Model 설계

  목표: UI를 “컴포넌트 배치”가 아니라 “뜨개 도안 데이터”로 생성할 수 있게 합니다.

  예상 public type:

  type StitchKind = 'knit' | 'purl' | 'cable'

  interface KnitPattern {
    castOn: number
    rows: KnitRow[]
    palette?: KnitPalette
    accidents?: KnitAccident[]
  }

  interface KnitRow {
    stitches: KnitStitch[]
  }

  interface KnitStitch {
    kind: StitchKind
    color?: string
  }

    colors?: string[]
  }

  TODO:

  - packages/knit-ui/src/core 또는 src/pattern 디렉터리 추가
  - KnitPattern, KnitRow, KnitStitch, KnitPalette 타입 정의
  - 시작 코 수와 row별 stitch 수 검증 유틸 작성
  - 불완전한 row를 허용할지, 오류로 처리할지 정책 결정
  - src/index.ts에서 public type export

  ———

  ### 2. Stitch Unit 구현

  목표: 안뜨기/겉뜨기/cable을 독립적인 시각 유닛으로 구현합니다.

  TODO:

  - KnitStitchUnit 컴포넌트 추가
  - kind="knit" | "purl" | "cable"에 따라 다른 형태 렌더링
  - Figma MVP 형태를 기반으로 SVG 또는 CSS shape로 구현
  - 색상은 color prop과 CSS 변수 fallback으로 제어
  - 기본 팔레트:
      - #f2f2f2
      - #bfbfbf
      - #7d7d7d
      - #434343
      - #070707

  - CSS 클래스는 knit- 접두사 사용
  - Tailwind, Framer Motion 등 새 런타임 의존성은 추가하지 않음
  - 안뜨기 figma url: https://www.figma.com/design/ETJIWP7xvOe0IWV7s6rAXy/knitting-portfolio?node-id=1-9&t=mVGetp8YQ2voMn8w-0
  - 겉뜨기 figma url: https://www.figma.com/design/ETJIWP7xvOe0IWV7s6rAXy/knitting-portfolio?node-id=1-10&t=mVGetp8YQ2voMn8w-0

  ———

  ### 3. Pattern Renderer 구현

  목표: 도안 데이터를 실제 UI 배경/패턴으로 렌더링합니다.

  예상 컴포넌트:

  <KnitPatternView pattern={pattern} />

  TODO:

  - KnitPatternView 컴포넌트 추가
  - rows를 세로 방향으로 렌더링
  - row 안의 stitches를 grid/flex 기반으로 렌더링
  - row별 코 수가 다를 때 중앙 정렬 또는 좌측 정렬 정책 적용
  - density, stitchSize, gap, className 같은 기본 layout prop 제공
  - 배경, 구분선, 카드 내부 패턴으로 재사용 가능하게 as 또는 wrapper 최소화

  ———

  ### 4. Cable Stitch와 구조적 패턴

  목표: cable stitch를 단순 아이콘이 아니라 여러 코를 교차하는 구조로 표현합니다.

  TODO:

  - cable은 최소 2코 이상을 차지하는 stitch group으로 모델링
  - KnitStitch에 span 또는 별도 CableStitch 타입 도입 검토
  - cable 방향:
      - left cross
      - right cross

  - 겹침, z-index, row 간 연결감 표현
  - 초기 버전에서는 실제 편물 물리보다 시각적 교차 구조를 우선 구현

  ———

  ### 5. Accidental Events 구현

  목표: 완벽한 패턴이 아니라 실제 뜨개질 과정의 실수와 우연성을 표현합니다.

  Accident 후보:

  type AccidentKind = 'dropped-stitch' | 'tangled-yarn' | 'irregular-stitch' | 'yarn-runout'

  TODO:

  - accident 타입 정의
  - 특정 row/stitch 위치에 accident 적용
  - dropped stitch: 빈 공간, 아래로 풀린 실선 표현
  - tangled yarn: stitch 위에 꼬인 선/덩어리 overlay
  - irregular stitch: 크기, 회전, 간격 변형
  - yarn-runout: 특정 progress 이후 stitch가 희미해지거나 중단
  - random accident는 seed 기반으로 재현 가능하게 설계

  ———

  ### 6. Scroll Interaction 구현

  목표: 스크롤을 뜨개질 진행/풀림과 연결합니다.

  예상 API:

  <KnitScrollPattern pattern={pattern} />

  TODO:

  - scroll progress를 0..1 값으로 계산하는 hook 작성
  - 아래로 스크롤하면 row가 순차적으로 나타남
  - 위로 스크롤하면 row가 다시 사라지거나 풀림 상태로 전환
  - CSS 변수 --knit-progress 기반으로 애니메이션 제어
  - prefers-reduced-motion 대응
  - portfolio 앱에서 section 단위로 적용 가능한 예제 구현

  ———

  ### 7. Portfolio 통합

  목표: 개인 포트폴리오 프로젝트 데이터와 knitting pattern을 연결합니다.

  TODO:

  - 프로젝트별 pattern config 추가
  - 프로젝트 썸네일에서 추출한 팔레트를 CSS 변수로 주입하는 구조 설계
  - 초기 구현은 수동 팔레트 입력을 우선하고, 자동 추출은 후순위로 둠
  - project card 배경, section divider, transition 영역에 KnitPatternView 적용
  - 일반 UI 버튼/카드와 knitting pattern이 과하게 충돌하지 않도록 density 조절

  ———

  ### 8. 단계별 개발 TODO

  1. 문서화
      - knit-ui 설계 원칙을 AGENTS.md 또는 README에 반영
      - 용어와 public API 방향 확정

  2. 타입 모델
      - KnitPattern, KnitRow, KnitStitch, KnitPalette, KnitAccident 타입 추가
      - validation 유틸 추가
      - index export 정리

  3. 기본 유닛
      - KnitStitchUnit 구현
      - knit/purl Figma 형태 반영
      - CSS 변수 기반 색상/크기 처리

  4. 패턴 렌더러
      - KnitPatternView 구현
      - row/stitch 배열 렌더링
      - cast-on, row count 기반 layout 처리

  5. Cable
      - cable stitch 타입 확장
      - 좌/우 교차 시각화
      - row 안에서 span 처리

  6. Accidents
      - dropped stitch
      - tangled yarn
      - irregular stitch
      - yarn-runout
      - seed 기반 랜덤 옵션

  7. Scroll
      - useKnitScrollProgress hook
      - KnitScrollPattern 컴포넌트
      - reveal/unravel animation

  8. Portfolio 적용
      - project data와 pattern 연결
      - 모바일/데스크톱 시각 밀도 조정

  9. 검증
      - pnpm --filter @knit-ui/core lint
      - portfolio 적용 후 pnpm --filter portfolio build