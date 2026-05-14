import { useState, useEffect, useRef } from 'react'
import { useJsonConfig } from './context'
import { getValueByPath } from './path'
import { Check, X } from 'lucide-react'

export default function InlineEditor() {
  const { config, editingTarget, updateConfig, cancelEditing } = useJsonConfig()
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingTarget) {
      const current = getValueByPath(config, editingTarget.path)
      setValue(String(current ?? ''))
      inputRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTarget])

  if (!editingTarget) return null

  const { path, type, rect } = editingTarget

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(rect.left, window.innerWidth - 260),
    top: rect.bottom + 6 > window.innerHeight - 40 ? rect.top - 40 : rect.bottom + 6,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 6px',
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.15)',
  }

  const handleSave = () => {
    updateConfig(path, value)
    cancelEditing()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') cancelEditing()
  }

  if (type === 'color') {
    return (
      <div style={style}>
        <input
          type="color"
          defaultValue={String(getValueByPath(config, path) ?? '')}
          onChange={e => {
            updateConfig(path, e.target.value)
            cancelEditing()
          }}
          style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        />
      </div>
    )
  }

  return (
    <div style={style}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          padding: '4px 8px',
          fontSize: '13px',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '4px',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          outline: 'none',
          minWidth: '120px',
        }}
      />
      <button
        onClick={handleSave}
        aria-label="Save"
        style={{
          padding: '2px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: '#22c55e',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
        }}
      >
        <Check size={14} />
      </button>
      <button
        onClick={cancelEditing}
        aria-label="Cancel"
        style={{
          padding: '2px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}
