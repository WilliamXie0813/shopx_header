import * as React from "react"

export type ModalVariant = "confirm" | "info" | "success" | "warning" | "error"

export interface ModalConfig {
  title?: React.ReactNode
  content?: React.ReactNode
  width?: string | number
  centered?: boolean
  okText?: string
  cancelText?: string
  footer?: React.ReactNode | null
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  variant?: ModalVariant
  onOk?: () => void | Promise<void> | false
  onCancel?: () => void
  okButtonProps?: { loading?: boolean; disabled?: boolean }
  cancelButtonProps?: { disabled?: boolean }
}

export interface ModalItemData extends ModalConfig {
  id: string
  variant?: ModalVariant
}

export interface ModalContextValue {
  open: (config: ModalConfig) => string
  confirm: (config: Omit<ModalConfig, "footer">) => string
  info: (config: Omit<ModalConfig, "footer" | "cancelText">) => string
  success: (config: Omit<ModalConfig, "footer" | "cancelText">) => string
  warning: (config: Omit<ModalConfig, "footer" | "cancelText">) => string
  error: (config: Omit<ModalConfig, "footer" | "cancelText">) => string
  close: (id: string) => void
  closeAll: () => void
}
