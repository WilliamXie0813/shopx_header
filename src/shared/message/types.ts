import * as React from "react"

export type MessageType = "success" | "info" | "warning" | "error" | "loading"

export interface MessageConfig {
  content: React.ReactNode
  duration?: number
  icon?: React.ReactNode
  key?: string
  onClose?: () => void
}

export interface MessageItemData extends MessageConfig {
  id: string
  type: MessageType
  createdAt: number
}

export interface MessageOptions {
  top?: number
  duration?: number
  maxCount?: number
}

export interface MessageContextValue {
  open: (config: MessageConfig & { type?: MessageType }) => () => void
  success: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => () => void
  info: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => () => void
  warning: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => () => void
  error: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => () => void
  loading: (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => () => void
  destroy: (key: string) => void
  destroyAll: () => void
  config: (options: MessageOptions) => void
}
