# Knit UI Portfolio

**A personal design portfolio built with a knitting-inspired UI system.**

Knit UI Portfolio는 뜨개질의 제작 원리와 시각적 구조를 웹 인터페이스로 번역한 개인 디자인 포트폴리오 프로젝트입니다.
이 프로젝트는 뜨개질을 단순한 장식적 모티프로 사용하는 것이 아니라, **UI를 구성하고 생성하는 구조적 원리**로 활용합니다.

사용자는 일반적인 UI 컴포넌트를 배치하는 대신, 실제 뜨개질 도안을 계획하듯이 시작 코 수, 단 수, 단별 코 배열, 배색 정보, 편물 연결 방식 등을 정의하여 인터페이스를 구성할 수 있습니다.

---

## Concept

> **UI as Knitting**

뜨개질은 하나의 코가 반복되고, 실이 교차하며, 단이 쌓여 하나의 편물을 만드는 과정입니다.
이 프로젝트는 이러한 제작 방식을 웹 UI 시스템으로 옮겨옵니다.

웹사이트의 각 요소는 뜨개질의 구성 요소처럼 작동합니다.

| Knitting Element | UI Translation                          |
| ---------------- | --------------------------------------- |
| Yarn             | SVG stroke, line, border, connector     |
| Stitch           | Basic unit, node, stitch component      |
| Row              | Layout row, section, scroll step        |
| Fabric           | Completed interface, page structure     |
| Colorwork        | Color palette, category system          |
| Knitting Pattern | Component API, pattern data             |
| Dropped Stitch   | Visual error, accidental state          |
| Tangled Yarn     | Tangled interaction, complex transition |

---

## Project Goals

Knit UI Portfolio는 다음 두 가지 결과물을 목표로 합니다.

1. **Knitting-inspired React UI Library**
   뜨개질 기법과 편물 구조를 기반으로 한 재사용 가능한 React UI 컴포넌트 라이브러리

2. **Personal Design Portfolio Website**
   해당 UI 라이브러리를 실제로 적용한 개인 디자인 포트폴리오 웹사이트

---

## Core Features

### Knitting-based Pattern System

실제 뜨개질 도안을 작성하듯이 UI 패턴을 정의할 수 있습니다.

* 시작 코 수 설정
* 전체 단 수 설정
* 단별 코 배열 정의
* 배색 정보 지정
* 서로 다른 편물 구조 연결

### Stitch Techniques

초기 버전에서는 대바늘뜨기의 기본 기법을 중심으로 시스템을 구성합니다.

* Knit stitch / 겉뜨기
* Purl stitch / 안뜨기
* Cable stitch / 케이블뜨기

각 기법은 단순한 장식 패턴이 아니라 UI의 배경, 카드, 구분선, 레이아웃 구조, 전환 애니메이션 등에 활용됩니다.

### Accidental Events

이 시스템은 완벽하게 정돈된 패턴뿐 아니라, 실제 뜨개질 과정에서 발생하는 실수와 우연성도 표현합니다.

* 코 빠뜨림
* 실 엉킴
* 불규칙한 코의 모양
* 유한한 실의 양
* 점진적으로 정돈되는 코의 형태

### Scroll-based Interaction

기본 인터랙션은 스크롤과 뜨개질의 제작 과정을 연결합니다.

* 아래로 스크롤하면 편물이 짜입니다.
* 위로 스크롤하면 편물이 풀립니다.

이를 통해 사용자는 포트폴리오를 단순히 탐색하는 것이 아니라, 하나의 편물이 만들어지는 과정을 따라가게 됩니다.

---

## Visual Direction

Knit UI Portfolio의 편물 표현 방식은 크게 두 가지 방향을 기준으로 탐구합니다.

### Sans-serif Version

실의 두께 변화를 최소화한 미니멀한 표현 방식입니다.

**Advantages**

* 세련되고 미니멀한 시각 표현 가능
* SVG나 CSS로 구현하기 쉬움
* 반복 패턴과 반응형 UI에 적합
* 디자인 시스템으로 확장하기 쉬움

