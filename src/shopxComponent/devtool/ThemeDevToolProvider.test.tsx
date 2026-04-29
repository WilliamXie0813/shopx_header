import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useContext } from 'react'
import ThemeDevToolProvider, { useThemeDevTool } from './ThemeDevToolProvider'
import { ThemeContext, defaultTheme } from '../theme/ThemeContext'

function ThemeConsumer() {
  const theme = useContext(ThemeContext)
  return <div data-testid="primary">{theme.colors.primary}</div>
}

function OverrideButton() {
  const { setOverride } = useThemeDevTool()
  return (
    <button onClick={() => setOverride('colors.primary', '#ff0000')}>
      Change Primary
    </button>
  )
}

function ResetButton() {
  const { resetOverrides } = useThemeDevTool()
  return <button onClick={resetOverrides}>Reset</button>
}

describe('ThemeDevToolProvider', () => {
  it('provides default theme initially', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeConsumer />
      </ThemeDevToolProvider>
    )

    expect(screen.getByTestId('primary')).toHaveTextContent('#3b82f6')
  })

  it('applies override to theme when setOverride is called', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeConsumer />
        <OverrideButton />
      </ThemeDevToolProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /change primary/i }))

    expect(screen.getByTestId('primary')).toHaveTextContent('#ff0000')
  })

  it('resets overrides when resetOverrides is called', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeConsumer />
        <OverrideButton />
        <ResetButton />
      </ThemeDevToolProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /change primary/i }))
    expect(screen.getByTestId('primary')).toHaveTextContent('#ff0000')

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByTestId('primary')).toHaveTextContent('#3b82f6')
  })

  it('does not render devtool panel in test environment by default', () => {
    // The panel renders conditionally based on import.meta.env.DEV
    // In jsdom tests, this is typically undefined/falsy
    render(
      <ThemeDevToolProvider>
        <ThemeConsumer />
      </ThemeDevToolProvider>
    )

    // Panel should not be visible
    expect(screen.queryByText(/theme devtool/i)).not.toBeInTheDocument()
  })

  it('throws when useThemeDevTool is used outside ThemeDevToolProvider', () => {
    function RogueConsumer() {
      useThemeDevTool()
      return <div />
    }

    // Suppress console.error for expected throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<RogueConsumer />)).toThrow('useThemeDevTool must be used within ThemeDevToolProvider')
    spy.mockRestore()
  })

  it('applies nested typography.fontFamily.heading override', () => {
    function FontFamilyConsumer() {
      const theme = useContext(ThemeContext)
      return <div data-testid="font-heading">{theme.typography.fontFamily.heading}</div>
    }

    function FontFamilyButton() {
      const { setOverride } = useThemeDevTool()
      return (
        <button onClick={() => setOverride('typography.fontFamily.heading', 'Arial')}>
          Change Font
        </button>
      )
    }

    render(
      <ThemeDevToolProvider>
        <FontFamilyConsumer />
        <FontFamilyButton />
      </ThemeDevToolProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /change font/i }))
    expect(screen.getByTestId('font-heading')).toHaveTextContent('Arial')
  })

  it('applies nested typography.fontSizes.2xl override', () => {
    function FontSizeConsumer() {
      const theme = useContext(ThemeContext)
      return <div data-testid="font-2xl">{theme.typography.fontSizes['2xl']}</div>
    }

    function FontSizeButton() {
      const { setOverride } = useThemeDevTool()
      return (
        <button onClick={() => setOverride('typography.fontSizes.2xl', '2rem')}>
          Change Size
        </button>
      )
    }

    render(
      <ThemeDevToolProvider>
        <FontSizeConsumer />
        <FontSizeButton />
      </ThemeDevToolProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /change size/i }))
    expect(screen.getByTestId('font-2xl')).toHaveTextContent('2rem')
  })

  it('applies nested spacing.md override', () => {
    function SpacingConsumer() {
      const theme = useContext(ThemeContext)
      return <div data-testid="spacing-md">{theme.spacing.md}</div>
    }

    function SpacingButton() {
      const { setOverride } = useThemeDevTool()
      return (
        <button onClick={() => setOverride('spacing.md', '1.5rem')}>
          Change Spacing
        </button>
      )
    }

    render(
      <ThemeDevToolProvider>
        <SpacingConsumer />
        <SpacingButton />
      </ThemeDevToolProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /change spacing/i }))
    expect(screen.getByTestId('spacing-md')).toHaveTextContent('1.5rem')
  })
})
