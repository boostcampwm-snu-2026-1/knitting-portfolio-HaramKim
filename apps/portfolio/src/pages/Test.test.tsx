import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Test from './Test'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Test scroll knitting demo', () => {
  it('opens the click result modal when the clickable stitch is selected', () => {
    render(<Test />)

    fireEvent.click(screen.getByRole('button', {
      name: 'knit stitch row 2, column 3',
    }))

    expect(screen.getByRole('dialog', { name: '클릭 가능' })).toBeInTheDocument()
  })

  it('moves the knitted fabric down while scrolling and back up when scrolling back', async () => {
    render(<Test />)

    const pattern = screen.getByLabelText('scroll knitted cable pattern')
    const scrollRoot = pattern.closest<HTMLElement>('.knit-scroll-pattern')

    expect(scrollRoot).not.toBeNull()

    if (!scrollRoot) {
      return
    }

    setScrollMetrics(scrollRoot, 0)

    await waitFor(() => {
      expect(scrollRoot.style.getPropertyValue('--knit-scroll-progress')).toBe(
        '0',
      )
    })

    const initialVisibleStitches = getVisibleStitches(scrollRoot).length

    await scrollDemoTo(scrollRoot, 0.5)

    expect(scrollRoot.style.getPropertyValue('--knit-scroll-progress')).toBe(
      '0.5',
    )
    expect(getVisibleStitches(scrollRoot).length).toBeGreaterThan(
      initialVisibleStitches,
    )

    await scrollDemoTo(scrollRoot, 0)

    expect(scrollRoot.style.getPropertyValue('--knit-scroll-progress')).toBe(
      '0',
    )
    expect(getVisibleStitches(scrollRoot)).toHaveLength(initialVisibleStitches)
  })
})

async function scrollDemoTo(element: HTMLElement, progress: number) {
  setScrollMetrics(element, progress)

  fireEvent.scroll(window)

  await act(async () => {
    await new Promise((resolve) => window.requestAnimationFrame(resolve))
  })
}

function setScrollMetrics(element: HTMLElement, progress: number) {
  const viewportHeight = 1000
  const scrollableHeight = 2000
  const scrollDistance = scrollableHeight - viewportHeight

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: viewportHeight,
  })
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    value: scrollableHeight,
  })

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    bottom: scrollableHeight - scrollDistance * progress,
    height: scrollableHeight,
    left: 0,
    right: 0,
    top: scrollDistance * progress * -1,
    width: 0,
    x: 0,
    y: scrollDistance * progress * -1,
    toJSON: () => {},
  })
}

function getVisibleStitches(element: Element) {
  return Array.from(
    element.querySelectorAll('.knit-pattern-view__reveal-stitch--visible'),
  )
}
