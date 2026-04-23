import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const cardMarketConfig: ThemeConfig = {
  accent: '#ffd700',       // Gold
  accentLight: '#1a1a2e',  // Deep purple
}

export function getCardMarketTheme(headerBg = '#1a1a2e', headerText = '#e2e8f0') {
  return {
    ...deriveColors(headerBg, headerText),
    ...cardMarketConfig,
    headerBg,
    headerText,
  }
}
