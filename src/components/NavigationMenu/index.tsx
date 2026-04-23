import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react'
import type { MenuItem, NavigationMenuProps } from './types'
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Desktop — SubMenu                                                  */
/* ------------------------------------------------------------------ */

interface DesktopSubMenuProps {
  items: MenuItem[]
  isOpen: boolean
  activeHref?: string
  align: 'left' | 'right'
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

function DesktopSubMenu({
  items,
  isOpen,
  activeHref,
  align,
  onMouseEnter,
  onMouseLeave,
}: DesktopSubMenuProps) {
  const hasNestedChildren = items.some(
    (item) => item.children && item.children.length > 0
  )

  return (
    <div
      className={`
        absolute top-full pt-2 z-50
        ${align === 'right' ? 'right-0' : 'left-0'}
        transition-all duration-200 ease-out
        ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`
          bg-white rounded-xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] border border-gray-100/80
          overflow-hidden
          ${hasNestedChildren ? 'min-w-[min(520px,90vw)] max-w-[90vw] p-5' : 'min-w-[200px] py-2.5'}
        `}
      >
        {hasNestedChildren ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-5">
            {items.map((group, i) => (
              <div key={`${group.label}-${i}`} className="flex flex-col gap-2">
                {group.href ? (
                  <a
                    href={group.href}
                    className="text-sm font-semibold text-gray-900 tracking-tight hover:text-rose-600 transition-colors"
                  >
                    {group.label}
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-gray-900 tracking-tight">
                    {group.label}
                  </span>
                )}
                {group.children && group.children.length > 0 && (
                  <ul className="flex flex-col gap-0.5">
                    {group.children.map((child, j) => (
                      <li key={`${child.label}-${j}`}>
                        <a
                          href={child.href ?? '#'}
                          className={`
                            block text-[13px] leading-relaxed py-1.5 px-2 -mx-2 rounded-md
                            transition-colors duration-150
                            ${activeHref === child.href
                              ? 'text-rose-600 bg-rose-50 font-medium'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }
                          `}
                          onClick={(e) => {
                            if (!child.href) e.preventDefault()
                          }}
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {items.map((item, i) => (
              <li key={`${item.label}-${i}`}>
                <a
                  href={item.href ?? '#'}
                  className={`
                    flex items-center justify-between gap-3 px-4 py-2 text-[13px]
                    transition-colors duration-150
                    ${activeHref === item.href
                      ? 'text-rose-600 bg-rose-50 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  onClick={(e) => {
                    if (!item.href) e.preventDefault()
                  }}
                >
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Desktop — MenuItem                                                 */
/* ------------------------------------------------------------------ */

function DesktopMenuItem({
  item,
  activeHref,
}: {
  item: MenuItem
  activeHref?: string
}) {
  const [open, setOpen] = useState(false)
  const [align, setAlign] = useState<'left' | 'right'>('left')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemRef = useRef<HTMLLIElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const hasChildren = item.children && item.children.length > 0
  const isActive = activeHref === item.href

  const cancelClose = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 150)
  }, [])

  const handleEnter = useCallback(() => {
    cancelClose()
    if (hasChildren) setOpen(true)
  }, [hasChildren, cancelClose])

  const handleLeave = useCallback(
    (e?: React.FocusEvent | React.MouseEvent) => {
      /* 如果是 blur，检查焦点是否仍在当前 li 内 */
      if (e && 'relatedTarget' in e) {
        const related = e.relatedTarget as Node | null
        if (related && itemRef.current?.contains(related)) return
      }
      scheduleClose()
    },
    [scheduleClose]
  )

  /* 边界检测 */
  useLayoutEffect(() => {
    if (!open || !itemRef.current || !submenuRef.current) return

    const check = () => {
      const itemRect = itemRef.current!.getBoundingClientRect()
      const submenuWidth = submenuRef.current!.offsetWidth
      const viewport = document.documentElement.clientWidth
      if (itemRect.left + submenuWidth + 16 > viewport) {
        setAlign('right')
      } else {
        setAlign('left')
      }
    }

    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [open])

  /* 清理定时器 */
  useEffect(() => () => cancelClose(), [cancelClose])

  return (
    <li
      ref={itemRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={() => handleLeave()}
    >
      {hasChildren ? (
        <button
          type="button"
          className={`
            relative flex items-center gap-1.5 px-3 py-3 text-[13px] font-semibold tracking-tight
            transition-colors duration-150 bg-transparent border-0 cursor-pointer
            ${isActive ? 'text-rose-600' : 'text-gray-800 hover:text-gray-900'}
          `}
          aria-haspopup="true"
          aria-expanded={open}
          onFocus={handleEnter}
          onBlur={handleLeave}
        >
          <span>{item.label}</span>
          <ChevronDown
            size={10}
            className={`
              text-gray-400 transition-transform duration-200
              ${open ? 'rotate-180' : ''}
            `}
          />
          <span
            className={`
              absolute bottom-0 left-3 right-3 h-[2px] rounded-full
              transition-all duration-200 ease-out
              ${isActive || open ? 'bg-rose-500 opacity-100 scale-x-100' : 'bg-rose-500 opacity-0 scale-x-0'}
            `}
            aria-hidden="true"
          />
        </button>
      ) : (
        <a
          href={item.href ?? '#'}
          className={`
            relative flex items-center gap-1.5 px-3 py-3 text-[13px] font-semibold tracking-tight
            transition-colors duration-150
            ${isActive ? 'text-rose-600' : 'text-gray-800 hover:text-gray-900'}
          `}
          {...(item.href ? {} : { onClick: (e: React.MouseEvent) => e.preventDefault() })}
        >
          <span>{item.label}</span>
          <span
            className={`
              absolute bottom-0 left-3 right-3 h-[2px] rounded-full
              transition-all duration-200 ease-out
              ${isActive ? 'bg-rose-500 opacity-100 scale-x-100' : 'bg-rose-500 opacity-0 scale-x-0'}
            `}
            aria-hidden="true"
          />
        </a>
      )}

      {hasChildren && (
        <div ref={submenuRef}>
          <DesktopSubMenu
            items={item.children!}
            isOpen={open}
            activeHref={activeHref}
            align={align}
            onMouseEnter={handleEnter}
            onMouseLeave={() => handleLeave()}
          />
        </div>
      )}
    </li>
  )
}

/* ------------------------------------------------------------------ */
/*  Mobile — SubMenu                                                   */
/* ------------------------------------------------------------------ */

function MobileSubMenu({
  items,
  depth = 0,
  activeHref,
}: {
  items: MenuItem[]
  depth?: number
  activeHref?: string
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ul className={`flex flex-col ${depth > 0 ? 'pl-4 mt-1 gap-0.5' : 'gap-1'}`}>
      {items.map((item, i) => {
        const key = `${item.label}-${i}`
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expanded[key]
        const isActive = activeHref === item.href

        return (
          <li key={key}>
            <div className="flex items-center">
              <a
                href={item.href ?? '#'}
                className={`
                  flex-1 py-2.5 px-3 text-[13px] rounded-lg transition-colors duration-150
                  ${isActive
                    ? 'text-rose-600 bg-rose-50 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                {...(item.href ? {} : { onClick: (e: React.MouseEvent) => e.preventDefault() })}
              >
                {item.label}
              </a>
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className={`
                    p-2 text-gray-400 transition-transform duration-200
                    ${isExpanded ? 'rotate-90' : ''}
                  `}
                  aria-expanded={isExpanded}
                  aria-controls={`mobile-submenu-${key}`}
                  aria-label={isExpanded ? `收起${item.label}` : `展开${item.label}`}
                >
                  <ChevronRight size={10} />
                </button>
              )}
            </div>
            {hasChildren && isExpanded && (
              <div id={`mobile-submenu-${key}`}>
                <MobileSubMenu
                  items={item.children!}
                  depth={depth + 1}
                  activeHref={activeHref}
                />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function NavigationMenu({
  items,
  className = '',
  activeHref,
}: NavigationMenuProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  /* Escape 关闭抽屉 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  /* 焦点管理 */
  useEffect(() => {
    if (mobileOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement
      // 聚焦到抽屉内第一个可聚焦元素
      const first = drawerRef.current?.querySelector<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      )
      first?.focus()
    } else {
      prevFocusRef.current?.focus()
    }
  }, [mobileOpen])

  /* body scroll lock */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      {/* Desktop */}
      <nav className={`hidden md:block ${className}`}>
        <ul className="flex items-center gap-0.5">
          {items.map((item, i) => (
            <DesktopMenuItem
              key={`${item.label}-${i}`}
              item={item}
              activeHref={activeHref}
            />
          ))}
        </ul>
      </nav>

      {/* Mobile Toggle */}
      <button
        ref={triggerRef}
        type="button"
        className="md:hidden p-2 -mr-2 text-gray-700 hover:text-gray-900 transition-colors"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={mobileOpen}
        aria-haspopup="dialog"
        aria-controls="mobile-drawer"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Drawer */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden
          transition-all duration-300 ease-out
          ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className={`
            absolute inset-0 bg-black/20 backdrop-blur-sm
            transition-opacity duration-300
            ${mobileOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          id="mobile-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="导航菜单"
          className={`
            absolute right-0 top-0 bottom-0 w-[min(320px,85vw)] bg-white
            shadow-2xl border-l border-gray-100
            flex flex-col
            transition-transform duration-300 ease-out
            ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              菜单
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="关闭菜单"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 px-3">
            <MobileSubMenu items={items} activeHref={activeHref} />
          </div>
        </div>
      </div>
    </>
  )
}

export type { MenuItem, NavigationMenuProps }
