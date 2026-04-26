import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ColorField from './ColorField'

describe('ColorField', () => {
  it('renders label and current color value', () => {
    render(<ColorField label="Primary" value="#3b82f6" onChange={vi.fn()} />)

    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /hex/i })).toHaveValue('#3b82f6')
  })

  it('calls onChange when color picker changes', () => {
    const onChange = vi.fn()
    render(<ColorField label="Primary" value="#3b82f6" onChange={onChange} />)

    const picker = screen.getByLabelText('Primary color picker')
    fireEvent.change(picker, { target: { value: '#ef4444' } })

    expect(onChange).toHaveBeenCalledWith('#ef4444')
  })

  it('calls onChange when hex text input changes', () => {
    const onChange = vi.fn()
    render(<ColorField label="Primary" value="#3b82f6" onChange={onChange} />)

    const textInput = screen.getByRole('textbox', { name: /hex/i })
    fireEvent.change(textInput, { target: { value: '#22c55e' } })

    expect(onChange).toHaveBeenCalledWith('#22c55e')
  })

  it('syncs hex text when color picker changes', () => {
    const { rerender } = render(
      <ColorField label="Primary" value="#3b82f6" onChange={vi.fn()} />
    )

    rerender(<ColorField label="Primary" value="#ef4444" onChange={vi.fn()} />)

    expect(screen.getByRole('textbox', { name: /hex/i })).toHaveValue('#ef4444')
  })
})
