import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ModalItemData, ModalVariant } from "./types"

const variantConfig: Record<
  ModalVariant,
  {
    icon: typeof CheckCircle2
    colorClass: string
    okVariant: "default" | "destructive" | "outline" | "secondary" | "ghost"
  }
> = {
  confirm: {
    icon: Info,
    colorClass: "text-primary",
    okVariant: "default",
  },
  info: {
    icon: Info,
    colorClass: "text-info",
    okVariant: "default",
  },
  success: {
    icon: CheckCircle2,
    colorClass: "text-success",
    okVariant: "default",
  },
  warning: {
    icon: AlertTriangle,
    colorClass: "text-warning",
    okVariant: "default",
  },
  error: {
    icon: XCircle,
    colorClass: "text-destructive",
    okVariant: "destructive",
  },
}

interface ModalItemProps {
  data: ModalItemData
  onClose: (id: string) => void
}

export function ModalItem({ data, onClose }: ModalItemProps) {
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(true)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const closingRef = React.useRef(false)

  const variant = data.variant ?? "confirm"
  const config = variantConfig[variant]
  const Icon = config.icon

  const isConfirm = variant === "confirm"
  const showCancel = isConfirm || data.cancelText !== undefined

  const doClose = React.useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    setOpen(false)
    closeTimerRef.current = setTimeout(() => onClose(data.id), 150)
  }, [data.id, onClose])

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const handleOk = React.useCallback(async () => {
    if (data.okButtonProps?.disabled) return

    const result = data.onOk?.()
    if (result && typeof result.then === "function") {
      setLoading(true)
      try {
        await result
        doClose()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Modal onOk failed", error)
        }
        // 异步操作失败，保持弹窗打开以便用户重试
      } finally {
        setLoading(false)
      }
    } else if (result !== false) {
      doClose()
    }
  }, [data, doClose])

  const handleCancel = React.useCallback(() => {
    if (closingRef.current) return
    data.onCancel?.()
    doClose()
  }, [data, doClose])

  const handleOpenChange = React.useCallback(
    (val: boolean) => {
      if (!val && !closingRef.current) handleCancel()
    },
    [handleCancel]
  )

  const handleInteractOutside = React.useCallback(
    (event: Event) => {
      event.preventDefault()
      if (data.maskClosable !== false) {
        handleCancel()
      }
    },
    [data.maskClosable, handleCancel]
  )

  const handleEscapeKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault()
      if (data.keyboard !== false) {
        handleCancel()
      }
    },
    [data.keyboard, handleCancel]
  )

  const widthStyle = React.useMemo(() => {
    if (typeof data.width === "number") return { maxWidth: `${data.width}px` }
    if (typeof data.width === "string") return { maxWidth: data.width }
    return undefined
  }, [data.width])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 isolate z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl bg-popover p-6 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            data.centered
              ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              : "top-[10%] left-1/2 -translate-x-1/2",
            !data.width && "sm:max-w-sm",
            typeof data.width === "number" && "sm:max-w-none"
          )}
          style={widthStyle}
          onInteractOutside={handleInteractOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <div className="flex items-start gap-3">
            {variant !== "confirm" && (
              <div className={cn("mt-0.5 shrink-0", config.colorClass)}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {data.title && (
                <DialogPrimitive.Title className="text-base font-semibold leading-none tracking-tight">
                  {data.title}
                </DialogPrimitive.Title>
              )}
              {data.content && (
                <div className={cn("text-sm text-muted-foreground", data.title && "mt-3")}>
                  {data.content}
                </div>
              )}
            </div>
            {data.closable !== false && (
              <button
                type="button"
                className="shrink-0 -mr-2 -mt-2 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:text-muted-foreground hover:bg-muted"
                onClick={handleCancel}
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {data.footer !== null && (
            <div className="flex flex-row-reverse gap-2 mt-2">
              {data.footer ? (
                data.footer
              ) : (
                <>
                  <Button
                    variant={config.okVariant}
                    size="sm"
                    onClick={handleOk}
                    disabled={data.okButtonProps?.disabled || loading}
                  >
                    {loading ? "处理中..." : data.okText || "确定"}
                  </Button>
                  {showCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={data.cancelButtonProps?.disabled}
                    >
                      {data.cancelText || "取消"}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
