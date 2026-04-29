import { useState, useMemo, useCallback, type ReactNode } from 'react'
import { ThemeContext } from '../theme/ThemeContext'
import { defaultTheme, type ThemeTokens } from '../theme/types'
import { mergeOverrides } from '../theme/utils'
import { ThemeDevToolApiContext } from '../theme/devtoolContext'
import ThemeDevToolPanel from './ThemeDevToolPanel'

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

function diffTheme(base: ThemeTokens, imported: ThemeTokens): Partial<ThemeTokens> {
  const overrides: Partial<ThemeTokens> = {}
  for (const key of Object.keys(base) as (keyof ThemeTokens)[]) {
    const baseValue = base[key]
    const importedValue = imported[key]
    if (typeof baseValue === 'object' && baseValue !== null && importedValue) {
      const nestedDiff: Record<string, unknown> = {}
      for (const nestedKey of Object.keys(baseValue)) {
        if ((baseValue as Record<string, unknown>)[nestedKey] !== (importedValue as Record<string, unknown>)[nestedKey]) {
          nestedDiff[nestedKey] = (importedValue as Record<string, unknown>)[nestedKey]
        }
      }
      if (Object.keys(nestedDiff).length > 0) {
        ;(overrides as Record<string, unknown>)[key] = nestedDiff
      }
    }
  }
  return overrides
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

  const importTheme = useCallback((theme: ThemeTokens) => {
    setOverrides(diffTheme(defaultTheme, theme))
  }, [])

  const contextValue = useMemo(
    () => ({ overrides, setOverride, resetOverrides, importTheme }),
    [overrides, setOverride, resetOverrides, importTheme]
  )

  return (
    <ThemeDevToolApiContext.Provider value={contextValue}>
      <ThemeContext.Provider value={mergedTheme}>
        {children}
        {import.meta.env.DEV && <ThemeDevToolPanel />}
      </ThemeContext.Provider>
    </ThemeDevToolApiContext.Provider>
  )
}