**Limitations**

* 뜨개질 기법 간 차이가 약하게 보일 수 있음
* 일반적인 라인 패턴처럼 보일 위험이 있음
* 실의 겹침, 눌림, 장력 표현이 제한적임

### Serif Version

실의 두께 변화와 겹침을 적극적으로 활용하는 표현 방식입니다.

**Advantages**

* 실제 편물의 조직감과 촉각성을 표현하기 좋음
* 겉뜨기, 안뜨기, 케이블뜨기 등의 차이가 잘 드러남
* 실의 꼬임, 눌림, 장력, 엉킴 표현에 적합

**Limitations**

* 화면이 무거워 보일 수 있음
* SVG path와 애니메이션 구현 난이도가 높음
* 작은 화면에서는 디테일이 뭉개질 수 있음

---

## Color System

기본 컬러 팔레트는 부드럽고 따뜻한 편물의 인상을 기반으로 구성합니다.

또한 각 프로젝트 페이지에서는 프로젝트 썸네일 이미지에서 주요 색상을 추출하여 CSS 변수로 적용하는 방식을 실험합니다.
이를 통해 포트폴리오 전체는 하나의 시스템을 유지하면서도, 각 프로젝트별로 다른 색감과 분위기를 가질 수 있습니다.

---

## Planned Documentation

자세한 기획과 설계 문서는 GitHub Wiki에서 정리합니다.

* [Project Overview](../../wiki/Project-Overview)
* [Visual Concept](../../wiki/Visual-Concept)
* [Design Principles](../../wiki/Design-Principles)
* [Component Architecture](../../wiki/Component-Architecture)
* [Component API](../../wiki/Component-API)
* [Portfolio Site Structure](../../wiki/Portfolio-Site-Structure)
* [Interaction Design](../../wiki/Interaction-Design)
* [Development Roadmap](../../wiki/Development-Roadmap)
* [References](../../wiki/References)
* [Retrospective](../../wiki/Retrospective)

---

## Tech Stack

This project is planned to be built with:

* React
* TypeScript
* SVG
* CSS Modules or CSS Variables
* Framer Motion
* Vite

The final structure may change during development.

---

## Development Roadmap

### Phase 1. Visual Research

* 뜨개질 표현 레퍼런스 수집
* sans-serif / serif 편물 표현 방식 비교
* 기본 stitch unit 디자인
* 컬러 팔레트 정리

### Phase 2. Core UI Library

* stitch unit component 구현
* row / fabric 구조 설계
* pattern data schema 정의
* knit, purl, cable stitch 표현 구현

### Phase 3. Interaction System

* scroll-based knitting interaction 구현
* knitting / unravelling animation 구현
* dropped stitch, tangled yarn 등 accidental state 구현

### Phase 4. Portfolio Website

* 메인 페이지 구조 설계
* 프로젝트 카드 및 상세 페이지 구현
* 프로젝트별 컬러 팔레트 적용
* 반응형 레이아웃 구현

### Phase 5. Documentation & Retrospective

* component API 문서화
* design principle 정리
* 구현 과정 회고 작성

---

## Future Expansion

향후에는 대바늘뜨기뿐 아니라 코바늘 기법까지 확장할 수 있습니다.

* Single crochet / 짧은뜨기
* Double crochet / 긴뜨기
* Chain stitch / 사슬뜨기
* Circular pattern / 원형 패턴
* Radial pattern / 방사형 패턴
* 3D knitted structure / 입체 편물 구조

또한 사용자가 우연적인 결과에 직접 개입할 수 있는 기능도 추가할 수 있습니다.

* 빠뜨린 코 수정하기
* 엉킨 실 풀기
* 스크롤 진행에 따라 코의 형태가 점차 규칙적으로 변하는 숙련도 시스템

---

## Status

This project is currently in the planning and early prototyping stage.

The README, Wiki, visual references, and design system documents will be updated as the project develops.

---

## License

This project is currently for personal portfolio and experimental design research purposes.
