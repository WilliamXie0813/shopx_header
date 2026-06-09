import * as React from "react"
import type { ModalContextValue } from "./types"

export const ModalContext = React.createContext<ModalContextValue | null>(null)

export function useModalContext() {
  const ctx = React.useContext(ModalContext)
  if (!ctx) {
    throw new Error("useModalContext must be used within ModalProvider")
  }
  return ctx
}
