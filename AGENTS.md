# AGENTS.md

이 문서는 이 레포 전체에 적용되는 Codex 작업 지침입니다. 하위 디렉터리에 별도 `AGENTS.md`가 추가되면 더 가까운 파일의 지침이 우선합니다.

## 프로젝트 개요

`knit-ui-portfolio`는 뜨개질의 구조와 시각 언어를 React UI 시스템과 개인 포트폴리오 웹사이트로 옮기는 실험적 모노레포입니다.

목표 산출물은 두 가지입니다.

- `packages/knit-ui`: 뜨개질 기반 React UI 라이브러리
- `apps/portfolio`: `@knit-ui/core`를 적용하는 개인 포트폴리오 웹사이트

README에는 Framer Motion 등 향후 계획이 포함되어 있지만, 현재 설치된 의존성을 기준으로 작업합니다. 새 런타임 의존성은 필요성이 명확할 때만 추가합니다.

## 기술 스택

- 패키지 매니저: `pnpm@10.0.0`
- 워크스페이스: pnpm workspace, `apps/*`, `packages/*`
- 언어: TypeScript, React TSX
- UI 런타임: React 19, React DOM 19
- 빌드 도구: Vite
- 린트: ESLint flat config, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- 스타일: 전역 CSS, CSS 변수, CSS nesting
- 라이브러리 빌드: Vite library mode, ES/CJS output

## 실행 명령어

루트에서 실행합니다.

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm preview
```

패키지별 실행이 필요하면 `--filter`를 사용합니다.

```bash
pnpm --filter portfolio dev
pnpm --filter portfolio build
pnpm --filter portfolio lint
pnpm --filter portfolio typecheck

pnpm --filter @knit-ui/core build
pnpm --filter @knit-ui/core lint
pnpm --filter @knit-ui/core typecheck
```

## 폴더 구조

```text
.
├── apps/
│   └── portfolio/          # Vite React 포트폴리오 앱
│       ├── public/         # 정적 공개 에셋
│       └── src/            # 앱 소스
├── packages/
│   └── knit-ui/            # React UI 라이브러리 패키지
│       └── src/
│           ├── components/ # 공개/내부 컴포넌트
│           ├── styles/     # 라이브러리 CSS
│           └── index.ts    # 패키지 public export
├── eslint.config.js        # 전체 ESLint 설정
├── package.json            # 루트 스크립트와 공통 devDependencies
├── pnpm-workspace.yaml     # 워크스페이스 범위
├── tsconfig.base.json      # 공통 TypeScript 옵션
└── tsconfig.json           # 프로젝트 references
```

## 코딩 규칙

- 기존 스타일을 따릅니다: 작은 함수형 컴포넌트, named export, single quote, 세미콜론 없음.
- TypeScript 타입 전용 import는 `import type`을 사용합니다.
- `tsconfig.base.json`의 엄격한 제약을 지킵니다.
  - 사용하지 않는 로컬 변수와 파라미터를 남기지 않습니다.
  - `verbatimModuleSyntax`, `moduleResolution: bundler`, `jsx: react-jsx` 전제를 유지합니다.
- React 컴포넌트는 접근성 기본값을 포함합니다.
  - 버튼은 명시적 `type`을 둡니다.
  - 장식용 이미지는 빈 `alt` 또는 `aria-hidden`을 사용합니다.
  - 상호작용 요소는 키보드 포커스 상태를 유지합니다.
- `@knit-ui/core`의 public API는 `packages/knit-ui/src/index.ts`에서 명시적으로 export합니다.
- 포트폴리오 앱은 워크스페이스 패키지를 `@knit-ui/core`로 import합니다. 상대 경로로 라이브러리 내부를 직접 파고들지 않습니다.
- CSS는 현재 방식처럼 CSS 변수와 클래스 기반 스타일을 우선합니다. 컴포넌트별 CSS를 추가할 때 이름 충돌을 피할 수 있는 접두사를 사용합니다.
- README의 기획 방향과 실제 설치 상태가 충돌하면 실제 코드와 `package.json`을 우선합니다.
- 대규모 리팩터링, 디자인 방향 변경, 새 라이브러리 도입은 요청 범위 안에서만 수행합니다.

## 테스트 및 검증

현재 별도 테스트 러너나 테스트 파일은 없습니다. 변경 후에는 영향 범위에 맞게 아래를 실행합니다.

```bash
pnpm lint
pnpm typecheck
pnpm build
```

프론트엔드 동작 변경 시에는 개발 서버를 띄워 수동 확인합니다.

```bash
pnpm dev
```

새 테스트 프레임워크를 추가하지 않습니다. 테스트 도입이 필요하면 먼저 레포의 방향과 비용을 설명하고 최소 범위로 제안합니다.

## 건드리면 안 되는 파일과 주의 영역

- `.git/`: 직접 수정하지 않습니다.
- `node_modules/`: 직접 수정하지 않습니다.
- `dist/`, 빌드 산출물: 생성 결과로 취급하고 소스 수정으로 해결합니다.
- `pnpm-lock.yaml`: 의존성 추가/삭제/업데이트가 있을 때만 변경합니다.
- `package.json`: 스크립트나 의존성 변경은 필요한 경우에만 합니다.
- `tsconfig*.json`, `eslint.config.js`, `vite.config.ts`: 전체 빌드/린트 동작에 영향을 주므로 요청 범위 밖의 정리성 변경을 피합니다.
- `apps/portfolio/public/*`, `apps/portfolio/src/assets/*`: 시각 에셋입니다. 디자인 또는 에셋 변경 요청 없이 교체하지 않습니다.
- README와 Wiki 링크: 프로젝트 컨셉 문서 역할을 하므로 사실 업데이트가 필요할 때만 수정합니다.

## 작업 원칙

- 루트 지침은 공통 규칙만 담습니다. `packages/knit-ui`와 `apps/portfolio`의 세부 설계 규칙은 나중에 각 디렉터리의 `AGENTS.md`로 분리합니다.
- 하위 패키지 작업 중 루트 명령어가 과도하면 `pnpm --filter`로 영향 범위를 좁힙니다.
- 사용자 변경사항이 이미 있는 파일은 되돌리지 말고 현재 상태를 읽은 뒤 필요한 부분만 편집합니다.
