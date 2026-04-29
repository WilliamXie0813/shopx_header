import type { ThemeTokens } from './types'

export function mergeOverrides(base: ThemeTokens, overrides: Partial<ThemeTokens>): ThemeTokens {
  const result = { ...base }
  for (const key of Object.keys(base) as (keyof ThemeTokens)[]) {
    const baseValue = base[key]
    const overrideValue = overrides[key]
    if (overrideValue && typeof baseValue === 'object' && baseValue !== null) {
      ;(result as Record<string, unknown>)[key] = { ...baseValue, ...overrideValue }
    }
  }
  return result
}
