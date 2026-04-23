import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const fashionConfig: ThemeConfig = {
  accent: '#FF0080', // Neon pink
}

export function getFashionTheme(headerBg = '#0a0a0a', headerText = '#ffffff') {
  return {
    ...deriveColors(headerBg, headerText),
    ...fashionConfig,
    headerBg,
    headerText,
  }
}
