import * as React from "react"
import { createPortal } from "react-dom"
import type {
  NotificationItemData,
  NotificationOptions,
  NotificationPosition,
} from "./types"
import { NotificationItem } from "./NotificationItem"
import { NotificationContext } from "./NotificationContext"

function generateId() {
  return `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const POSITIONS: NotificationPosition[] = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
]

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = React.useState<
    NotificationItemData[]
  >([])

  const add = React.useCallback((options: NotificationOptions) => {
    const id = generateId()
    const notification: NotificationItemData = {
      ...options,
      id,
      createdAt: Date.now(),
      position: options.position ?? "top-right",
      duration: options.duration ?? 4500,
    }
    setNotifications((prev) => [...prev, notification])
    return id
  }, [])

  const remove = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const value = React.useMemo(() => ({ add, remove }), [add, remove])

  const byPosition = React.useMemo(() => {
    const map = new Map<NotificationPosition, NotificationItemData[]>()
    for (const pos of POSITIONS) {
      map.set(
        pos,
        notifications.filter((n) => n.position === pos),
      )
    }
    return map
  }, [notifications])

  const container = (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {POSITIONS.map((pos) => {
        const items = byPosition.get(pos) ?? []
        if (items.length === 0) return null

        const isTop = pos.startsWith("top-")
        const isLeft = pos.endsWith("-left")

        return (
          <div
            key={pos}
            className={`absolute flex flex-col gap-3 ${
              isTop ? "top-4" : "bottom-4"
            } ${isLeft ? "left-4" : "right-4"}`}
          >
            {items.map((item) => (
              <NotificationItem key={item.id} data={item} onRemove={remove} />
            ))}
          </div>
        )
      })}
    </div>
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {createPortal(container, document.body)}
    </NotificationContext.Provider>
  )
}
