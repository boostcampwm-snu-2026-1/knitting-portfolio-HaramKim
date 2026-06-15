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
  it('renders the Home knit scroll pattern', () => {
    render(<App />)

    const scrollPattern = screen.getByLabelText('home knit scroll pattern')
    const knitPattern = screen.getByRole('img', {
      name: '20 by 50 knit purl repeat pattern',
    })

    expect(scrollPattern).toHaveClass('knit-scroll-pattern')
    expect(knitPattern).toHaveAttribute('data-row-count', '50')
  })
})
