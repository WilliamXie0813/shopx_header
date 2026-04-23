import { useState, useCallback } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getEssentialTheme } from './essential.theme'
import { useDropdown } from '../hooks/useDropdown'

function Dropdown({ items, bgColor, textColor }: { items: MenuItem[]; bgColor: string; textColor: string }) {
  return (
    <ul
      className="absolute left-0 top-full min-w-[160px] py-2 list-none m-0 p-0"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {items.map((child, idx) => (
        <li key={idx}>
          <a
            href={child.href || '#'}
            className="block px-4 py-2 text-sm no-underline hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
            style={{ color: textColor }}
          >
            {child.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function NavItem({ item, theme }: { item: MenuItem; theme: ReturnType<typeof getEssentialTheme> }) {
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="relative" {...dropdownProps}>
      <a
        href={item.href || '#'}
        {...(hasChildren ? triggerProps : {})}
        className="block px-3 py-2 text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
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

export default function EssentialHeader({
  logo,
  menuItems,
  headerBg = '#ffffff',
  headerText = '#1f2937',
  onSearch,
  cartCount,
  userAvatar,
}: HeaderProps) {
  const theme = getEssentialTheme(headerBg, headerText)
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
      className="grid grid-cols-3 items-center px-6 py-4"
      style={{
        backgroundColor: theme.headerBg,
        color: theme.headerText,
        fontFamily: '-apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <a href="/" className="no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500" style={{ color: theme.headerText }}>
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
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search"
            className="px-3 py-1 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
            style={{
              width: '200px',
              backgroundColor: theme.accentLight,
              color: theme.headerText,
            }}
          />
        )}

        <a
          href="/cart"
          className="text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
          style={{ color: theme.headerText }}
          aria-label={cartCount ? `Cart, ${cartCount} items` : 'Cart'}
        >
          Cart{cartCount && cartCount > 0 ? ` (${cartCount})` : ''}
        </a>

        <a
          href="/account"
          className="text-sm no-underline flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
          style={{ color: theme.headerText }}
          aria-label="Account"
        >
          {userAvatar ? (
            <img src={userAvatar} alt="Account" className="w-6 h-6 object-cover" />
          ) : (
            'Account'
          )}
        </a>
      </div>
    </header>
  )
}
