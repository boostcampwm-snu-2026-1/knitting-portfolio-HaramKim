import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnitStitchUnit } from './KnitStitchUnit'

describe('KnitStitchUnit', () => {
  it('renders decorative stitches as hidden svg elements by default', () => {
    const { container } = render(<KnitStitchUnit kind="knit" />)

    const stitch = container.querySelector('svg')

    expect(stitch).toHaveAttribute('aria-hidden', 'true')
    expect(stitch).toHaveClass('knit-stitch-unit')
    expect(stitch).toHaveClass('knit-stitch-unit--knit')
  })

  it('exposes an accessible image when labelled', () => {
    render(<KnitStitchUnit aria-label="Knit stitch" kind="purl" />)

    const stitch = screen.getByRole('img', { name: 'Knit stitch' })

    expect(stitch).toHaveClass('knit-stitch-unit--purl')
  })
})
