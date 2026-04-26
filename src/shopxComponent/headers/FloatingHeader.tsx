import { useState, useCallback } from 'react'
import { ShoppingBag, User } from 'lucide-react'
import type { HeaderProps, NavigationItem } from '../types/header'
import { useTheme } from '../theme/ThemeContext'
import { useDropdown } from '../hooks/useDropdown'

function Dropdown({ items, isOpen, ...rest }: { items: NavigationItem[]; isOpen: boolean } & React.HTMLAttributes<HTMLUListElement>) {
  const theme = useTheme()
  return (
    <ul
      {...rest}
      className={`dropdown-panel absolute left-0 top-full min-w-[160px] py-2 list-none m-0 p-0 z-50 shadow-xl ${isOpen ? 'dropdown-panel-open' : ''}`}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {items.map((child, idx) => (
        <li key={idx} className="dropdown-item">
          <a
            href={child.href || '#'}
            className="block px-4 py-2 text-sm no-underline hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.text }}
          >
            {child.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function NavItem({ item }: { item: NavigationItem }) {
  const theme = useTheme()
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="relative">
      <a
        href={item.href || '#'}
        {...(hasChildren ? triggerProps : {})}
        className="block px-3 py-2 text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ color: theme.colors.text }}
      >
        {item.label}
      </a>
      {hasChildren && <Dropdown items={item.children!} isOpen={isOpen} {...dropdownProps} />}
    </li>
  )
}

export default function FloatingHeader({ config }: HeaderProps) {
  const theme = useTheme()
  const { showSearch, navigation } = config
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }, [])

  return (
    <div className="w-full px-6 py-4">
      <header
        className="flex items-center justify-between px-6 py-3 shadow-lg"
        style={{
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.xl,
          fontFamily: theme.typography.fontFamily.body,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <a
            href="/"
            className="text-lg font-bold no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily.heading,
            }}
          >
            {config.variant}
          </a>
        </div>

        {/* Nav */}
        <nav className="flex justify-center">
          <ul className="flex list-none m-0 p-0 gap-1">
            {navigation.map((item, idx) => (
              <NavItem key={idx} item={item} />
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {showSearch && (
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="px-3 py-1.5 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                width: '180px',
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.full,
                border: `1px solid ${theme.colors.border}`,
              }}
            />
          )}

          <a
            href="/cart"
            className="text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.text }}
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
          </a>

          <a
            href="/account"
            className="text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.text }}
            aria-label="Account"
          >
            <User size={18} />
          </a>
        </div>
      </header>
    </div>
  )
}
