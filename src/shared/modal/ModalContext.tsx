import * as React from "react"
import type { ModalItemData, ModalConfig, ModalVariant } from "./types"
import { ModalItem } from "./ModalItem"
import { ModalContext } from "./modal-context"

function generateId() {
  return `modal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = React.useState<ModalItemData[]>([])

  const open = React.useCallback((config: ModalConfig) => {
    const id = generateId()
    setModals((prev) => [...prev, { ...config, id }])
    return id
  }, [])

  const close = React.useCallback((id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const closeAll = React.useCallback(() => {
    setModals([])
  }, [])

  const confirm = React.useCallback(
    (config: Omit<ModalConfig, "footer">) => {
      return open({ ...config, footer: undefined })
    },
    [open]
  )

  const info = React.useCallback(
    (config: Omit<ModalConfig, "footer" | "cancelText">) => {
      return open({ ...config, variant: "info" as ModalVariant, footer: undefined })
    },
    [open]
  )

  const success = React.useCallback(
    (config: Omit<ModalConfig, "footer" | "cancelText">) => {
      return open({ ...config, variant: "success" as ModalVariant, footer: undefined })
    },
    [open]
  )

  const warning = React.useCallback(
    (config: Omit<ModalConfig, "footer" | "cancelText">) => {
      return open({ ...config, variant: "warning" as ModalVariant, footer: undefined })
    },
    [open]
  )

  const error = React.useCallback(
    (config: Omit<ModalConfig, "footer" | "cancelText">) => {
      return open({ ...config, variant: "error" as ModalVariant, footer: undefined })
    },
    [open]
  )

  const value = React.useMemo(
    () => ({ open, confirm, info, success, warning, error, close, closeAll }),
    [open, confirm, info, success, warning, error, close, closeAll]
  )

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.map((modal) => (
        <ModalItem key={modal.id} data={modal} onClose={close} />
      ))}
    </ModalContext.Provider>
  )
}
