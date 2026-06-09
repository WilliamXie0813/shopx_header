import { useContext } from 'react'
import { JsonConfigContext, useEditablePrefix } from './context'
import type { EditingTarget } from './context'
import { getValueByPath } from './path'

interface BindOptions {
  type?: 'text' | 'color' | 'image' | 'select'
  label?: string
}

interface BindProps {
  'data-editable-path'?: string
  onClick: (e: React.MouseEvent) => void
  className?: string
  title?: string
}

function noop(): BindProps {
  return { onClick: () => {} }
}

/**
 * Runtime function injected by the Vite plugin.
 * Automatically prepends the ConfigScope prefix so paths
 * are relative to the full JSON config root.
 */
export function __editable(path: string, options?: BindOptions): BindProps {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ctx = useContext(JsonConfigContext)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const prefix = useEditablePrefix()
  const fullPath = prefix ? `${prefix}.${path}` : path
  const isEditing = ctx?.mode === 'edit'

  if (!isEditing) return noop()

  const value = getValueByPath(ctx.config, fullPath)

  return {
    'data-editable-path': fullPath,
    className: 'shopx-editable',
    title: options?.label ?? `${fullPath} — ${String(value ?? '')}`,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      ctx!.startEditing({
        path: fullPath,
        type: options?.type ?? 'text',
        rect,
      } satisfies EditingTarget)
    },
  }
}

export function useEditable() {
  const ctx = useContext(JsonConfigContext)
  return {
    bind: (path: string, options?: BindOptions): BindProps => {
      if (!ctx || ctx.mode !== 'edit') return noop()
      return __editable(path, options)
    },
    isEditing: ctx?.mode === 'edit',
  }
}
