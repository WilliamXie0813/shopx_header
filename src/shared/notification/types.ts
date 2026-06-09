export type NotificationVariant = 'success' | 'info' | 'warning' | 'error'

export type NotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

export interface NotificationOptions {
  title?: string
  description?: string
  variant?: NotificationVariant
  duration?: number
  position?: NotificationPosition
  onClose?: () => void
}

export interface NotificationItemData extends NotificationOptions {
  id: string
  createdAt: number
}

export type NotificationPhase = 'entering' | 'entered' | 'exiting' | 'exited'

export interface NotificationContextValue {
  add: (options: NotificationOptions) => string
  remove: (id: string) => void
}
