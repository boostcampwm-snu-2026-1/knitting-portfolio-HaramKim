import {
  Children,
  cloneElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  RefObject,
} from 'react'
import {
  KnitPattern,
  type KnitPatternProps,
  type KnitPatternRevealOrder,
} from './KnitPattern'
import type { KnitPatternGroupDirection } from './KnitPatternGroup'
import '../styles/knit-ui.css'

export type KnitScrollStitchOrder = KnitPatternRevealOrder

export interface KnitScrollNeedleOptions {
  visible?: boolean
  color?: string
  highlightColor?: string
  thickness?: number | string
  angle?: number
}

export interface KnitScrollPatternProps extends HTMLAttributes<HTMLDivElement> {
  needle?: KnitScrollNeedleOptions
  scrollLength?: number | string
  stitchOrder?: KnitScrollStitchOrder
}

export function KnitScrollPattern({
  children,
  className,
  needle,
  scrollLength = '160vh',
  stitchOrder = 'alternating',
  style,
  ...props
}: KnitScrollPatternProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const progress = useKnitScrollProgress(rootRef)
  const totalStitchCount = getScrollableStitchCount(children)
  const visibleStitchCount = Math.ceil(totalStitchCount * progress)
  const hiddenFabricOffset = getHiddenFabricOffset(children, visibleStitchCount)
  const revealedChildren = revealScrollPatterns(
    children,
    visibleStitchCount,
    stitchOrder,
  )
  const stitchMotionProgress = getLoopProgress(progress * 8)
  const needlePierceProgress = Math.sin(stitchMotionProgress * Math.PI)
  const needleLiftProgress = Math.sin(stitchMotionProgress * Math.PI * 2)
  const needleAngle = needle?.angle ?? 13.63
  const classes = ['knit-scroll-pattern', className].filter(Boolean).join(' ')
  const scrollStyle = {
    ...style,
    '--knit-scroll-progress': progress,
    '--knit-scroll-needle-left-angle': `${(needleAngle + needleLiftProgress * 2) * -1}deg`,
    '--knit-scroll-needle-left-x': `${needlePierceProgress * -12}px`,
    '--knit-scroll-needle-left-y': `${needleLiftProgress * -7}px`,
    '--knit-scroll-needle-right-angle': `${needleAngle + needlePierceProgress * -5}deg`,
    '--knit-scroll-needle-right-x': `${needlePierceProgress * -34}px`,
    '--knit-scroll-needle-right-y': `${needleLiftProgress * 12}px`,
    '--knit-scroll-length': toCssSize(scrollLength),
    '--knit-scroll-needle-angle': `${needleAngle}deg`,
    '--knit-scroll-needle-color': needle?.color,
    '--knit-scroll-needle-highlight': needle?.highlightColor,
    '--knit-scroll-needle-thickness': needle?.thickness
      ? toCssSize(needle.thickness)
      : undefined,
    '--knit-scroll-fabric-y': `${hiddenFabricOffset * -1}px`,
  } as CSSProperties

  return (
    <div className={classes} ref={rootRef} style={scrollStyle} {...props}>
      <div className="knit-scroll-pattern__stage">
        {needle?.visible ? <KnitScrollNeedles /> : null}
        <div className="knit-scroll-pattern__fabric">{revealedChildren}</div>
      </div>
    </div>
  )
}

function KnitScrollNeedles() {
  return (
    <div aria-hidden="true" className="knit-scroll-pattern__needles">
      <span className="knit-scroll-pattern__needle knit-scroll-pattern__needle--left" />
      <span className="knit-scroll-pattern__needle knit-scroll-pattern__needle--right" />
    </div>
  )
}

function useKnitScrollProgress(rootRef: RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    let frame = 0

    if (prefersReducedMotion.matches) {
      frame = window.requestAnimationFrame(() => setProgress(1))

      return () => window.cancelAnimationFrame(frame)
    }

    const updateProgress = () => {
      const root = rootRef.current

      if (!root) {
        return
      }

      const rect = root.getBoundingClientRect()
      const scrollDistance = Math.max(1, root.offsetHeight - window.innerHeight)
      const nextProgress = clampNumber(-rect.top / scrollDistance, 0, 1)

      setProgress(nextProgress)
    }
    const requestUpdate = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateProgress)
    }

    requestUpdate()
    window.addEventListener('resize', requestUpdate)
    window.addEventListener('scroll', requestUpdate, { passive: true })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('scroll', requestUpdate)
    }
  }, [rootRef])

  return progress
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

