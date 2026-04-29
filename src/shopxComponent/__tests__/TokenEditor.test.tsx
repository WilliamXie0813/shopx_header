import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TokenEditor from '../TokenEditor'
import { defaultTheme } from '../theme/types'
import type { HeaderConfig } from '../types/header'

const mockConfig: HeaderConfig = {
  type: 'header',
  variant: 'centered',
  showSearch: true,
  navigation: [{ label: 'Home', href: '/' }],
}

describe('TokenEditor', () => {
  it('renders Colors section with all color fields', () => {
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('primary')).toBeInTheDocument()
    expect(screen.getByText('background')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('renders Typography section with font family inputs', () => {
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByLabelText(/heading font/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/body font/i)).toBeInTheDocument()
  })

  it('renders Config section with showSearch toggle', () => {
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByText('Config')).toBeInTheDocument()
    expect(screen.getByLabelText(/show search/i)).toBeInTheDocument()
  })

  it('calls onThemeChange when a color is edited', () => {
    const onThemeChange = vi.fn()
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={onThemeChange}
        onConfigChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    // Query the hex text input for primary color
    const primaryInputs = screen.getAllByDisplayValue('#3b82f6')
    const textInput = primaryInputs.find((el) => el.getAttribute('type') === 'text')
    expect(textInput).toBeDefined()
    fireEvent.change(textInput!, { target: { value: '#ef4444' } })

    expect(onThemeChange).toHaveBeenCalledWith('colors.primary', '#ef4444')
  })

  it('calls onConfigChange when showSearch is toggled', () => {
    const onConfigChange = vi.fn()
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={onConfigChange}
        onReset={vi.fn()}
      />
    )

    const toggle = screen.getByLabelText(/show search/i)
    fireEvent.click(toggle)

    expect(onConfigChange).toHaveBeenCalledWith('showSearch', false)
  })

  it('calls onReset when reset button is clicked', () => {
    const onReset = vi.fn()
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReset={onReset}
      />
    )

    const resetButton = screen.getByRole('button', { name: /reset to default/i })
    fireEvent.click(resetButton)

    expect(onReset).toHaveBeenCalled()
  })
})
