import { useState, useCallback } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getFashionTheme } from './fashion.theme'
import { useDropdown } from '../hooks/useDropdown'

function Dropdown({ items, bgColor, textColor }: { items: MenuItem[]; bgColor: string; textColor: string }) {
  return (
    <div
      className="absolute left-1/2 top-full -translate-x-1/2 p-6 min-w-[400px] rounded-xl"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        boxShadow: '0 20px 50px -10px rgba(255,0,128,0.2)',
      }}
    >
      <ul className="grid grid-cols-2 gap-x-6 gap-y-3 list-none m-0 p-0">
        {items.map((child, idx) => (
          <li key={idx}>
            <a
              href={child.href || '#'}
              className="block text-sm no-underline py-1 hover:opacity-80"
              style={{ color: textColor }}
            >
              {child.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NavItem({ item, theme }: { item: MenuItem; theme: ReturnType<typeof getFashionTheme> }) {
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="relative" {...dropdownProps}>
      <a
        href={item.href || '#'}
        {...(hasChildren ? triggerProps : {})}
        className="block uppercase font-bold text-xs tracking-tight no-underline relative group px-4 py-3"
        style={{ color: theme.headerText }}
      >
        {item.label}
        <span
          className="absolute bottom-1 left-4 right-4 h-[2px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
          style={{ backgroundColor: theme.accent }}
        />
      </a>
      {isOpen && hasChildren && (
        <Dropdown items={item.children!} bgColor={theme.dropdownBg} textColor={theme.headerText} />
      )}
    </li>
  )
}

export default function FashionHeader({
  logo,
  menuItems,
  headerBg = '#0a0a0a',
  headerText = '#ffffff',
  onSearch,
  cartCount,
  userAvatar,
}: HeaderProps) {
  const theme = getFashionTheme(headerBg, headerText)
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
    <header
      className="grid grid-cols-3 items-center px-8 py-5"
      style={{
        backgroundColor: theme.headerBg,
        color: theme.headerText,
      }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <a
          href="/"
          className="no-underline text-2xl font-bold tracking-tighter uppercase"
          style={{ color: theme.headerText }}
        >
          {logo}
        </a>
      </div>

      {/* Nav */}
      <nav className="flex justify-center">
        <ul className="flex list-none m-0 p-0" style={{ gap: '32px' }}>
          {menuItems.map((item, idx) => (
            <NavItem key={idx} item={item} theme={theme} />
          ))}
        </ul>
      </nav>

      {/* Actions */}
      <div className="flex items-center justify-end gap-5">
        {onSearch && (
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="SEARCH"
            className="px-3 py-1.5 text-xs outline-none uppercase tracking-tight"
            style={{
              width: '160px',
              backgroundColor: `${theme.headerText}14`,
              color: theme.headerText,
            }}
          />
        )}

        <a
          href="/cart"
          className="text-sm no-underline relative flex items-center"
          style={{ color: theme.headerText }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 6h15l-1.5 9h-12z" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
            <path d="M6 6L5 3H2" />
          </svg>
          {cartCount && cartCount > 0 ? (
            <span
              className="absolute -top-1.5 -right-2.5 flex items-center justify-center text-[10px] font-bold w-4 h-4 rounded-full"
              style={{ backgroundColor: theme.accent, color: '#ffffff' }}
            >
              {cartCount}
            </span>
          ) : null}
        </a>

        <a
          href="/account"
          className="text-sm no-underline flex items-center"
          style={{ color: theme.headerText }}
        >
          {userAvatar ? (
            <img src={userAvatar} alt="Account" className="w-7 h-7 object-cover rounded-full" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </a>
      </div>
    </header>
  )
}
