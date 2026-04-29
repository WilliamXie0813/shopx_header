export interface NavigationItem {
  label: string
  href: string
  description?: string
  children?: NavigationItem[]
}

export interface HeaderConfig {
  type: 'header'
  variant: string
  showSearch: boolean
  navigation: NavigationItem[]
}

export interface HeaderProps {
  config: HeaderConfig
  data?: any
}
