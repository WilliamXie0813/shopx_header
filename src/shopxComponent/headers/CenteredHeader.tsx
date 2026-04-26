import { useState, useCallback } from 'react'
import { User } from 'lucide-react'
import type { HeaderProps, NavigationItem } from '../types/header'
import { useTheme } from '../theme/ThemeContext'
import { useDropdown } from '../hooks/useDropdown'

function Dropdown({ items, isOpen, ...rest }: { items: NavigationItem[]; isOpen: boolean } & React.HTMLAttributes<HTMLUListElement>) {
  const theme = useTheme()
  return (
    <ul
      {...rest}
      className={`dropdown-panel absolute left-1/2 -translate-x-1/2 top-full min-w-[160px] py-2 list-none m-0 p-0 z-50 shadow-lg ${isOpen ? 'dropdown-panel-open' : ''}`}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
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
        className="block px-4 py-2 text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ color: theme.colors.text }}
      >
        {item.label}
      </a>
      {hasChildren && <Dropdown items={item.children!} isOpen={isOpen} {...dropdownProps} />}
    </li>
  )
}

export default function CenteredHeader({ config }: HeaderProps) {
  const theme = useTheme()
  const { showSearch, navigation } = config
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }, [])

  const leftNav = navigation.filter((_, i) => i % 2 === 0)
  const rightNav = navigation.filter((_, i) => i % 2 !== 0)

  return (
    <header
      className="relative w-full"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily.body,
      }}
    >
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        {/* Left nav */}
        <nav className="flex-1">
          <ul className="flex list-none m-0 p-0 gap-1 justify-start">
            {leftNav.map((item, idx) => (
              <NavItem key={idx} item={item} />
            ))}
          </ul>
        </nav>

        {/* Centered Logo */}
        <div className="flex-1 text-center">
          <a
            href="/"
            className="text-xl font-bold no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily.heading,
            }}
          >
            {config.variant.toUpperCase()}
          </a>
        </div>

        {/* Right nav + actions */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <nav>
            <ul className="flex list-none m-0 p-0 gap-1 justify-end">
              {rightNav.map((item, idx) => (
                <NavItem key={idx} item={item} />
              ))}
            </ul>
          </nav>

          {showSearch && (
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search"
              className="px-3 py-1 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                width: '160px',
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
              }}
            />
          )}

          <a
            href="/account"
            className="text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.text }}
            aria-label="Account"
          >
            <User size={18} />
          </a>
        </div>
      </div>
    </header>
  )
}
