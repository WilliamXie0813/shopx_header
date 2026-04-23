import { useState, useCallback } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getImpulseTheme } from './impulse.theme'
import { useDropdown } from '../hooks/useDropdown'

function Dropdown({ items, bgColor, textColor }: { items: MenuItem[]; bgColor: string; textColor: string }) {
  return (
    <ul
      className="absolute left-0 top-full min-w-[160px] py-2 list-none m-0 p-0 shadow-lg z-50"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {items.map((child, idx) => (
        <li key={idx}>
          <a
            href={child.href || '#'}
            className="block px-4 py-2 text-sm no-underline hover:opacity-80 transition-opacity duration-150"
            style={{ color: textColor }}
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
        href={item.href || '#'}
        {...(hasChildren ? triggerProps : {})}
        className="block px-3 py-2 text-sm font-semibold no-underline transition-colors duration-150"
        style={{ color: theme.headerText }}
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
        className="w-full flex items-center justify-center py-2 text-xs font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: theme.accent, height: '36px' }}
        data-testid="promo-banner"
      >
        ⚡ LIMITED TIME: 50% OFF EVERYTHING — ENDS IN 02:14:33
      </div>

      {/* Main Header */}
      <header
        className="grid grid-cols-3 items-center px-6 py-4"
        style={{
          backgroundColor: theme.headerBg,
          color: theme.headerText,
          fontFamily: '-apple-system, Segoe UI, Roboto, sans-serif',
        }}
        data-testid="main-header"
      >
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="no-underline" style={{ color: theme.headerText }}>
            {logo}
          </a>
        </div>

        {/* Nav */}
        <nav className="flex justify-center">
          <ul className="flex list-none m-0 p-0 gap-1">
            {menuItems.map((item, idx) => (
              <NavItem key={idx} item={item} theme={theme} />
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          {onSearch && (
            <div className="relative flex items-center">
              <svg
                className="absolute left-2 w-4 h-4 pointer-events-none"
                style={{ color: theme.textMuted }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search"
                className="pl-8 pr-3 py-1.5 text-sm outline-none border transition-colors duration-150"
                style={{
                  width: '280px',
                  borderColor: theme.border,
                  color: theme.headerText,
                  backgroundColor: theme.headerBg,
                }}
              />
            </div>
          )}

          <a
            href="/cart"
            className="relative text-sm no-underline flex items-center"
            style={{ color: theme.headerText }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M6 6L5 3H2" />
            </svg>
            {typeof cartCount === 'number' && cartCount > 0 && (
              <span
                className="absolute -top-2 -right-3 text-xs font-bold text-white rounded-full flex items-center justify-center px-1.5 py-0.5 min-w-[20px]"
                style={{ backgroundColor: theme.accent }}
                data-testid="cart-badge"
              >
                {cartCount}
              </span>
            )}
          </a>

          <a
            href="/account"
            className="text-sm no-underline flex items-center"
            style={{ color: theme.headerText }}
          >
            {userAvatar ? (
              <img src={userAvatar} alt="Account" className="w-6 h-6 object-cover" />
            ) : (
              'Account'
            )}
          </a>
        </div>
      </header>
    </div>
  )
}
