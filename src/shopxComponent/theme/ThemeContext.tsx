import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export interface ThemeTokens {
  colors: {
    primary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    textInverse: string
    border: string
    error: string
    success: string
    warning: string
  }
  typography: {
    fontFamily: {
      heading: string
      body: string
    }
    fontSizes: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
      '5xl': string
      '6xl': string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
}

export const defaultTheme: ThemeTokens = {
  colors: {
    primary: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    textInverse: '#ffffff',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  typography: {
    fontFamily: {
      heading: "'Inter', system-ui, -apple-system, sans-serif",
      body: "'Inter', system-ui, -apple-system, sans-serif",
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
}

export const ThemeContext = createContext<ThemeTokens>(defaultTheme)

export function ThemeProvider({
  theme = defaultTheme,
  children,
}: {
  theme?: ThemeTokens
  children: ReactNode
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
