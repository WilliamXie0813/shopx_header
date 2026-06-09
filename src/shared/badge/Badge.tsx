import * as React from "react"
import { cn } from "@/lib/utils"
import type { BadgeProps, BadgeStatus } from "./types"

const statusColorMap: Record<BadgeStatus, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  default: "bg-muted-foreground",
  processing: "bg-info",
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      count,
      color,
      dot = false,
      status,
      text,
      offset,
      overflowCount = 99,
      showZero = false,
      size = "default",
      title,
      className,
      children,
    },
    ref
  ) => {
    const hasChild = !!children

    const isNumber = typeof count === "number"

    const isZero = isNumber && count === 0

    const shouldHide = isZero && !showZero

    const displayCount = React.useMemo(() => {
      if (!isNumber) return count
      if (shouldHide) return null
      if (count > overflowCount) return `${overflowCount}+`
      return count
    }, [count, isNumber, shouldHide, overflowCount])

    const isDot = dot || (!!status && !count)

    const isStatus = !!status

    // 自定义颜色类（支持 Tailwind 的 bg-* 或内联样式）
    const customColorClass = color?.startsWith("bg-") ? color : undefined
    const customColorStyle = color && !customColorClass ? { backgroundColor: color } : undefined

    const badgeClasses = cn(
      "inline-flex items-center justify-center font-medium whitespace-nowrap leading-none",
      isDot
        ? cn(
            "rounded-full p-[3px]",
            size === "small" && "p-[2px]"
          )
        : cn(
            "rounded-full px-[5px] text-[11px] min-w-[16px] h-[16px]",
            size === "small" && "px-[3px] text-[9px] min-w-[12px] h-[12px]",
            size === "default" && "min-w-[16px] h-[16px]",
            displayCount == null && !isDot && "hidden"
          ),
      "text-white",
      status ? statusColorMap[status] || "bg-muted-foreground" : "bg-destructive",
      customColorClass,
      className
    )

    const badgeStyle: React.CSSProperties = {
      ...customColorStyle,
      ...(offset && hasChild
        ? {
            top: offset[1],
            right: -offset[0],
            transform: "translate(50%, -50%)",
          }
        : {}),
    }

    const badgeNode = (
      <sup
        className={cn(
          badgeClasses,
          hasChild && "absolute z-10",
          hasChild && !offset && "-top-[5px] -right-[5px]",
          isStatus && hasChild && "-top-[3px] -right-[3px]",
          isStatus && "relative -top-0.5 align-middle",
          !hasChild && !isStatus && "relative top-[-1px] align-middle"
        )}
        style={badgeStyle}
        title={title}
      >
        {isDot ? null : displayCount}
      </sup>
    )

    // status 模式（带文字）
    if (isStatus) {
      if (text) {
        return (
          <span ref={ref} className="inline-flex items-center gap-1.5">
            {badgeNode}
            <span className="text-sm text-foreground">{text}</span>
          </span>
        )
      }
      return <span ref={ref}>{badgeNode}</span>
    }

    // 无子元素
    if (!hasChild) {
      if (shouldHide && !dot) return null
      return <span ref={ref}>{badgeNode}</span>
    }

    // 包裹子元素
    return (
      <span ref={ref} className="relative inline-block">
        {children}
        {shouldHide && !dot ? null : badgeNode}
      </span>
    )
  }
)

Badge.displayName = "Badge"
