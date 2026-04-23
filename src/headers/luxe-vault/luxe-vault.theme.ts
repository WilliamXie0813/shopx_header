import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const luxeConfig: ThemeConfig = {
  accent: '#c9a96e',       // Champagne gold
  accentLight: '#f5f3ef',  // Warm white
  fontFamily: "'Cormorant Garamond', serif",
  letterSpacing: '0.15em',
  fontWeight: 300,
}

export function getLuxeTheme(headerBg = '#0a0a0a', headerText = '#f5f3ef') {
  return {
    ...deriveColors(headerBg, headerText),
    ...luxeConfig,
    headerBg,
    headerText,
  }
}
