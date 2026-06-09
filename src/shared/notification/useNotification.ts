import { useCallback } from "react"
import { useNotificationContext } from "./NotificationContext"
import type { NotificationOptions, NotificationVariant } from "./types"

export function useNotification() {
  const { add } = useNotificationContext()

  const notify = useCallback(
    (options: NotificationOptions) => add(options),
    [add]
  )

  const success = useCallback(
    (options: Omit<NotificationOptions, "variant">) =>
      add({ ...options, variant: "success" as NotificationVariant }),
    [add]
  )

  const info = useCallback(
    (options: Omit<NotificationOptions, "variant">) =>
      add({ ...options, variant: "info" as NotificationVariant }),
    [add]
  )

  const warning = useCallback(
    (options: Omit<NotificationOptions, "variant">) =>
      add({ ...options, variant: "warning" as NotificationVariant }),
    [add]
  )

  const error = useCallback(
    (options: Omit<NotificationOptions, "variant">) =>
      add({ ...options, variant: "error" as NotificationVariant }),
    [add]
  )

  return { notify, success, info, warning, error }
}
