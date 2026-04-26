import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseDropdownReturn {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
  triggerProps: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onClick: (e: React.MouseEvent) => void
    onKeyDown: (e: React.KeyboardEvent) => void
    'aria-expanded': boolean
    'aria-haspopup': boolean
    tabIndex: number
    role: string
  }
  dropdownProps: {
    onMouseEnter: () => void
    onMouseLeave: () => void
  }
}

export function useDropdown(): UseDropdownReturn {
  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    timerRef.current = setTimeout(() => setIsOpen(false), 150)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          toggle()
          break
        case 'Escape':
          e.preventDefault()
          close()
          break
        case 'ArrowDown':
          if (!isOpen) {
            e.preventDefault()
            open()
          }
          break
      }
    },
    [toggle, close, open, isOpen]
  )

  const handleClick = useCallback(() => {
    toggle()
  }, [toggle])

  useEffect(() => {
    if (!isOpen) return
    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleDocumentKeyDown)
    return () => document.removeEventListener('keydown', handleDocumentKeyDown)
  }, [isOpen, close])

  return {
    isOpen,
    toggle,
    open,
    close,
    triggerProps: {
      onMouseEnter: open,
      onMouseLeave: close,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
      tabIndex: 0,
      role: 'button',
    },
    dropdownProps: {
      onMouseEnter: open,
      onMouseLeave: close,
    },
  }
}
