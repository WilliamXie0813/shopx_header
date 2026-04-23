import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const impulseConfig: ThemeConfig = {
  accent: '#e53935', // Alert red
}

export function getImpulseTheme(headerBg = '#ffffff', headerText = '#1f2937') {
  return {
    ...deriveColors(headerBg, headerText),
    ...impulseConfig,
    headerBg,
    headerText,
  }
}
