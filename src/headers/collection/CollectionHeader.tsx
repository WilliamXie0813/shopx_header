import { useState, useCallback } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getCollectionTheme } from './collection.theme'
import { useDropdown } from '../hooks/useDropdown'

function Dropdown({ items, bgColor, textColor }: { items: MenuItem[]; bgColor: string; textColor: string }) {
  return (
    <div
      className="absolute left-1/2 top-full -translate-x-1/2 p-8 min-w-[480px]"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <ul className="grid grid-cols-2 gap-x-8 gap-y-4 list-none m-0 p-0">
        {items.map((child, idx) => (
          <li key={idx}>
            {child.children && child.children.length > 0 ? (
              <div>
                <span
                  className="block text-xs uppercase tracking-widest mb-2"
                  style={{ color: textColor, opacity: 0.5 }}
                >
                  {child.label}
                </span>
                <ul className="list-none m-0 p-0 space-y-1">
                  {child.children.map((sub, sidx) => (
                    <li key={sidx}>
                      <a
                        href={sub.href || '#'}
                        className="block text-sm no-underline py-1 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c2d12]"
                        style={{ color: textColor }}
                      >
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <a
                href={child.href || '#'}
                className="block text-sm no-underline py-1 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c2d12]"
                style={{ color: textColor }}
              >
                {child.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function NavItem({ item, theme }: { item: MenuItem; theme: ReturnType<typeof getCollectionTheme> }) {
  const { isOpen, triggerProps, dropdownProps } = useDropdown()
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="relative" {...dropdownProps}>
      <a
        href={item.href || '#'}
        {...(hasChildren ? triggerProps : {})}
        className="block px-4 py-2 text-sm no-underline relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c2d12]"
        style={{ color: theme.headerText, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
      >
        {item.label}
        <span
          className="absolute bottom-0 left-4 right-4 h-[1px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
          style={{ backgroundColor: theme.accent }}
        />
      </a>
      {isOpen && hasChildren && (
        <Dropdown items={item.children!} bgColor={theme.dropdownBg} textColor={theme.headerText} />
      )}
    </li>
  )
}

export default function CollectionHeader({
  logo,
  menuItems,
  headerBg = '#ffffff',
  headerText = '#1a1a1a',
  onSearch,
  cartCount,
  userAvatar,
}: HeaderProps) {
  const theme = getCollectionTheme(headerBg, headerText)
  const [searchOpen, setSearchOpen] = useState(false)
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

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev)
  }, [])

  return (
    <header
      className="grid grid-cols-3 items-center px-8 py-6"
      style={{
        backgroundColor: theme.headerBg,
        color: theme.headerText,
        fontFamily: theme.fontFamily,
        letterSpacing: theme.letterSpacing,
      }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <a
          href="/"
          className="no-underline text-2xl italic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c2d12]"
          style={{ color: theme.headerText, fontFamily: theme.fontFamily }}
        >
          {logo}
        </a>
      </div>

      {/* Nav */}
      <nav className="flex justify-center">
        <ul className="flex list-none m-0 p-0">
          {menuItems.map((item, idx) => (
            <NavItem key={idx} item={item} theme={theme} />
          ))}
        </ul>
      </nav>

      {/* Actions */}
      <div className="flex items-center justify-end gap-6">
        {onSearch && (
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Search"
              className="bg-transparent border-none cursor-pointer p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c2d12]"
              style={{ color: theme.headerText }}
              onClick={toggleSearch}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            {searchOpen && (
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search"
                className="ml-2 px-3 py-1 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c2d12]"
                style={{
                  width: '160px',
                  backgroundColor: theme.accentLight,
                  color: theme.headerText,
                  fontFamily: "'Instrument Sans', system-ui, sans-serif",
                }}
              />
            )}
          </div>
        )}

        <a
          href="/cart"
          className="text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c2d12]"
          style={{ color: theme.headerText, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
          aria-label={cartCount ? `Bag, ${cartCount} items` : 'Bag'}
        >
          Bag{cartCount && cartCount > 0 ? ` (${cartCount})` : ''}
        </a>

        <a
          href="/account"
          className="text-sm no-underline flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c2d12]"
          style={{ color: theme.headerText, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
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
