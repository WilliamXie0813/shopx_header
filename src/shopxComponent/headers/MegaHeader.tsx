import { useState, useCallback } from 'react'
import { ShoppingBag, User } from 'lucide-react'
import type { HeaderProps, NavigationItem } from '../types/header'
import { useTheme } from '../theme/ThemeContext'
import { useDropdown } from '../hooks/useDropdown'

function MegaDropdown({ item, dropdownProps, isOpen }: { item: NavigationItem; dropdownProps: { onMouseEnter: () => void; onMouseLeave: () => void }; isOpen: boolean }) {
  const theme = useTheme()
  const children = item.children || []

  return (
    <div
      {...dropdownProps}
      className={`mega-panel absolute left-0 right-0 top-full z-50 shadow-xl border-t ${isOpen ? 'mega-panel-open' : ''}`}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-8">
          {children.map((child) => (
            <div key={child.label} className="min-w-0 mega-item">
              <a
                href={child.href || '#'}
                className="block text-sm font-semibold no-underline mb-3 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamily.heading,
                }}
              >
                {child.label}
              </a>
              {child.description && (
                <p className="text-xs mb-3 truncate" style={{ color: theme.colors.textSecondary }}>
                  {child.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NavItem({ item }: { item: NavigationItem }) {
  const theme = useTheme()
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="static">
      <a
        href={item.href || '#'}
        {...(hasChildren ? triggerProps : {})}
        className="block px-4 py-3 text-sm font-medium no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ color: theme.colors.text }}
      >
        {item.label}
      </a>
      {hasChildren && <MegaDropdown item={item} dropdownProps={dropdownProps} isOpen={isOpen} />}
    </li>
  )
}

export default function MegaHeader({ config }: HeaderProps) {
  const theme = useTheme()
  const { showSearch, navigation } = config
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }, [])

  return (
    <header
      className="relative w-full border-b"
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
        fontFamily: theme.typography.fontFamily.body,
      }}
    >
      {/* Top row: logo + search + actions */}
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <a
          href="/"
          className="text-xl font-bold no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamily.heading,
          }}
        >
          {config.variant}
        </a>

        {showSearch && (
          <div className="flex-1 max-w-md mx-8">
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search products, categories..."
              className="w-full px-4 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <a
            href="/cart"
            className="text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.text }}
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
          </a>
          <a
            href="/account"
            className="text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.text }}
            aria-label="Account"
          >
            <User size={20} />
          </a>
        </div>
      </div>

      {/* Bottom row: mega navigation */}
      <nav
        className="relative flex items-center justify-center border-t"
        style={{ borderColor: theme.colors.border }}
      >
        <ul className="flex list-none m-0 p-0">
          {navigation.map((item, idx) => (
            <NavItem key={idx} item={item} />
          ))}
        </ul>
      </nav>
    </header>
  )
}
