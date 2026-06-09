import * as React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import type { MessageItemData, MessageConfig, MessageOptions, MessageContextValue, MessageType } from "./types"
import { MessageItem } from "./MessageItem"
import { MessageContext } from "./message-context"

const DEFAULT_MESSAGE_CONFIG: MessageOptions = { top: 24, duration: 3 }

function normalizeArgs(
  contentOrConfig: React.ReactNode | MessageConfig,
  duration?: number,
  onClose?: () => void
): MessageConfig {
  if (
    contentOrConfig === null ||
    contentOrConfig === undefined ||
    typeof contentOrConfig === "string" ||
    typeof contentOrConfig === "number" ||
    typeof contentOrConfig === "boolean" ||
    React.isValidElement(contentOrConfig)
  ) {
    return { content: contentOrConfig as React.ReactNode, duration, onClose }
  }
  return contentOrConfig as MessageConfig
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MessageItemData[]>([])
  const itemsRef = useRef<MessageItemData[]>([])
  const configRef = useRef<MessageOptions>(DEFAULT_MESSAGE_CONFIG)
  const [globalConfig, setGlobalConfig] = useState<MessageOptions>(DEFAULT_MESSAGE_CONFIG)
  const idCounter = useRef(0)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const setMessageItems = useCallback((nextItems: MessageItemData[]) => {
    itemsRef.current = nextItems
    setItems(nextItems)
  }, [])

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const config = useCallback((options: MessageOptions) => {
    configRef.current = { ...configRef.current, ...options }
    setGlobalConfig({ ...configRef.current })
  }, [])

  const removeItem = useCallback((id: string, callOnClose = true) => {
    const removedItem = itemsRef.current.find((item) => item.id === id)
    clearTimer(id)
    setMessageItems(itemsRef.current.filter((item) => item.id !== id))
    if (callOnClose) {
      removedItem?.onClose?.()
    }
  }, [clearTimer, setMessageItems])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const add = useCallback(
    (configInput: MessageConfig & { type?: MessageType }): (() => void) => {
      const cfg = normalizeArgs(configInput)
      const id = cfg.key || `msg-${++idCounter.current}`
      const duration = cfg.duration !== undefined ? cfg.duration : configRef.current.duration

      const newItem: MessageItemData = {
        ...cfg,
        id,
        type: configInput.type || "info",
        duration,
        createdAt: Date.now(),
      }

      const removedItems: MessageItemData[] = []

      {
        const prev = itemsRef.current
        const existing = prev.find((item) => item.id === id)
        let next = existing
          ? prev.map((item) => (item.id === id ? newItem : item))
          : [...prev, newItem]

        if (existing) {
          removedItems.push(existing)
          clearTimer(existing.id)
        }

        const maxCount = configRef.current.maxCount
        if (maxCount && next.length > maxCount) {
          const overflow = next.slice(0, next.length - maxCount)
          overflow.forEach((item) => {
            removedItems.push(item)
            clearTimer(item.id)
          })
          next = next.slice(next.length - maxCount)
        }
        setMessageItems(next)
      }

      removedItems.forEach((item) => item.onClose?.())

      const destroy = () => removeItem(id)

      if (duration !== 0) {
        const timer = setTimeout(() => {
          removeItem(id)
        }, (duration || 3) * 1000)
        timersRef.current.set(id, timer)
      }

      return destroy
    },
    [clearTimer, removeItem, setMessageItems]
  )

  const destroy = useCallback(
    (key: string) => {
      removeItem(key)
    },
    [removeItem]
  )

  const destroyAll = useCallback(() => {
    const removedItems = itemsRef.current
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current.clear()
    setMessageItems([])
    removedItems.forEach((item) => item.onClose?.())
  }, [setMessageItems])

  const open = useCallback(
    (config: MessageConfig & { type?: MessageType }) => add(config),
    [add]
  )

  const success = useCallback(
    (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => {
      const cfg = normalizeArgs(content, duration, onClose)
      return add({ ...cfg, type: "success" })
    },
    [add]
  )

  const info = useCallback(
    (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => {
      const cfg = normalizeArgs(content, duration, onClose)
      return add({ ...cfg, type: "info" })
    },
    [add]
  )

  const warning = useCallback(
    (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => {
      const cfg = normalizeArgs(content, duration, onClose)
      return add({ ...cfg, type: "warning" })
    },
    [add]
  )

  const error = useCallback(
    (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => {
      const cfg = normalizeArgs(content, duration, onClose)
      return add({ ...cfg, type: "error" })
    },
    [add]
  )

  const loading = useCallback(
    (content: React.ReactNode | MessageConfig, duration?: number, onClose?: () => void) => {
      const cfg = normalizeArgs(content, duration, onClose)
      return add({ ...cfg, type: "loading" })
    },
    [add]
  )

  const value: MessageContextValue = {
    open,
    success,
    info,
    warning,
    error,
    loading,
    destroy,
    destroyAll,
    config,
  }

  return (
    <MessageContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ top: globalConfig.top }}
        >
          {items.map((item) => (
            <MessageItem key={item.id} data={item} />
          ))}
        </div>,
        document.body
      )}
    </MessageContext.Provider>
  )
}
