import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(() => {
  cleanup()
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
})
