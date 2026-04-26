import { useState, useCallback } from 'react'
import { Search, ShoppingBag, ChevronDown, User } from 'lucide-react'
import type { HeaderProps, NavigationItem } from '../types/header'
import { useTheme } from '../theme/ThemeContext'
import { useDropdown } from '../hooks/useDropdown'

function NavItem({ item }: { item: NavigationItem }) {
  const theme = useTheme()
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="relative">
      <a
        href={item.href || '#'}
        {...(hasChildren ? triggerProps : {})}
        className="relative flex items-center gap-1 uppercase text-[11px] tracking-[0.15em] font-light px-6 py-4 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ color: theme.colors.textInverse }}
        onClick={(e) => { if (hasChildren) e.preventDefault() }}
      >
        {item.label}
        {hasChildren && <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
      </a>

      {hasChildren && (
        <div
          {...dropdownProps}
          className={`luxe-panel fixed left-0 w-full z-40 border-t ${isOpen ? 'luxe-panel-open' : ''}`}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary,
          }}
        >
          <div className="max-w-6xl mx-auto px-8 py-12">
            <div className="grid grid-cols-3 gap-12">
              {item.children!.map((child) => (
                <a
                  key={child.label}
                  href={child.href || '#'}
                  className="luxe-item group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <span
                    className="block uppercase text-[11px] tracking-[0.15em] font-light mb-2 transition-colors duration-300 group-hover:opacity-70"
                    style={{ color: theme.colors.text }}
                  >
                    {child.label}
                  </span>
                  {child.description && (
                    <span
                      className="block text-[10px] tracking-[0.1em] font-light"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {child.description}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LuxeValutHeader({ config }: HeaderProps) {
  const theme = useTheme()
  const { showSearch, navigation } = config
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setSearchOpen(false)
      setSearchQuery('')
    },
    []
  )

  return (
    <header
      className="relative w-full"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textInverse,
        fontFamily: theme.typography.fontFamily.heading,
      }}
    >
      {/* Top bar: Logo centered, actions right */}
      <div className="flex items-center justify-between px-8 py-5">
        <div className="w-20" />

        <div className="text-center" style={{ letterSpacing: '0.2em', fontWeight: 300 }}>
          <a
            href="/"
            className="text-xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.textInverse }}
          >
            {config.variant}
          </a>
        </div>

        <div className="flex items-center gap-6 w-20 justify-end">
          {showSearch && (
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className="transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: theme.colors.textInverse }}
              aria-label="Search"
            >
              <Search size={14} strokeWidth={2} />
            </button>
          )}

          <a
            href="/cart"
            className="relative transition-opacity duration-300 hover:opacity-70 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.textInverse }}
            aria-label="Cart"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
          </a>

          <a
            href="/account"
            className="relative transition-opacity duration-300 hover:opacity-70 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: theme.colors.textInverse }}
            aria-label="Account"
          >
            <User size={16} strokeWidth={1.5} />
          </a>
        </div>
      </div>

      {/* Search overlay */}
      {showSearch && searchOpen && (
        <div
          className="absolute top-full left-0 w-full z-50 border-t"
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          }}
        >
          <form onSubmit={handleSearchSubmit} className="px-8 py-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH..."
              className="w-full bg-transparent outline-none uppercase text-[11px] tracking-[0.15em] font-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                color: theme.colors.textInverse,
                fontFamily: theme.typography.fontFamily.heading,
              }}
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex items-center justify-center border-t"
        style={{ borderColor: theme.colors.border }}
      >
        {navigation.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>
    </header>
  )
}
