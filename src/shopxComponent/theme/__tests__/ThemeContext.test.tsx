import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { ThemeContext, ThemeProvider } from '../ThemeContext'
import { ThemeDevToolApiContext } from '../devtoolContext'
import { defaultTheme } from '../types'

function Consumer({ prop = 'primary' }: { prop?: 'primary' | 'background' }) {
  const theme = useContext(ThemeContext)
  return <div data-testid={prop}>{theme.colors[prop]}</div>
}

const mockApi = {
  overrides: { colors: { primary: '#ff0000' } } as unknown as NonNullable<Parameters<typeof ThemeDevToolApiContext.Provider>[0]['value']>['overrides'],
  setOverride: () => {},
  resetOverrides: () => {},
  importTheme: () => {},
}

describe('ThemeContext export', () => {
  it('ThemeContext is exported and can be consumed directly', () => {
    render(
      <ThemeContext.Provider value={defaultTheme}>
        <Consumer />
      </ThemeContext.Provider>
    )

    expect(screen.getByTestId('primary')).toHaveTextContent('#3b82f6')
  })
})

describe('ThemeProvider override merging', () => {
  it('automatically merges ThemeDevToolApiContext into the provided theme', () => {
    render(
      <ThemeDevToolApiContext.Provider value={mockApi}>
        <ThemeProvider theme={defaultTheme}>
          <Consumer />
        </ThemeProvider>
      </ThemeDevToolApiContext.Provider>
    )

    expect(screen.getByTestId('primary')).toHaveTextContent('#ff0000')
  })

  it('preserves non-overridden values', () => {
    render(
      <ThemeDevToolApiContext.Provider value={mockApi}>
        <ThemeProvider theme={defaultTheme}>
          <Consumer prop="background" />
        </ThemeProvider>
      </ThemeDevToolApiContext.Provider>
    )

    expect(screen.getByTestId('background')).toHaveTextContent('#ffffff')
  })
})
