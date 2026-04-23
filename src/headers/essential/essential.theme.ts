import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const essentialConfig: ThemeConfig = {
  accent: '#6b7280',       // Gray-500, minimal
  accentLight: '#f3f4f6',  // Gray-100
}

export function getEssentialTheme(headerBg = '#ffffff', headerText = '#1f2937') {
  return {
    ...deriveColors(headerBg, headerText),
    ...essentialConfig,
    headerBg,
    headerText,
  }
}
