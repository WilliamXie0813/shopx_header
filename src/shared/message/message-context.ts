import { createContext, useContext } from "react"
import type { MessageContextValue } from "./types"

export const MessageContext = createContext<MessageContextValue | null>(null)

export function useMessageContext() {
  const ctx = useContext(MessageContext)
  if (!ctx) throw new Error("useMessageContext must be used within MessageProvider")
  return ctx
}
