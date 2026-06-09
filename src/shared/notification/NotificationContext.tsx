import * as React from "react"
import type { NotificationContextValue } from "./types"

export const NotificationContext =
  React.createContext<NotificationContextValue | null>(null)

export const useNotificationContext = () => {
  const ctx = React.useContext(NotificationContext)
  if (!ctx) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider",
    )
  }
  return ctx
}
