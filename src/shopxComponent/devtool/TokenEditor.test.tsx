import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TokenEditor from './TokenEditor'
import { defaultTheme } from '../theme/ThemeContext'

describe('TokenEditor (devtool)', () => {
  it('renders all color fields', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('primary')).toBeInTheDocument()
    expect(screen.getByText('background')).toBeInTheDocument()
    expect(screen.getByText('surface')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
    expect(screen.getByText('textSecondary')).toBeInTheDocument()
    expect(screen.getByText('textInverse')).toBeInTheDocument()
    expect(screen.getByText('border')).toBeInTheDocument()
    expect(screen.getByText('error')).toBeInTheDocument()
    expect(screen.getByText('success')).toBeInTheDocument()
    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('renders typography font family inputs', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByLabelText(/heading font/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/body font/i)).toBeInTheDocument()
  })

  it('renders font size inputs', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByLabelText(/font size xs/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/font size base/i)).toBeInTheDocument()
  })

  it('renders spacing inputs', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText('Spacing')).toBeInTheDocument()
    expect(screen.getByLabelText(/spacing xs/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/spacing md/i)).toBeInTheDocument()
  })

  it('renders border radius inputs', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText('Border Radius')).toBeInTheDocument()
    expect(screen.getByLabelText(/border radius sm/i)).toBeInTheDocument()
  })

  it('calls onChange when a color is edited', () => {
    const onChange = vi.fn()
    render(<TokenEditor theme={defaultTheme} onChange={onChange} onReset={vi.fn()} />)

    const primaryInputs = screen.getAllByDisplayValue('#3b82f6')
    const textInput = primaryInputs.find((el) => el.getAttribute('type') === 'text')
    expect(textInput).toBeDefined()
    fireEvent.change(textInput!, { target: { value: '#ef4444' } })

    expect(onChange).toHaveBeenCalledWith('colors.primary', '#ef4444')
  })

  it('calls onChange when font size is edited', () => {
    const onChange = vi.fn()
    render(<TokenEditor theme={defaultTheme} onChange={onChange} onReset={vi.fn()} />)

    const input = screen.getByLabelText(/font size base/i)
    fireEvent.change(input, { target: { value: '1.25rem' } })

    expect(onChange).toHaveBeenCalledWith('typography.fontSizes.base', '1.25rem')
  })

})
