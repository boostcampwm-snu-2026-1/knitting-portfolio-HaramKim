import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

describe('App', () => {
  it('renders the Home design portfolio landing', () => {
    render(<App />)

    const scrollPattern = screen.getByLabelText('home knit scroll pattern')
    const knitPattern = screen.getByLabelText(
      '28 by 30 knit purl cable repeat pattern',
    )

    expect(screen.getByRole('heading', {
      name: 'Design Portfolio',
    })).toBeInTheDocument()
    expect(scrollPattern).toHaveClass('knit-scroll-pattern')
    expect(knitPattern).toHaveAttribute('data-row-count', '30')
  })

  it('navigates to the Test page when the left cable pattern is clicked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', {
      name: /cable stitch row 2, column 3/,
    }))

    expect(window.location.pathname).toBe('/test')
    expect(screen.getByRole('heading', {
      name: 'Knit UI System',
    })).toBeInTheDocument()
  })
})
