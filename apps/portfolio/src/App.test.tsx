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
  it('renders the Knit UI System intro', () => {
    render(<App />)

    expect(screen.getByRole('heading', {
      name: 'Knit UI System',
    })).toBeInTheDocument()
    expect(screen.getByRole('img', {
      name: 'purl stitch unit',
    })).toBeInTheDocument()
  })
})
