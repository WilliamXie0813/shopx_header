import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ButtonProps } from "./types"

const variantMap: Record<
  Required<ButtonProps>["type"],
  { normal: string; danger: string; ghost: string; ghostDanger: string }
> = {
  primary: {
    normal:
      "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent",
    danger:
      "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent",
    ghost:
      "bg-transparent text-primary border-primary hover:bg-primary/10",
    ghostDanger:
      "bg-transparent text-destructive border-destructive hover:bg-destructive/10",
  },
  default: {
    normal:
      "bg-background text-foreground border-border hover:bg-muted hover:text-foreground",
    danger:
      "bg-background text-destructive border-destructive hover:bg-destructive/10",
    ghost:
      "bg-transparent text-background border-background hover:bg-background/10",
    ghostDanger:
      "bg-transparent text-background border-background hover:bg-background/10",
  },
  dashed: {
    normal:
      "bg-background text-foreground border-border border-dashed hover:border-primary hover:text-primary",
    danger:
      "bg-background text-destructive border-destructive border-dashed hover:bg-destructive/10",
    ghost:
      "bg-transparent text-background border-background border-dashed hover:bg-background/10",
    ghostDanger:
      "bg-transparent text-background border-background border-dashed hover:bg-background/10",
  },
  text: {
    normal:
      "bg-transparent text-foreground border-transparent hover:bg-muted",
    danger:
      "bg-transparent text-destructive border-transparent hover:bg-destructive/10",
    ghost:
      "bg-transparent text-background border-transparent hover:bg-background/10",
    ghostDanger:
      "bg-transparent text-background border-transparent hover:bg-background/10",
  },
  link: {
    normal:
      "bg-transparent text-primary border-transparent underline-offset-4 hover:underline",
    danger:
      "bg-transparent text-destructive border-transparent underline-offset-4 hover:underline",
    ghost:
      "bg-transparent text-background border-transparent underline-offset-4 hover:underline",
    ghostDanger:
      "bg-transparent text-background border-transparent underline-offset-4 hover:underline",
  },
}

const sizeMap: Record<Required<ButtonProps>["size"], string> = {
  large: "h-10 gap-2 px-4 text-base [&_svg]:size-5",
  middle: "h-8 gap-1.5 px-3 text-sm [&_svg]:size-4",
  small: "h-6 gap-1 px-2 text-xs [&_svg]:size-3",
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      type = "default",
      danger = false,
      size = "middle",
      loading = false,
      block = false,
      icon,
      shape = "default",
      disabled = false,
      ghost = false,
      href,
      target,
      htmlType = "button",
      onClick,
      className,
      children,
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const isIconOnly = !!icon && !children

    const variantKey = ghost
      ? danger
        ? "ghostDanger"
        : "ghost"
      : danger
        ? "danger"
        : "normal"

    const classes = cn(
      "inline-flex items-center justify-center rounded-lg border font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variantMap[type][variantKey],
      sizeMap[size],
      shape === "circle" && (isIconOnly ? "rounded-full aspect-square px-0" : "rounded-full"),
      shape === "round" && "rounded-full",
      isIconOnly && !shape && "aspect-square px-0",
      block && "w-full",
      loading && "cursor-default",
      className
    )

    const content = (
      <>
        {loading && (
          <Loader2 className="shrink-0 animate-spin" />
        )}
        {!loading && icon && (
          <span className="inline-flex shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </>
    )

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={isDisabled ? undefined : href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className={classes}
          onClick={(event) => {
            if (isDisabled) {
              event.preventDefault()
              return
            }
            onClick?.(event)
          }}
          aria-disabled={isDisabled}
          tabIndex={isDisabled ? -1 : undefined}
        >
          {content}
        </a>
      )
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={htmlType}
        className={classes}
        disabled={isDisabled}
        onClick={onClick}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = "Button"
