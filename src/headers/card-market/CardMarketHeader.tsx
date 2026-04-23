import { useState } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getCardMarketTheme } from './card-market.theme'
import { useDropdown } from '../hooks/useDropdown'

function NavItem({ item, theme }: { item: MenuItem; theme: ReturnType<typeof getCardMarketTheme> }) {
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="relative" {...dropdownProps}>
      <button
        {...(hasChildren ? triggerProps : {})}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.hoverBg
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
        }}
      >
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span>{item.label}</span>
      </button>

      {hasChildren && isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-lg border-2 py-1 shadow-xl"
          style={{
            backgroundColor: theme.dropdownBg,
            borderColor: theme.accent,
          }}
        >
          {item.children!.map((child) => (
            <a
              key={child.label}
              href={child.href || '#'}
              className="flex items-center gap-2 px-4 py-2 text-sm transition-colors no-underline"
              style={{ color: theme.headerText }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = theme.hoverBg
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
              }}
            >
              {child.icon && <span className="flex-shrink-0">{child.icon}</span>}
              <div>
                <div className="font-medium">{child.label}</div>
                {child.description && (
                  <div className="text-xs" style={{ color: theme.textMuted }}>
                    {child.description}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CardMarketHeader({
  logo,
  menuItems,
  headerBg = '#1a1a2e',
  headerText = '#e2e8f0',
  onSearch,
  cartCount = 0,
  userAvatar,
}: HeaderProps) {
  const theme = getCardMarketTheme(headerBg, headerText)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch?.(value)
  }

  return (
    <header
      className="relative w-full"
      style={{
        backgroundColor: theme.headerBg,
        color: theme.headerText,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <div className="flex-shrink-0 font-bold tracking-wider" style={{ color: theme.accent }}>
          {logo}
        </div>

        {/* Game Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {menuItems.map((item) => (
            <NavItem key={item.label} item={item} theme={theme} />
          ))}
        </nav>

        {/* Search - Center, large, expandable */}
        <div className="mx-4 flex flex-1 justify-center">
          <div
            className="relative flex items-center rounded-lg transition-all duration-300"
            style={{
              maxWidth: searchFocused ? '28rem' : '24rem',
              width: '100%',
              backgroundColor: `${headerText}1a`,
            }}
          >
            <svg
              className="pointer-events-none absolute left-3 h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: theme.textMuted }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search cards, sets, sellers..."
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full rounded-lg bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-current"
              style={{
                color: theme.headerText,
              }}
            />
          </div>
        </div>

        {/* Right side: Account + Cart */}
        <div className="flex items-center gap-3">
          {/* Account */}
          <a
            href="/account"
            className="relative flex items-center justify-center overflow-hidden rounded-full no-underline"
            style={{
              width: '36px',
              height: '36px',
              border: userAvatar ? `2px solid ${theme.accent}` : 'none',
            }}
            aria-label="Account"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Account"
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </a>

          {/* Cart */}
          <a
            href="/cart"
            className="relative flex items-center justify-center rounded-md p-2 transition-colors no-underline"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = theme.hoverBg
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
            }}
            aria-label={cartCount ? `Cart, ${cartCount} items` : 'Cart'}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-bold"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentLight,
                }}
              >
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>
    </header>
  )
}
