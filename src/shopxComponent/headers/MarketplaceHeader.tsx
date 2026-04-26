import { useState, useCallback } from 'react'
import { ChevronDown, Search, ShoppingBag, User } from 'lucide-react'
import type { HeaderProps, NavigationItem } from '../types/header'
import { useTheme } from '../theme/ThemeContext'
import { useDropdown } from '../hooks/useDropdown'

function Dropdown({ items, isOpen, ...rest }: { items: NavigationItem[]; isOpen: boolean } & React.HTMLAttributes<HTMLUListElement>) {
  const theme = useTheme()
  return (
    <ul
      {...rest}
      className={`dropdown-panel absolute left-0 top-full min-w-[180px] py-2 list-none m-0 p-0 z-50 shadow-lg ${isOpen ? 'dropdown-panel-open' : ''}`}
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

function CategoryPill({ item }: { item: NavigationItem }) {
  const theme = useTheme()
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="relative">
      <a
        href={item.href || '#'}
        {...(hasChildren ? triggerProps : {})}
        className="flex items-center gap-1 px-4 py-2 text-xs font-medium no-underline whitespace-nowrap transition-colors duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          color: theme.colors.text,
          borderRadius: theme.borderRadius.full,
        }}
      >
        {item.label}
        {hasChildren && (
          <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </a>
      {hasChildren && <Dropdown items={item.children!} isOpen={isOpen} {...dropdownProps} />}
    </li>
  )
}

export default function MarketplaceHeader({ config }: HeaderProps) {
  const theme = useTheme()
  const { showSearch, navigation } = config
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }, [])

  return (
    <header
      className="relative w-full"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily.body,
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <a
          href="/"
          className="text-xl font-bold no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            color: theme.colors.primary,
            fontFamily: theme.typography.fontFamily.heading,
          }}
        >
          {config.variant}
        </a>

        {showSearch && (
          <div className="flex-1 max-w-xl mx-8 relative">
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search for anything..."
              className="w-full px-4 py-2.5 pr-10 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.lg,
                border: `2px solid ${theme.colors.border}`,
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }}>
              <Search size={18} />
            </span>
          </div>
        )}

        <div className="flex items-center gap-5">
          <a
            href="/sell"
            className="text-xs font-medium no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.textSecondary }}
          >
            Sell
          </a>
          <a
            href="/cart"
            className="relative text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.text }}
            aria-label="Cart"
          >
            <ShoppingBag size={22} />
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center text-[9px] font-bold text-white w-4 h-4 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            >
              2
            </span>
          </a>
          <a
            href="/account"
            className="text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.text }}
            aria-label="Account"
          >
            <User size={22} />
          </a>
        </div>
      </div>

      {/* Category nav */}
      <nav
        className="flex items-center border-t overflow-x-auto"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <ul className="flex list-none m-0 p-0 px-6 py-2 gap-1">
          {navigation.map((item, idx) => (
            <CategoryPill key={idx} item={item} />
          ))}
        </ul>
      </nav>
    </header>
  )
}
