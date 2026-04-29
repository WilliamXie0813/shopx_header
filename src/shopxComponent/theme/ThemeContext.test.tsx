import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { ThemeContext, defaultTheme } from './ThemeContext'

function Consumer() {
  const theme = useContext(ThemeContext)
  return <div data-testid="color">{theme.colors.primary}</div>
}

describe('ThemeContext export', () => {
  it('ThemeContext is exported and can be consumed directly', () => {
    render(
      <ThemeContext.Provider value={defaultTheme}>
        <Consumer />
      </ThemeContext.Provider>
    )

    expect(screen.getByTestId('color')).toHaveTextContent('#3b82f6')
  })
})
