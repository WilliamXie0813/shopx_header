import { createContext, useContext } from 'react'
import type { ThemeTokens } from './types'

export interface ThemeDevToolApi {
  overrides: Partial<ThemeTokens>
  setOverride: (path: string, value: string) => void
  resetOverrides: () => void
  importTheme: (theme: ThemeTokens) => void
}

export const ThemeDevToolApiContext = createContext<ThemeDevToolApi | null>(null)

export function useThemeDevTool() {
  const ctx = useContext(ThemeDevToolApiContext)
  if (!ctx) throw new Error('useThemeDevTool must be used within ThemeDevToolProvider')
  return ctx
}
