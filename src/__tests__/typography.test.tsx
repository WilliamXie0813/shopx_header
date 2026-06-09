import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Title, Text } from '@/components/ui/typography'

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

describe('Text', () => {
  it('renders children', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies danger type class', () => {
    render(<Text type="danger">Danger</Text>)
    expect(screen.getByText('Danger')).toHaveClass('text-red-500')
  })

  it('applies success type class', () => {
    render(<Text type="success">Success</Text>)
    expect(screen.getByText('Success')).toHaveClass('text-green-600')
  })

  it('applies warning type class', () => {
    render(<Text type="warning">Warning</Text>)
    expect(screen.getByText('Warning')).toHaveClass('text-amber-500')
  })

  it('applies secondary type class', () => {
    render(<Text type="secondary">Secondary</Text>)
    expect(screen.getByText('Secondary')).toHaveClass('text-muted-foreground')
  })

  it('applies muted type class', () => {
    render(<Text type="muted">Muted</Text>)
    expect(screen.getByText('Muted')).toHaveClass('text-gray-400')
  })

  it('renders mark with highlight background', () => {
    render(<Text mark>Marked</Text>)
    const mark = screen.getByText('Marked')
    expect(mark.tagName).toBe('MARK')
    expect(mark).toHaveClass('bg-yellow-200/50', 'px-1', 'rounded')
  })

  it('renders code with mono font', () => {
    render(<Text code>Code</Text>)
    const code = screen.getByText('Code')
    expect(code.tagName).toBe('CODE')
    expect(code).toHaveClass('font-mono', 'text-sm', 'bg-muted', 'rounded')
  })

  it('renders keyboard style', () => {
    render(<Text keyboard>Kbd</Text>)
    const kbd = screen.getByText('Kbd')
    expect(kbd.tagName).toBe('KBD')
    expect(kbd).toHaveClass('font-mono', 'text-xs', 'border', 'rounded', 'shadow-sm')
  })

  it('renders underline', () => {
    render(<Text underline>Underlined</Text>)
    expect(screen.getByText('Underlined').tagName).toBe('U')
  })

  it('renders delete', () => {
    render(<Text delete>Deleted</Text>)
    expect(screen.getByText('Deleted').tagName).toBe('DEL')
  })

  it('renders strong', () => {
    render(<Text strong>Bold</Text>)
    expect(screen.getByText('Bold').tagName).toBe('STRONG')
  })

  it('renders italic', () => {
    render(<Text italic>Italic</Text>)
    expect(screen.getByText('Italic').tagName).toBe('EM')
  })

  it('merges custom className', () => {
    render(<Text className="custom-class">Text</Text>)
    expect(screen.getByText('Text')).toHaveClass('custom-class')
  })
})
