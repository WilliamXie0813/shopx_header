import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { X, Palette, GripHorizontal } from 'lucide-react'
import TokenEditor from './TokenEditor'
import useKeyboardShortcut from './useKeyboardShortcut'
import { useThemeDevTool } from './ThemeDevToolProvider'
import { useTheme } from '../theme/ThemeContext'

function getShortcutHint(): string {
  return navigator.platform.toLowerCase().includes('mac') ? '⌘⇧T' : 'Ctrl+Shift+T'
}

function stringifyTs(obj: unknown, indent = 2): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj)
  }

  if (Array.isArray(obj)) {
    const items = obj.map((item) => stringifyTs(item, indent)).join(', ')
    return `[${items}]`
  }

  const entries = Object.entries(obj as Record<string, unknown>)
  if (entries.length === 0) return '{}'

  const isValidIdentifier = (k: string): boolean => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)

  const spacing = ' '.repeat(indent)
  const inner = entries
    .map(([key, value]) => {
      const formattedKey = isValidIdentifier(key) ? key : JSON.stringify(key)
      return `${spacing}${formattedKey}: ${stringifyTs(value, indent + 2)}`
    })
    .join(',\n')

  return `{\n${inner}\n${' '.repeat(indent - 2)}}`
}

function themeToCode(theme: ReturnType<typeof useTheme>): string {
  return `import type { ThemeTokens } from '../theme/ThemeContext'\n\nexport const defaultTheme: ThemeTokens = ${stringifyTs(theme)}`
}

export default function ThemeDevToolPanel({ initialOpen = false }: { initialOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const theme = useTheme()
  const { setOverride, resetOverrides } = useThemeDevTool()
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Drag state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 })

  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  const close = useCallback(() => setIsOpen(false), [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: dragOffset.x,
      offsetY: dragOffset.y,
    }
    setIsDragging(true)
  }, [dragOffset])

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX
      const dy = e.clientY - dragStartRef.current.mouseY
      setDragOffset({
        x: dragStartRef.current.offsetX + dx,
        y: dragStartRef.current.offsetY + dy,
      })
    }
    const handleMouseUp = () => setIsDragging(false)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  useKeyboardShortcut({ onToggle: toggle, onClose: close })

  useEffect(() => {
    if (!showExportMenu) return
    const handleClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showExportMenu])

  const shortcutHint = useMemo(() => getShortcutHint(), [])

  const handleExport = useCallback(
    async (format: 'json' | 'typescript') => {
      const text =
        format === 'json'
          ? JSON.stringify(theme, null, 2)
          : themeToCode(theme)
      await navigator.clipboard.writeText(text)
      setShowExportMenu(false)
    },
    [theme]
  )

  if (!isOpen) {
    return (
      <button
        onClick={toggle}
        aria-label="Open Theme DevTool"
        className="fixed z-[100] p-3 rounded-full shadow-lg transition-all hover:scale-105"
        style={{
          right: '16px',
          bottom: '16px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
        }}
      >
        <Palette size={20} />
      </button>
    )
  }

  return (
    <div
      className="fixed z-[100] rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        right: '16px',
        bottom: '16px',
        width: '480px',
        maxHeight: '90vh',
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-grab active:cursor-grabbing select-none"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-white/40" />
          <span className="text-xs font-semibold text-white">Theme DevTool</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
            {shortcutHint}
          </span>
        </div>
        <button
          onClick={close}
          aria-label="Close"
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X size={14} className="text-white/60" />
        </button>
      </div>

      {/* Token Editor */}
      <div className="flex-1 overflow-hidden text-white">
        <TokenEditor
          theme={theme}
          onChange={setOverride}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex-none px-4 py-3 border-t flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button
          onClick={resetOverrides}
          className="flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Reset
        </button>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu((v) => !v)}
            className="text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
            }}
          >
            Export Theme
          </button>
          {showExportMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 rounded-lg overflow-hidden shadow-xl"
              style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <button
                onClick={() => handleExport('json')}
                className="block w-full text-left text-xs px-4 py-2 hover:bg-white/10 transition-colors text-white"
              >
                Copy as JSON
              </button>
              <button
                onClick={() => handleExport('typescript')}
                className="block w-full text-left text-xs px-4 py-2 hover:bg-white/10 transition-colors text-white"
              >
                Copy as TypeScript
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
