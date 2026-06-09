import * as React from "react"
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationItemData, NotificationPhase, NotificationVariant } from "./types"

const variantConfig: Record<
  NotificationVariant,
  { icon: typeof CheckCircle2; colorClass: string; bgClass: string; borderClass: string }
> = {
  success: {
    icon: CheckCircle2,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    borderClass: "border-success/20",
  },
  info: {
    icon: Info,
    colorClass: "text-info",
    bgClass: "bg-info/10",
    borderClass: "border-info/20",
  },
  warning: {
    icon: AlertTriangle,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    borderClass: "border-warning/20",
  },
  error: {
    icon: XCircle,
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/20",
  },
}

interface NotificationItemProps {
  data: NotificationItemData
  onRemove: (id: string) => void
}

export function NotificationItem({ data, onRemove }: NotificationItemProps) {
  const [phase, setPhase] = React.useState<NotificationPhase>("entering")
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = React.useRef(data.duration ?? 4500)
  const startTimeRef = React.useRef(0)
  const mountedRef = React.useRef(true)

  const variant = data.variant ?? "info"
  const config = variantConfig[variant]
  const Icon = config.icon
  const isLeft = data.position?.endsWith("-left")

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startExit = React.useCallback(() => {
    clearTimer()
    setPhase("exiting")
  }, [clearTimer])

  const startTimer = React.useCallback(() => {
    clearTimer()
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      startExit()
    }, remainingRef.current)
  }, [clearTimer, startExit])

  React.useEffect(() => {
    mountedRef.current = true
    const enterTimer = setTimeout(() => setPhase("entered"), 50)
    startTimer()
    return () => {
      mountedRef.current = false
      clearTimeout(enterTimer)
      clearTimer()
    }
  }, [startTimer, clearTimer])

  const handleMouseEnter = React.useCallback(() => {
    if (phase !== "entered") return
    const elapsed = Date.now() - startTimeRef.current
    remainingRef.current = Math.max(0, remainingRef.current - elapsed)
    clearTimer()
  }, [phase, clearTimer])

  const handleMouseLeave = React.useCallback(() => {
    if (phase !== "entered") return
    if (remainingRef.current > 0) {
      startTimer()
    } else {
      startExit()
    }
  }, [phase, startTimer, startExit])

  const handleAnimationEnd = React.useCallback(() => {
    if (phase === "entering") {
      setPhase("entered")
    } else if (phase === "exiting") {
      setPhase("exited")
      if (mountedRef.current) {
        onRemove(data.id)
        data.onClose?.()
      }
    }
  }, [phase, data, onRemove])

  const animationClass = React.useMemo(() => {
    if (phase === "entering" || phase === "entered") {
      return isLeft
        ? "animate-[notification-enter-left_250ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        : "animate-[notification-enter_250ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
    }
    if (phase === "exiting") {
      return isLeft
        ? "animate-[notification-exit-left_200ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        : "animate-[notification-exit_200ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
    }
    return ""
  }, [phase, isLeft])

  return (
    <div
      className={cn(
        "pointer-events-auto w-80 sm:w-96 rounded-xl border bg-card p-4 shadow-lg ring-1 ring-foreground/5",
        config.borderClass,
        animationClass
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onAnimationEnd={handleAnimationEnd}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex shrink-0 items-center justify-center rounded-full p-1",
            config.bgClass
          )}
        >
          <Icon className={cn("size-4", config.colorClass)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          {data.title && (
            <h3 className="text-sm font-medium text-card-foreground">{data.title}</h3>
          )}
          {data.description && (
            <p className={cn("text-sm text-muted-foreground", data.title && "mt-1")}>
              {data.description}
            </p>
          )}
        </div>
        <button
          onClick={startExit}
          className="shrink-0 -mr-1 -mt-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:text-muted-foreground hover:bg-muted"
          aria-label="关闭通知"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
