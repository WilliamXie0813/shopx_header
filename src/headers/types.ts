import type { ReactNode } from 'react'

export interface MenuItem {
  label: string
  href?: string
  icon?: ReactNode
  description?: string
  children?: MenuItem[]
}

export interface HeaderProps {
  logo: ReactNode
  menuItems: MenuItem[]
  headerBg?: string        // External: Header background
  headerText?: string      // External: Header text color
  onSearch?: (query: string) => void
  cartCount?: number
  userAvatar?: string
}

export interface DerivedColors {
  dropdownBg: string
  hoverBg: string
  border: string
  textMuted: string
}

export interface ThemeConfig {
  accent: string
  accentLight?: string
  fontFamily?: string
  letterSpacing?: string
  fontWeight?: number
}
