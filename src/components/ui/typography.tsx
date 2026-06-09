import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ level = 1, children, className, style }, ref) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements
    const sizeClasses: Record<number, string> = {
      1: 'text-5xl font-medium tracking-tight',
      2: 'text-2xl font-medium leading-tight tracking-tight',
      3: 'text-xl font-medium',
      4: 'text-lg font-medium',
      5: 'text-base font-medium',
    }
    return (
      <Tag
        ref={ref as React.Ref<HTMLHeadingElement>}
        className={cn(sizeClasses[level], className)}
        style={style}
      >
        {children}
      </Tag>
    )
  }
)
Title.displayName = 'Title'

// ============================== Types ==============================

export interface CopyConfig {
  text?: string
  icon?: React.ReactNode
  tooltips?: [React.ReactNode, React.ReactNode]
  onCopy?: () => void
}

export interface EditConfig {
  editing?: boolean
  icon?: React.ReactNode
  tooltip?: React.ReactNode
  onStart?: () => void
  onChange?: (value: string) => void
  onEnd?: () => void
  onCancel?: () => void
  maxLength?: number
}

export interface EllipsisConfig {
  rows?: number
  expandable?: boolean
  suffix?: string
  symbol?: React.ReactNode
  onExpand?: () => void
  onEllipsis?: () => void
}

interface BaseTypographyProps {
  type?: 'secondary' | 'success' | 'warning' | 'danger' | 'muted'
  mark?: boolean
  code?: boolean
  keyboard?: boolean
  underline?: boolean
  delete?: boolean
  strong?: boolean
  italic?: boolean
  children: React.ReactNode
  className?: string
}

// ============================== BaseTypography ==============================

function BaseTypography({
  type,
  mark,
  code,
  keyboard,
  underline,
  delete: del,
  strong,
  italic,
  children,
  className,
}: BaseTypographyProps) {
  let content: React.ReactNode = children

  if (italic) content = <em>{content}</em>
  if (strong) content = <strong>{content}</strong>
  if (del) content = <del>{content}</del>
  if (underline) content = <u>{content}</u>
  if (keyboard) {
    content = (
      <kbd className="font-mono text-xs border rounded px-1.5 py-0.5 shadow-sm">
        {content}
      </kbd>
    )
  } else if (code) {
    content = (
      <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
        {content}
      </code>
    )
  }
  if (mark) {
    content = (
      <mark className="bg-yellow-200/50 px-1 rounded text-inherit">
        {content}
      </mark>
    )
  }

  return (
    <span
      className={cn(
        type &&
          {
            secondary: 'text-muted-foreground',
            success: 'text-green-600',
            warning: 'text-amber-500',
            danger: 'text-red-500',
            muted: 'text-gray-400',
          }[type],
        className
      )}
    >
      {content}
    </span>
  )
}

// ============================== Text ==============================

export interface TextProps extends BaseTypographyProps {
  copyable?: boolean | CopyConfig
  editable?: boolean | EditConfig
  ellipsis?: boolean | EllipsisConfig
}

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, ...props }, ref) => {
    return (
      <span ref={ref} className="group inline-flex items-center">
        <BaseTypography {...props} className={className} />
      </span>
    )
  }
)
Text.displayName = 'Text'
