import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KnitPattern } from './KnitPattern'
import { KnitScrollPattern } from './KnitScrollPattern'
import type { KnitPatternData } from '../pattern'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const scrollPattern: KnitPatternData = {
  castOn: 2,
  rows: [
    {
      stitches: [{ kind: 'knit' }, { kind: 'purl' }],
    },
    {
      stitches: [{ kind: 'purl' }, { kind: 'knit' }],
    },
  ],
}

describe('KnitScrollPattern needle motion', () => {
  it('moves needles by scroll distance instead of scroll progress', async () => {
    const shortScroll = await getScrollStateAfterDistance({
      scrollableHeight: 2000,
      scrollTop: 100,
    })
    const longScroll = await getScrollStateAfterDistance({
      scrollableHeight: 11000,
      scrollTop: 100,
    })

    expect(shortScroll.progress).toBe('0.1')
    expect(longScroll.progress).toBe('0.01')
    expect(shortScroll.needleLeftX).toBe(longScroll.needleLeftX)
    expect(shortScroll.needleLeftY).toBe(longScroll.needleLeftY)
  })
})

interface ScrollMetrics {
  scrollableHeight: number
  scrollTop: number
}

async function getScrollStateAfterDistance(metrics: ScrollMetrics) {
  const { unmount } = render(
    <KnitScrollPattern aria-label="scroll pattern" needle={{ visible: true }}>
      <KnitPattern pattern={scrollPattern} />
    </KnitScrollPattern>,
  )
  const scrollRoot = screen.getByLabelText('scroll pattern')

  setScrollMetrics(scrollRoot, {
    scrollableHeight: metrics.scrollableHeight,
    scrollTop: 0,
  })
  await nextAnimationFrame()

  setScrollMetrics(scrollRoot, metrics)
  fireEvent.scroll(window)
  await nextAnimationFrame()

  const state = {
    needleLeftX: scrollRoot.style.getPropertyValue(
      '--knit-scroll-needle-left-x',
    ),
    needleLeftY: scrollRoot.style.getPropertyValue(
      '--knit-scroll-needle-left-y',
    ),
    progress: scrollRoot.style.getPropertyValue('--knit-scroll-progress'),
  }

  unmount()

  return state
}

function setScrollMetrics(element: HTMLElement, metrics: ScrollMetrics) {
  const viewportHeight = 1000

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: viewportHeight,
  })
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    value: metrics.scrollableHeight,
  })

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    bottom: metrics.scrollableHeight - metrics.scrollTop,
    height: metrics.scrollableHeight,
    left: 0,
    right: 0,
    top: metrics.scrollTop * -1,
    width: 0,
    x: 0,
    y: metrics.scrollTop * -1,
    toJSON: () => {},
  })
}

async function nextAnimationFrame() {
  await act(async () => {
    await new Promise((resolve) => window.requestAnimationFrame(resolve))
  })
}
