import { describe, it, expect } from 'vitest'
import { hexToHsl, deriveColors } from '../utils'

describe('hexToHsl', () => {
  it('converts #ffffff to { h: 0, s: 0, l: 100 }', () => {
    expect(hexToHsl('#ffffff')).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('converts #000000 to { h: 0, s: 0, l: 0 }', () => {
    expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 })
  })
})

describe('deriveColors', () => {
  it('produces correct output structure', () => {
    const result = deriveColors('#1f2937', '#ffffff')
    expect(result).toHaveProperty('dropdownBg')
    expect(result).toHaveProperty('hoverBg')
    expect(result).toHaveProperty('border')
    expect(result).toHaveProperty('textMuted')
    expect(typeof result.dropdownBg).toBe('string')
    expect(typeof result.hoverBg).toBe('string')
    expect(typeof result.border).toBe('string')
    expect(typeof result.textMuted).toBe('string')
  })

  it('dropdownBg differs from headerBg', () => {
    const headerBg = '#1f2937'
    const result = deriveColors(headerBg, '#ffffff')
    expect(result.dropdownBg).not.toBe(headerBg)
  })
})
