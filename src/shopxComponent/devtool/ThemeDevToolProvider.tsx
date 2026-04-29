import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react'
import { ThemeContext, defaultTheme, type ThemeTokens } from '../theme/ThemeContext'
import ThemeDevToolPanel from './ThemeDevToolPanel'

interface ThemeDevToolContextValue {
  overrides: Partial<ThemeTokens>
  setOverride: (path: string, value: string) => void
  resetOverrides: () => void
}

const ThemeDevToolContext = createContext<ThemeDevToolContextValue | null>(null)

export function useThemeDevTool() {
  const ctx = useContext(ThemeDevToolContext)
  if (!ctx) throw new Error('useThemeDevTool must be used within ThemeDevToolProvider')
  return ctx
}

function setNestedValue<T extends Record<string, unknown>>(obj: T, path: string, value: string): T {
  const result = { ...obj }
  const keys = path.split('.')
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    current[key] = { ...(current[key] as Record<string, unknown> || {}) }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result
}

function mergeOverrides(base: ThemeTokens, overrides: Partial<ThemeTokens>): ThemeTokens {
  const result = { ...base }
  for (const key of Object.keys(base) as (keyof ThemeTokens)[]) {
    const baseValue = base[key]
    const overrideValue = overrides[key]
    if (overrideValue && typeof baseValue === 'object' && baseValue !== null) {
      result[key] = { ...baseValue, ...overrideValue } as ThemeTokens[keyof ThemeTokens]
    }
  }
  return result
}

export default function ThemeDevToolProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Partial<ThemeTokens>>({})

  const mergedTheme = useMemo(
    () => mergeOverrides(defaultTheme, overrides),
    [overrides]
  )

  const setOverride = useCallback((path: string, value: string) => {
    setOverrides((prev) => {
      const next = { ...prev }
      const keys = path.split('.')
      const topKey = keys[0] as keyof ThemeTokens
      const restPath = keys.slice(1).join('.')

      if (topKey === 'colors') {
        next.colors = setNestedValue(next.colors || {}, restPath, value) as ThemeTokens['colors']
      } else if (topKey === 'typography') {
        next.typography = setNestedValue(next.typography || {}, restPath, value) as ThemeTokens['typography']
      } else if (topKey === 'spacing') {
        next.spacing = setNestedValue(next.spacing || {}, restPath, value) as ThemeTokens['spacing']
      } else if (topKey === 'borderRadius') {
        next.borderRadius = setNestedValue(next.borderRadius || {}, restPath, value) as ThemeTokens['borderRadius']
      } else {
        throw new Error(`Invalid top-level theme key "${String(topKey)}". Expected one of: colors, typography, spacing, borderRadius.`)
      }

      return next
    })
  }, [])

  const resetOverrides = useCallback(() => {
    setOverrides({})
  }, [])

  const contextValue = useMemo(
    () => ({ overrides, setOverride, resetOverrides }),
    [overrides, setOverride, resetOverrides]
  )

  return (
    <ThemeDevToolContext.Provider value={contextValue}>
      <ThemeContext.Provider value={mergedTheme}>
        {children}
      </ThemeContext.Provider>
      {import.meta.env.DEV && <ThemeDevToolPanel />}
    </ThemeDevToolContext.Provider>
  )
}
