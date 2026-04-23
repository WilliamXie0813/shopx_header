import { useState, useCallback } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getLuxeTheme } from './luxe-vault.theme'
import { useDropdown } from '../hooks/useDropdown'

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function LuxeVaultHeader({
  logo,
  menuItems,
  headerBg,
  headerText,
  onSearch,
  cartCount,
}: HeaderProps) {
  const theme = getLuxeTheme(headerBg, headerText)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (onSearch && searchQuery.trim()) {
        onSearch(searchQuery.trim())
      }
      setSearchOpen(false)
      setSearchQuery('')
    },
    [onSearch, searchQuery]
  )

  const hasCart = typeof cartCount === 'number' && cartCount > 0

  return (
    <header
      className="relative w-full"
      style={{
        backgroundColor: theme.headerBg,
        color: theme.headerText,
        fontFamily: theme.fontFamily,
        letterSpacing: theme.letterSpacing,
        fontWeight: theme.fontWeight,
      }}
      data-testid="luxe-header"
    >
      {/* Top bar: Logo centered, actions right */}
      <div className="flex items-center justify-between px-8 py-5">
        {/* Left spacer for balance */}
        <div className="w-20" />

        {/* Centered Logo */}
        <div
          className="text-center"
          style={{
            letterSpacing: '0.2em',
            fontWeight: 300,
          }}
          data-testid="luxe-logo"
        >
          {logo}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-6 w-20 justify-end">
          {/* Search */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="transition-opacity duration-300 hover:opacity-70"
            aria-label="Search"
            data-testid="luxe-search-btn"
          >
            <SearchIcon />
          </button>

          {/* Cart */}
          <button
            type="button"
            className="relative transition-opacity duration-300 hover:opacity-70"
            aria-label="Cart"
            data-testid="luxe-cart-btn"
          >
            <CartIcon />
            {hasCart && (
              <span
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: theme.accent }}
                data-testid="luxe-cart-dot"
              />
            )}
          </button>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="absolute top-full left-0 w-full z-50 border-t"
          style={{
            backgroundColor: theme.headerBg,
            borderColor: theme.border,
          }}
        >
          <form onSubmit={handleSearchSubmit} className="px-8 py-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH..."
              className="w-full bg-transparent outline-none uppercase text-[11px] tracking-[0.15em] font-light"
              style={{
                color: theme.headerText,
                fontFamily: theme.fontFamily,
              }}
              autoFocus
              data-testid="luxe-search-input"
            />
          </form>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex items-center justify-center border-t"
        style={{ borderColor: theme.border }}
      >
        {menuItems.map((item: MenuItem) => {
          const { isOpen, triggerProps, dropdownProps } = useDropdown()
          const hasChildren = item.children && item.children.length > 0

          return (
            <div
              key={item.label}
              className="relative"
              {...dropdownProps}
            >
              <a
                href={item.href || '#'}
                {...(hasChildren ? triggerProps : {})}
                className="relative flex items-center gap-1 uppercase text-[11px] tracking-[0.15em] font-light px-6 py-4 transition-colors duration-300"
                style={{ color: theme.headerText }}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault()
                  }
                }}
              >
                {item.label}
                {hasChildren && (
                  <ChevronDown
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                )}
                {/* Gold underline */}
                <span
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 h-px w-8 origin-center transition-transform duration-500"
                  style={{
                    backgroundColor: theme.accent,
                    transform: 'translateX(-50%) scaleX(0)',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget
                    target.style.transform = 'translateX(-50%) scaleX(1)'
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget
                    target.style.transform = 'translateX(-50%) scaleX(0)'
                  }}
                />
              </a>

              {/* Full-width dropdown curtain */}
              {hasChildren && isOpen && (
                <div
                  className="fixed left-0 w-full z-40 border-t"
                  style={{
                    backgroundColor: theme.dropdownBg,
                    borderColor: theme.accent,
                    top: 'auto',
                  }}
                  data-testid="luxe-dropdown"
                >
                  <div className="max-w-6xl mx-auto px-8 py-12">
                    <div className="grid grid-cols-3 gap-12">
                      {item.children!.map((child) => (
                        <a
                          key={child.label}
                          href={child.href || '#'}
                          className="group block"
                        >
                          <span
                            className="block uppercase text-[11px] tracking-[0.15em] font-light mb-2 transition-colors duration-300 group-hover:text-[#c9a96e]"
                            style={{ color: theme.headerText }}
                          >
                            {child.label}
                          </span>
                          {child.description && (
                            <span
                              className="block text-[10px] tracking-[0.1em] font-light"
                              style={{ color: theme.textMuted }}
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
        })}
      </nav>
    </header>
  )
}
