# AGENTS.md

이 문서는 `packages/knit-ui` 하위 작업에 적용되는 Codex 작업 지침입니다. 루트 `AGENTS.md`의 공통 지침을 상속하며, 이 파일의 지침이 `@knit-ui/core` 패키지 작업에서 더 구체적으로 우선합니다.

## 패키지 개요

`@knit-ui/core`는 뜨개질의 구조와 시각 언어를 React 컴포넌트와 CSS 변수 기반 스타일로 옮기는 UI 라이브러리입니다.

- 소스 엔트리: `src/index.ts`
- 컴포넌트 위치: `src/components`
- 스타일 위치: `src/styles/knit-ui.css`
- 빌드 방식: Vite library mode, ES/CJS output
- 스타일 export: `@knit-ui/core/styles.css`

React, React DOM, `react/jsx-runtime`은 소비 앱이 제공하는 peer/external 의존성으로 유지합니다.

## Knitting UI System 원칙

`@knit-ui/core`는 UI를 일반적인 컴포넌트 배치가 아니라 뜨개 도안 데이터에서 생성하는 시스템으로 다룹니다. 기본 단위는 stitch, stitch의 반복은 row, row의 누적은 pattern/fabric, 전체 입력값은 `KnitPattern`으로 해석합니다.

- 핵심 용어는 README의 개발 계획을 따릅니다: cast-on은 시작 코 수, row는 단, stitch는 코, colorwork는 배색, join은 편물 이어 붙이기, accident는 실수/우연성 이벤트입니다.
- pattern data는 렌더링 결과보다 먼저 설계되는 입력값입니다. 사용자는 완성된 배경 이미지를 고르는 대신 `castOn`, `rows`, `palette`, `accidents` 같은 도안 데이터로 UI 패턴을 정의한다고 가정합니다.
- stitch 기법은 장식용 variant가 아니라 패턴을 이루는 구조 단위입니다. 단일 stitch unit은 `knit`, `purl`을 기준으로 두고, cable은 단일 유닛이 아니라 `KnitPattern.cables`에서 여러 row와 여러 코를 교차시키는 구조 정보로 다룹니다.
- 시각 표현은 Figma MVP 형태를 기반으로 하되, React 컴포넌트와 SVG/CSS로 안정적으로 재사용 가능한 형태를 우선합니다.
- 포트폴리오 앱은 이 시스템의 첫 소비자이지만, 패키지 API는 포트폴리오에만 묶이지 않는 재사용 가능한 UI 라이브러리 경계를 유지합니다.

## v1 결정사항

- v1은 `KnitPattern`, `KnitRow`, `KnitStitch`, `KnitPalette`, `KnitCable` 타입과 row별 stitch 수 검증을 먼저 고정합니다. 불완전한 row 허용 여부는 구현 시 명시적인 정책으로 결정합니다.
- 컬러 시스템은 자동 이미지 추출보다 수동 팔레트 정의를 우선합니다. 프로젝트별 색감은 소비 앱에서 명시적으로 CSS 변수나 props로 전달하는 방향을 기본값으로 둡니다.
- 뜨개질 이미지는 외부 래스터 에셋에 의존하기보다 SVG 기반 stitch/row/pattern 구조로 재구성합니다. 기본 stitch는 Figma의 knit/purl MVP 형태를 기준으로 구현하고, 색상은 `color` prop과 CSS 변수 fallback으로 제어합니다.
- public API는 `KnitPatternView`를 중심으로 설계합니다. 세부 stitch 컴포넌트가 있더라도, 소비자가 우선 사용하는 진입점은 pattern data를 받아 rows와 stitches를 렌더링하는 상위 컴포넌트입니다.
- `KnitPatternView`는 `density`, `stitchSize`, `gap`, `className` 같은 기본 layout prop을 제공하고, 배경, 구분선, 카드 내부 패턴으로 재사용 가능해야 합니다.
- accident 타입, `KnitScrollPattern`, `useKnitScrollProgress`, reveal/unravel animation은 v1 핵심 범위가 아니라 후속 확장으로 둡니다. v1에서는 정적인 pattern 렌더링과 안정적인 스타일 토큰, 접근 가능한 컴포넌트 경계를 먼저 완성합니다.

## 컴포넌트 규칙

- 작은 함수형 컴포넌트와 named export를 사용합니다.
- 기존 코드 스타일을 유지합니다: single quote, 세미콜론 없음, `import type` 사용.
- public props 타입은 export 가능한 `interface`로 작성합니다.
- 새 public 컴포넌트나 타입은 `src/index.ts`에서 명시적으로 export합니다.
- 소비 앱은 `@knit-ui/core` public API를 통해 import한다고 가정합니다. 라이브러리 내부 경로에 의존하는 사용 방식을 만들지 않습니다.
- React 컴포넌트는 접근성 기본값을 포함합니다.
  - 버튼은 명시적 `type`을 둡니다.
  - focus-visible 스타일과 키보드 포커스 흐름을 유지합니다.
  - 장식용 시각 요소는 `aria-hidden` 또는 빈 `alt`를 사용합니다.
- 새 런타임 의존성은 명확한 필요가 있을 때만 추가합니다. 단순한 class 조합, 상태, 스타일 처리는 기존 React와 CSS로 해결합니다.

## 스타일 규칙

- CSS 변수와 클래스 기반 스타일을 우선합니다.
- 클래스명과 CSS 변수는 충돌을 피하기 위해 `knit-` 접두사를 사용합니다.
- 컴포넌트 스타일은 `src/styles/knit-ui.css`에 모으는 현재 방식을 우선합니다.
- 소비 앱에 영향을 주는 전역 reset, `html`/`body` 스타일, 범용 태그 선택자 추가를 피합니다.
- 색상, 간격, border, radius처럼 소비자가 조정할 가능성이 있는 값은 CSS 변수 fallback 형태를 우선합니다.
- hover 스타일만으로 상태를 구분하지 말고 focus-visible, disabled 등 필요한 상태를 함께 고려합니다.

## 빌드와 패키지 경계

- `dist/`와 `node_modules/`는 직접 수정하지 않습니다. 소스 변경 후 빌드 결과로 갱신되는 산출물로 취급합니다.
- `package.json`, `vite.config.ts`, `tsconfig*.json`은 public API, 타입 출력, 번들 형식에 영향을 주므로 요청 범위 안에서만 변경합니다.
- `pnpm-lock.yaml`은 의존성 추가, 삭제, 업데이트가 있을 때만 변경합니다.
- Vite library output 이름과 package exports를 변경할 때는 portfolio 앱의 import 경로와 빌드 결과를 함께 확인합니다.

## 검증

문서만 변경하는 경우 별도 빌드는 필요하지 않습니다. `@knit-ui/core` 소스를 변경한 뒤에는 영향 범위에 맞춰 루트에서 아래 명령어를 실행합니다.

```bash
pnpm --filter @knit-ui/core lint
pnpm --filter @knit-ui/core typecheck
pnpm --filter @knit-ui/core build
```

포트폴리오 앱에서 소비 방식이 바뀌는 변경이면 `apps/portfolio`의 빌드 또는 개발 서버 확인도 함께 수행합니다.
