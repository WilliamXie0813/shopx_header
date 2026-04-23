import { useState, useCallback } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getImpulseTheme } from './impulse.theme'
import { useDropdown } from '../hooks/useDropdown'

function Dropdown({ items, bgColor, textColor }: { items: MenuItem[]; bgColor: string; textColor: string }) {
  return (
    <ul
      className="absolute left-0 top-full min-w-[180px] py-2 list-none m-0 p-0 shadow-lg z-50"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {items.map((child, idx) => (
        <li key={idx}>
          <a
            href={child.href || '#'}
            className="block px-4 py-2 text-[10px] uppercase tracking-[0.06em] no-underline hover:opacity-80 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e53935]"
            style={{ color: textColor, fontWeight: 500, fontFamily: "'Oswald', 'Bebas Neue', 'Arial Narrow', 'Impact', sans-serif" }}
          >
            {child.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function NavItem({ item, theme }: { item: MenuItem; theme: ReturnType<typeof getImpulseTheme> }) {
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="relative" {...dropdownProps}>
      <a
        href={item.href || '#' }
        {...(hasChildren ? triggerProps : {})}
        className="block px-3 py-2 text-[10px] uppercase tracking-[0.08em] no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e53935]"
        style={{ color: theme.headerText, fontWeight: 600 }}
      >
        {item.label}
      </a>
      {isOpen && hasChildren && (
        <Dropdown items={item.children!} bgColor={theme.dropdownBg} textColor={theme.headerText} />
      )}
    </li>
  )
}

export default function ImpulseHeader({
  logo,
  menuItems,
  headerBg = '#ffffff',
  headerText = '#1f2937',
  onSearch,
  cartCount,
  userAvatar,
}: HeaderProps) {
  const theme = getImpulseTheme(headerBg, headerText)
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
      if (onSearch) {
        onSearch(e.target.value)
      }
    },
    [onSearch]
  )

  return (
    <div>
      {/* Promo Banner */}
      <div
        className="w-full flex items-center justify-center py-2 text-xs font-black uppercase tracking-[0.15em] text-white"
        style={{ backgroundColor: theme.accent, height: '36px', fontFamily: "'Oswald', 'Bebas Neue', 'Arial Narrow', 'Impact', sans-serif" }}
        data-testid="promo-banner"
      >
        ⚡ LIMITED TIME: 50% OFF EVERYTHING — ENDS IN 02:14:33
      </div>

      {/* Main Header */}
      <header
        className="grid grid-cols-3 items-center px-6 py-2"
        style={{
          backgroundColor: theme.headerBg,
          color: theme.headerText,
          fontFamily: "'Oswald', 'Bebas Neue', 'Arial Narrow', 'Impact', sans-serif",
        }}
        data-testid="main-header"
      >
        {/* Logo */}
        <div className="flex items-center">
          <a
            href="/"
            className="no-underline text-2xl uppercase tracking-tighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e53935]"
            style={{ color: theme.headerText, fontWeight: 700 }}
          >
            {logo}
          </a>
        </div>

        {/* Nav */}
        <nav className="flex justify-center">
          <ul className="flex list-none m-0 p-0 gap-0">
            {menuItems.map((item, idx) => (
              <NavItem key={idx} item={item} theme={theme} />
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          {onSearch && (
            <div className="relative flex items-center">
              <svg
                className="absolute left-2 w-3 h-3 pointer-events-none"
                style={{ color: theme.textMuted }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="SEARCH"
                className="pl-6 pr-2 py-1 text-[10px] uppercase tracking-wide outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e53935]"
                style={{
                  width: '120px',
                  backgroundColor: `${headerText}0f`,
                  color: theme.headerText,
                  fontFamily: "'Oswald', 'Bebas Neue', 'Arial Narrow', 'Impact', sans-serif",
                }}
              />
            </div>
          )}

          {/* Cart — filled pill button */}
          <a
            href="/cart"
            className="relative flex items-center gap-1 rounded-full px-3 py-1 text-[10px] uppercase tracking-wide no-underline transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e53935]"
            style={{ backgroundColor: theme.accent, color: '#ffffff', fontWeight: 600 }}
            aria-label={cartCount ? `Cart, ${cartCount} items` : 'Cart'}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M6 6L5 3H2" />
            </svg>
            {typeof cartCount === 'number' && cartCount > 0 && (
              <span className="text-[10px]">{cartCount}</span>
            )}
          </a>

          {/* Account — filled accent icon button */}
          <a
            href="/account"
            className="flex items-center justify-center rounded-full w-7 h-7 no-underline transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e53935]"
            style={{
              backgroundColor: theme.accent,
              color: '#ffffff',
            }}
            aria-label="Account"
          >
            {userAvatar ? (
              <img src={userAvatar} alt="Account" className="w-full h-full object-cover rounded-full" />
            ) : (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </a>
        </div>
      </header>
    </div>
  )
}
