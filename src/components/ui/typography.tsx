import * as React from 'react'
import { cn } from '@/lib/utils'
import { Copy, Check, Pencil, X } from 'lucide-react'
import { Input } from './input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

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

// ============================== Copyable ==============================

function CopyableAction({
  text,
  config,
}: {
  text: string
  config?: CopyConfig | boolean
}) {
  const [copied, setCopied] = React.useState(false)
  const resolvedConfig = typeof config === 'boolean' ? {} : config || {}

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resolvedConfig.text || text)
      setCopied(true)
      resolvedConfig.onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="inline-flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label={copied ? '已复制' : '复制'}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              resolvedConfig.icon || <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {copied
            ? (resolvedConfig.tooltips?.[1] ?? '已复制')
            : (resolvedConfig.tooltips?.[0] ?? '复制')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================== Editable ==============================

function EditableAction({
  value,
  config,
  onSave,
}: {
  value: string
  config?: EditConfig | boolean
  onSave: (value: string) => void
}) {
  const resolvedConfig = typeof config === 'boolean' ? {} : config || {}
  const isControlled = resolvedConfig.editing !== undefined
  const [isEditing, setIsEditing] = React.useState(resolvedConfig.editing || false)
  const [editValue, setEditValue] = React.useState(value)

  React.useEffect(() => {
    if (isControlled) {
      setIsEditing(resolvedConfig.editing || false)
    }
  }, [isControlled, resolvedConfig.editing])

  const handleStart = () => {
    setEditValue(value)
    setIsEditing(true)
    resolvedConfig.onStart?.()
  }

  const handleConfirm = () => {
    onSave(editValue)
    if (!isControlled) setIsEditing(false)
    resolvedConfig.onEnd?.()
  }

  const handleCancel = () => {
    setEditValue(value)
    if (!isControlled) setIsEditing(false)
    resolvedConfig.onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') handleCancel()
  }

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value)
            resolvedConfig.onChange?.(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          maxLength={resolvedConfig.maxLength}
          className="h-6 min-w-[120px] inline-flex w-auto py-0 px-1.5 text-sm"
          autoFocus
        />
        <button
          onClick={handleConfirm}
          className="inline-flex items-center cursor-pointer"
          aria-label="确认"
        >
          <Check className="h-3.5 w-3.5 text-green-600" />
        </button>
        <button
          onClick={handleCancel}
          className="inline-flex items-center cursor-pointer"
          aria-label="取消"
        >
          <X className="h-3.5 w-3.5 text-red-500" />
        </button>
      </span>
    )
  }

  return (
    <>
      <span>{value}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleStart}
              className="inline-flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="编辑"
            >
              {resolvedConfig.icon || <Pencil className="h-3.5 w-3.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {resolvedConfig.tooltip || '编辑'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}

// ============================== Ellipsis ==============================

function EllipsisWrapper({
  config,
  children,
}: {
  config?: EllipsisConfig | boolean
  children: React.ReactNode
}) {
  const resolvedConfig = typeof config === 'boolean' ? {} : config || {}
  const rows = resolvedConfig.rows || 1
  const [expanded, setExpanded] = React.useState(false)

  if (expanded) {
    return (
      <>
        {children}
        {resolvedConfig.expandable && (
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center ml-1 text-primary cursor-pointer hover:underline"
          >
            {resolvedConfig.symbol || '收起'}
          </button>
        )}
      </>
    )
  }

  return (
    <span className={`inline-flex flex-wrap items-center ${expanded ? '' : `line-clamp-${rows}`}`}>
      <span className={expanded ? '' : `line-clamp-${rows}`}>{children}</span>
      {resolvedConfig.expandable && (
        <button
          onClick={() => {
            setExpanded(true)
            resolvedConfig.onExpand?.()
          }}
          className="inline-flex items-center ml-1 text-primary cursor-pointer hover:underline shrink-0"
        >
          {resolvedConfig.symbol || '展开'}
        </button>
      )}
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
  ({ className, copyable, editable, ellipsis, children, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
      typeof children === 'string' ? children : ''
    )

    React.useEffect(() => {
      if (typeof children === 'string') {
        setDisplayValue(children)
      }
    }, [children])

    const textString = typeof children === 'string' ? children : ''
    const resolvedEllipsis = typeof ellipsis === 'boolean' ? {} : ellipsis || {}
    const rows = resolvedEllipsis.rows || 1

    if (editable) {
      return (
        <span ref={ref} className={cn('group inline-flex items-center', className)}>
          <EditableAction
            value={displayValue}
            config={editable}
            onSave={setDisplayValue}
          />
        </span>
      )
    }

    const content = (
      <BaseTypography {...props} className={cn(ellipsis && !resolvedEllipsis.expandable && `line-clamp-${rows}`, className)}>
        {children}
      </BaseTypography>
    )

    return (
      <span ref={ref} className="group inline-flex items-center">
        {ellipsis ? (
          <EllipsisWrapper config={ellipsis}>{content}</EllipsisWrapper>
        ) : (
          content
        )}
        {copyable && textString && <CopyableAction text={textString} config={copyable} />}
      </span>
    )
  }
)
Text.displayName = 'Text'
