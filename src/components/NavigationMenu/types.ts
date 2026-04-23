import type { ReactNode } from 'react'

export interface MenuItem {
  label: string
  href?: string
  icon?: ReactNode
  description?: string
  children?: MenuItem[]
}

export interface NavigationMenuProps {
  items: MenuItem[]
  className?: string
  itemClassName?: string
  submenuClassName?: string
  activeHref?: string
}