function getScrollableStitchCount(children: ReactNode): number {
  return Children.toArray(children).reduce<number>(
    (count, child) => count + getNodeStitchCount(child),
    0,
  )
}

function getNodeStitchCount(node: ReactNode): number {
  if (!isElement(node)) {
    return 0
  }

  if (isKnitPatternElement(node)) {
    return getPatternStitchCount(node.props.pattern)
  }

  return getScrollableStitchCount(node.props.children)
}

function getPatternStitchCount(pattern: KnitPatternProps['pattern']): number {
  return pattern.castOn * pattern.rows.length
}

function getHiddenFabricOffset(
  children: ReactNode,
  visibleStitchCount: number,
): number {
  let remainingStitchCount = visibleStitchCount
  const childNodes = Children.toArray(children)
  let hiddenOffset = 0

  for (let index = childNodes.length - 1; index >= 0; index -= 1) {
    const [nodeOffset, nextRemainingStitchCount] = getNodeHiddenOffset(
      childNodes[index],
      remainingStitchCount,
    )

    remainingStitchCount = nextRemainingStitchCount
    hiddenOffset += nodeOffset
  }

  return hiddenOffset
}

function getNodeHiddenOffset(
  node: ReactNode,
  remainingStitchCount: number,
): [number, number] {
  if (!isElement(node)) {
    return [0, remainingStitchCount]
  }

  if (isKnitPatternElement(node)) {
    const pattern = node.props.pattern
    const patternStitchCount = getPatternStitchCount(pattern)
    const visibleStitchCount = clampNumber(
      remainingStitchCount,
      0,
      patternStitchCount,
    )
    const visibleRowCount = Math.min(
      pattern.rows.length,
      Math.max(0, Math.ceil(visibleStitchCount / pattern.castOn)),
    )
    const hiddenRowCount = pattern.rows.length - visibleRowCount

    return [
      getPatternHiddenOffset(node.props, hiddenRowCount),
      remainingStitchCount - patternStitchCount,
    ]
  }

  if (!node.props.children) {
    return [0, remainingStitchCount]
  }

  return getChildNodesHiddenOffset(
    node.props.children,
    remainingStitchCount,
    getVerticalGroupGap(node),
  )
}

function getChildNodesHiddenOffset(
  children: ReactNode,
  visibleStitchCount: number,
  gap = 0,
): [number, number] {
  let remainingStitchCount = visibleStitchCount
  const childNodes = Children.toArray(children)
  let hiddenOffset = 0

  for (let index = childNodes.length - 1; index >= 0; index -= 1) {
    const [nodeOffset, nextRemainingStitchCount] = getNodeHiddenOffset(
      childNodes[index],
      remainingStitchCount,
    )

    remainingStitchCount = nextRemainingStitchCount
    hiddenOffset += nodeOffset

    if (index > 0 && remainingStitchCount < getPreviousSiblingStitchCount(childNodes, index)) {
      hiddenOffset += gap
    }
  }

  return [hiddenOffset, remainingStitchCount]
}

function getPreviousSiblingStitchCount(
  childNodes: ReactNode[],
  endIndex: number,
): number {
  return childNodes
    .slice(0, endIndex)
    .reduce<number>((count, child) => count + getNodeStitchCount(child), 0)
}

function getVerticalGroupGap(node: ReactElement<KnitScrollElementProps>): number {
  if (node.props.direction === 'horizontal') {
    return 0
  }

  return getNumericSize(node.props.gap, 24)
}

function getPatternRowStep(props: KnitPatternProps): number {
  return (
    getNumericSize(props.stitchSize, 48) -
    getNumericSize(props.stitchOverlap, 6) +
    getNumericSize(props.rowGap ?? props.gap, getDensityGap(props.density))
  )
}

function getPatternHiddenOffset(
  props: KnitPatternProps,
  hiddenRowCount: number,
): number {
  if (hiddenRowCount <= 0) {
    return 0
  }

  if (hiddenRowCount >= props.pattern.rows.length) {
    return getPatternHeight(props)
  }

  return hiddenRowCount * getPatternRowStep(props)
}

