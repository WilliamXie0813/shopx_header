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
})
