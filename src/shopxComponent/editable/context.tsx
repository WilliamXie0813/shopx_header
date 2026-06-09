/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { setValueByPath } from './path'

export interface EditingTarget {
  path: string
  type: 'text' | 'color' | 'image' | 'select'
  rect: DOMRect
}

interface JsonConfigContextValue {
  config: Record<string, unknown>
  updateConfig: (path: string, value: unknown) => void
  mode: 'preview' | 'edit'
  setMode: (m: 'preview' | 'edit') => void
  editingTarget: EditingTarget | null
  startEditing: (target: EditingTarget) => void
  cancelEditing: () => void
}

export const JsonConfigContext = createContext<JsonConfigContextValue | null>(null)

export function useJsonConfig() {
  const ctx = useContext(JsonConfigContext)
  if (!ctx) throw new Error('useJsonConfig must be used within JsonConfigProvider')
  return ctx
}

// ── Path prefix for scoped components ──────────────────────────────

const EditablePrefixContext = createContext<string>('')

export function useEditablePrefix() {
  return useContext(EditablePrefixContext)
}

export function ConfigScope({
  prefix,
  children,
}: {
  prefix: string
  children: ReactNode
}) {
  const parent = useEditablePrefix()
  const full = parent ? `${parent}.${prefix}` : prefix
  return (
    <EditablePrefixContext.Provider value={full}>
      {children}
    </EditablePrefixContext.Provider>
  )
}

function resolveDefaultMode(
  defaultMode?: 'preview' | 'edit',
): 'preview' | 'edit' {
  if (defaultMode) return defaultMode
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/preview')) {
    return 'edit'
  }
  return 'preview'
}

export function JsonConfigProvider({
  initialConfig,
  defaultMode,
  children,
}: {
  initialConfig: Record<string, unknown>
  defaultMode?: 'preview' | 'edit'
  children: ReactNode
}) {
  const [config, setConfig] = useState(initialConfig)
  const [mode, setMode] = useState<'preview' | 'edit'>(() => resolveDefaultMode(defaultMode))
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null)

  const updateConfig = useCallback((path: string, value: unknown) => {
    setConfig(prev => setValueByPath(prev, path, value))
  }, [])

  const startEditing = useCallback((target: EditingTarget) => {
    setEditingTarget(target)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingTarget(null)
  }, [])

  return (
    <JsonConfigContext.Provider
      value={{ config, updateConfig, mode, setMode, editingTarget, startEditing, cancelEditing }}
    >
      {children}
    </JsonConfigContext.Provider>
  )
}
