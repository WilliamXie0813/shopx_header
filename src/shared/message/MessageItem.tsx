import * as React from "react"
import { CheckCircle2, Info, AlertTriangle, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MessageItemData } from "./types"

const iconMap = {
  success: <CheckCircle2 className="size-4 text-success shrink-0" />,
  info: <Info className="size-4 text-info shrink-0" />,
  warning: <AlertTriangle className="size-4 text-warning shrink-0" />,
  error: <XCircle className="size-4 text-destructive shrink-0" />,
  loading: <Loader2 className="size-4 shrink-0 animate-spin text-primary" />,
}

export function MessageItem({ data }: { data: MessageItemData }) {
  const [entered, setEntered] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg bg-background px-4 py-2.5 text-sm text-foreground shadow-lg transition-all duration-300",
        entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      {data.icon || iconMap[data.type]}
      <span className="whitespace-nowrap">{data.content}</span>
    </div>
  )
}