function getPatternHeight(props: KnitPatternProps): number {
  const rowCount = props.pattern.rows.length

  if (rowCount <= 0) {
    return 0
  }

  return (
    (rowCount - 1) * getPatternRowStep(props) +
    getNumericSize(props.stitchSize, 48)
  )
}

function getNumericSize(
  value: number | string | undefined,
  fallback: number,
): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number.parseFloat(value)

    return Number.isFinite(parsedValue) ? parsedValue : fallback
  }

  return fallback
}

function getDensityGap(density: KnitPatternProps['density']): number {
  if (density === 'compact') {
    return 2
  }

  if (density === 'loose') {
    return 8
  }

  return 4
}

function revealScrollPatterns(
  children: ReactNode,
  visibleStitchCount: number,
  stitchOrder: KnitScrollStitchOrder,
): ReactNode {
  let revealContext: KnitScrollRevealContext = {
    rowOffset: 0,
    stitchOffset: 0,
    visibleStitchCount,
  }
  const childNodes = Children.toArray(children)
  const revealedChildren: ReactNode[] = [...childNodes]

  for (let index = childNodes.length - 1; index >= 0; index -= 1) {
    const [revealedChild, nextRevealContext] = revealScrollPatternNode(
      childNodes[index],
      revealContext,
      stitchOrder,
    )

    revealContext = nextRevealContext
    revealedChildren[index] = revealedChild
  }

  return revealedChildren
}

interface KnitScrollRevealContext {
  rowOffset: number
  stitchOffset: number
  visibleStitchCount: number
}

function revealScrollPatternNode(
  node: ReactNode,
  revealContext: KnitScrollRevealContext,
  stitchOrder: KnitScrollStitchOrder,
): [ReactNode, KnitScrollRevealContext] {
  if (!isElement(node)) {
    return [node, revealContext]
  }

  if (isKnitPatternElement(node)) {
    return [
      cloneElement(node, {
        reveal: {
          ...node.props.reveal,
          direction: node.props.reveal?.direction ?? 'bottom-to-top',
          order: node.props.reveal?.order ?? stitchOrder,
          rowOffset: revealContext.rowOffset,
          stitchOffset: revealContext.stitchOffset,
          visibleStitchCount: revealContext.visibleStitchCount,
        },
      }),
      {
        rowOffset: revealContext.rowOffset + node.props.pattern.rows.length,
        stitchOffset:
          revealContext.stitchOffset + getPatternStitchCount(node.props.pattern),
        visibleStitchCount: revealContext.visibleStitchCount,
      },
    ]
  }

  if (!node.props.children) {
    return [node, revealContext]
  }

  const [revealedChildren, nextRevealContext] = revealChildNodes(
    node.props.children,
    revealContext,
    stitchOrder,
  )

  return [
    cloneElement(node, undefined, revealedChildren),
    nextRevealContext,
  ]
}

function revealChildNodes(
  children: ReactNode,
  revealContext: KnitScrollRevealContext,
  stitchOrder: KnitScrollStitchOrder,
): [ReactNode, KnitScrollRevealContext] {
  let nextRevealContext = revealContext
  const childNodes = Children.toArray(children)
  const revealedChildren: ReactNode[] = [...childNodes]

  for (let index = childNodes.length - 1; index >= 0; index -= 1) {
    const [revealedChild, childRevealContext] = revealScrollPatternNode(
      childNodes[index],
      nextRevealContext,
      stitchOrder,
    )

    nextRevealContext = childRevealContext
    revealedChildren[index] = revealedChild
  }

  return [revealedChildren, nextRevealContext]
}

interface KnitScrollElementProps extends Partial<KnitPatternProps> {
  children?: ReactNode
  direction?: KnitPatternGroupDirection
}

function isElement(node: ReactNode): node is ReactElement<KnitScrollElementProps> {
  return typeof node === 'object' && node !== null && 'type' in node
}

function isKnitPatternElement(
  node: ReactElement<KnitScrollElementProps>,
): node is ReactElement<KnitPatternProps> {
  return node.type === KnitPattern && !!node.props.pattern
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getLoopProgress(value: number): number {
  return value - Math.floor(value)
}
