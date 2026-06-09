import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Title } from '@/components/ui/typography'

describe('Title', () => {
  it('renders h1 by default', () => {
    render(<Title>Hello World</Title>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Hello World')
  })

  it('renders h1-h5 based on level prop', () => {
    for (let level = 1; level <= 5; level++) {
      const { rerender } = render(<Title level={level as 1 | 2 | 3 | 4 | 5}>Title</Title>)
      expect(screen.getByRole('heading', { level })).toBeInTheDocument()
      rerender(<></>)
    }
  })

  it('applies correct size classes for level 1', () => {
    render(<Title level={1}>Title</Title>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-5xl', 'font-medium')
  })

  it('merges custom className', () => {
    render(<Title className="custom-class">Title</Title>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('custom-class')
  })
})
