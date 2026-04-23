import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const collectionConfig: ThemeConfig = {
  accent: '#7c2d12',       // Burgundy
  accentLight: '#fef2f2',  // Rose-50
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  letterSpacing: '0.02em',
}

export function getCollectionTheme(headerBg = '#ffffff', headerText = '#1a1a1a') {
  return {
    ...deriveColors(headerBg, headerText),
    ...collectionConfig,
    headerBg,
    headerText,
  }
}
