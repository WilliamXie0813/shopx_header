# Typography 组件实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 shadcn/ui 风格实现 antd Typography 组件，包含 Title、Text、Paragraph、Link 四个子组件，支持可编辑、可复制、省略号截断等交互功能。

**Architecture:** 单文件聚合组件（`typography.tsx`），内部抽取 `BaseTypography` 共享组件处理样式和交互逻辑，Title 独立实现。使用 cva + Tailwind 定义变体，lucide-react 提供图标，Radix Tooltip 提供提示。

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Input, Tooltip), lucide-react, vitest, @testing-library/react

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/typography.tsx` | 创建 | 主组件文件，包含 Title、BaseTypography、Text、Paragraph、Link 及交互子组件 |
| `src/__tests__/typography.test.tsx` | 创建 | 组件测试文件 |

---

### Task 1: Title 组件

**Files:**
- Create: `src/components/ui/typography.tsx`
- Create: `src/__tests__/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/typography.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Title } from '@/components/ui/typography'

describe('Title', () => {
  it('renders h1 by default', () => {
    render(<Title>Hello World</Title>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Hello World')
  })

  it('renders h1-h5 based on level prop', () => {
    for (let level = 1; level <= 5; level++) {
      const { rerender } = render(<Title level={level as 1 | 2 | 3 | 4 | 5}>Title</Title>)
      expect(screen.getByRole('heading', { level })).toBeInTheDocument()
      rerender(<></>)
    }
  })

  it('applies correct size classes for level 1', () => {
    render(<Title level={1}>Title</Title>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-5xl', 'font-medium')
  })

  it('merges custom className', () => {
    render(<Title className="custom-class">Title</Title>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('custom-class')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: FAIL — `Title` is not exported from `@/components/ui/typography`

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/ui/typography.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================== Title ==============================

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/typography.tsx src/__tests__/typography.test.tsx
git commit -m "feat: add Title component for Typography"
```

---

### Task 2: BaseTypography 基础渲染 + Text 组件

**Files:**
- Modify: `src/components/ui/typography.tsx`
- Modify: `src/__tests__/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

在现有测试文件中追加：

```tsx
import { Text } from '@/components/ui/typography'

describe('Text', () => {
  it('renders children', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies danger type class', () => {
    render(<Text type="danger">Danger</Text>)
    expect(screen.getByText('Danger')).toHaveClass('text-red-500')
  })

  it('applies success type class', () => {
    render(<Text type="success">Success</Text>)
    expect(screen.getByText('Success')).toHaveClass('text-green-600')
  })

  it('applies warning type class', () => {
    render(<Text type="warning">Warning</Text>)
    expect(screen.getByText('Warning')).toHaveClass('text-amber-500')
  })

  it('applies secondary type class', () => {
    render(<Text type="secondary">Secondary</Text>)
    expect(screen.getByText('Secondary')).toHaveClass('text-muted-foreground')
  })

  it('applies muted type class', () => {
    render(<Text type="muted">Muted</Text>)
    expect(screen.getByText('Muted')).toHaveClass('text-gray-400')
  })

  it('renders mark with highlight background', () => {
    render(<Text mark>Marked</Text>)
    const mark = screen.getByText('Marked')
    expect(mark.tagName).toBe('MARK')
    expect(mark).toHaveClass('bg-yellow-200/50', 'px-1', 'rounded')
  })

  it('renders code with mono font', () => {
    render(<Text code>Code</Text>)
    const code = screen.getByText('Code')
    expect(code.tagName).toBe('CODE')
    expect(code).toHaveClass('font-mono', 'text-sm', 'bg-muted', 'rounded')
  })

  it('renders keyboard style', () => {
    render(<Text keyboard>Kbd</Text>)
    const kbd = screen.getByText('Kbd')
    expect(kbd.tagName).toBe('KBD')
    expect(kbd).toHaveClass('font-mono', 'text-xs', 'border', 'rounded', 'shadow-sm')
  })

  it('renders underline', () => {
    render(<Text underline>Underlined</Text>)
    expect(screen.getByText('Underlined').tagName).toBe('U')
  })

  it('renders delete', () => {
    render(<Text delete>Deleted</Text>)
    expect(screen.getByText('Deleted').tagName).toBe('DEL')
  })

  it('renders strong', () => {
    render(<Text strong>Bold</Text>)
    expect(screen.getByText('Bold').tagName).toBe('STRONG')
  })

  it('renders italic', () => {
    render(<Text italic>Italic</Text>)
    expect(screen.getByText('Italic').tagName).toBe('EM')
  })

  it('merges custom className', () => {
    render(<Text className="custom-class">Text</Text>)
    expect(screen.getByText('Text')).toHaveClass('custom-class')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: FAIL — `Text` is not defined

- [ ] **Step 3: Write minimal implementation**

在 `typography.tsx` 中 `Title` 之后追加：

```tsx
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
      <span ref={ref} className={cn('group inline-flex items-center', className)}>
        <BaseTypography {...props} />
      </span>
    )
  }
)
Text.displayName = 'Text'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: PASS (Title + Text 基础测试全部通过)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/typography.tsx src/__tests__/typography.test.tsx
git commit -m "feat: add Text component with base styling"
```

---

### Task 3: Copyable 功能

**Files:**
- Modify: `src/components/ui/typography.tsx`
- Modify: `src/__tests__/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

在测试文件顶部添加 mock：

```tsx
// 在文件顶部、import 之后添加
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
})
```

追加测试：

```tsx
describe('Copyable', () => {
  beforeEach(() => {
    mockWriteText.mockClear()
  })

  it('copies text when copy button clicked', async () => {
    const user = userEvent.setup()
    render(<Text copyable>Hello</Text>)

    const copyButton = screen.getByLabelText('复制')
    await user.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('Hello')
  })

  it('copies custom text from config', async () => {
    const user = userEvent.setup()
    render(<Text copyable={{ text: 'Custom' }}>Hello</Text>)

    const copyButton = screen.getByLabelText('复制')
    await user.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('Custom')
  })

  it('calls onCopy callback after copy', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(<Text copyable={{ onCopy }}>Hello</Text>)

    const copyButton = screen.getByLabelText('复制')
    await user.click(copyButton)

    await vi.waitFor(() => expect(onCopy).toHaveBeenCalled())
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: FAIL — Copyable 按钮未渲染，测试找不到 `getByLabelText('复制')`

- [ ] **Step 3: Write minimal implementation**

在 `typography.tsx` 中，在 `BaseTypography` 之前插入交互子组件：

```tsx
// ============================== Icons ==============================

import { Copy, Check, Pencil, X } from 'lucide-react'
import { Input } from './input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

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
```

修改 `Text` 组件以集成 Copyable：

```tsx
export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, copyable, children, ...props }, ref) => {
    const textString = React.useMemo(() => {
      return typeof children === 'string' ? children : ''
    }, [children])

    return (
      <span ref={ref} className={cn('group inline-flex items-center', className)}>
        <BaseTypography {...props}>{children}</BaseTypography>
        {copyable && textString && <CopyableAction text={textString} config={copyable} />}
      </span>
    )
  }
)
Text.displayName = 'Text'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/typography.tsx src/__tests__/typography.test.tsx
git commit -m "feat: add copyable functionality to Text"
```

---

### Task 4: Editable 功能

**Files:**
- Modify: `src/components/ui/typography.tsx`
- Modify: `src/__tests__/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

追加测试：

```tsx
import userEvent from '@testing-library/user-event'

describe('Editable', () => {
  it('enters edit mode when edit button clicked', async () => {
    const user = userEvent.setup()
    render(<Text editable>Hello</Text>)

    const editButton = screen.getByLabelText('编辑')
    await user.click(editButton)

    expect(screen.getByRole('textbox')).toHaveValue('Hello')
  })

  it('saves on Enter key', async () => {
    const user = userEvent.setup()
    const onEnd = vi.fn()
    render(<Text editable={{ onEnd }}>Hello</Text>)

    await user.click(screen.getByLabelText('编辑'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'World')
    await user.keyboard('{Enter}')

    expect(screen.getByText('World')).toBeInTheDocument()
    expect(onEnd).toHaveBeenCalled()
  })

  it('cancels on Escape key', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<Text editable={{ onCancel }}>Hello</Text>)

    await user.click(screen.getByLabelText('编辑'))
    const input = screen.getByRole('textbox')
    await user.type(input, 'World')
    await user.keyboard('{Escape}')

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Text editable={{ onChange }}>Hello</Text>)

    await user.click(screen.getByLabelText('编辑'))
    await user.type(screen.getByRole('textbox'), 'W')

    expect(onChange).toHaveBeenLastCalledWith('HelloW')
  })

  it('calls onStart when entering edit mode', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<Text editable={{ onStart }}>Hello</Text>)

    await user.click(screen.getByLabelText('编辑'))
    expect(onStart).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: FAIL — 编辑按钮和输入框未渲染

- [ ] **Step 3: Write minimal implementation**

在 `typography.tsx` 中 `CopyableAction` 之后插入：

```tsx
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
  )
}
```

修改 `Text` 组件以集成 Editable：

```tsx
export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, copyable, editable, children, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
      typeof children === 'string' ? children : ''
    )

    React.useEffect(() => {
      if (typeof children === 'string') {
        setDisplayValue(children)
      }
    }, [children])

    const textString = typeof children === 'string' ? children : ''

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

    return (
      <span ref={ref} className={cn('group inline-flex items-center', className)}>
        <BaseTypography {...props}>{children}</BaseTypography>
        {copyable && textString && <CopyableAction text={textString} config={copyable} />}
      </span>
    )
  }
)
Text.displayName = 'Text'
```

注意：这里 editable 优先级高于 copyable，当 editable 为 true 时，不显示 copyable。如果需要同时支持，可以后续调整。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/typography.tsx src/__tests__/typography.test.tsx
git commit -m "feat: add editable functionality to Text"
```

---

### Task 5: Ellipsis 功能

**Files:**
- Modify: `src/components/ui/typography.tsx`
- Modify: `src/__tests__/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

追加测试：

```tsx
describe('Ellipsis', () => {
  it('applies line-clamp-1 by default', () => {
    render(<Text ellipsis>Long text</Text>)
    expect(screen.getByText('Long text')).toHaveClass('line-clamp-1')
  })

  it('applies custom rows', () => {
    render(<Text ellipsis={{ rows: 3 }}>Long text</Text>)
    expect(screen.getByText('Long text')).toHaveClass('line-clamp-3')
  })

  it('shows expand button when expandable', async () => {
    const user = userEvent.setup()
    render(<Text ellipsis={{ expandable: true }}>Long text</Text>)

    const expandButton = screen.getByText('展开')
    await user.click(expandButton)

    expect(screen.getByText('收起')).toBeInTheDocument()
  })

  it('calls onExpand callback', async () => {
    const user = userEvent.setup()
    const onExpand = vi.fn()
    render(<Text ellipsis={{ expandable: true, onExpand }}>Long text</Text>)

    await user.click(screen.getByText('展开'))
    expect(onExpand).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: FAIL — line-clamp 类未应用，展开按钮未渲染

- [ ] **Step 3: Write minimal implementation**

在 `typography.tsx` 中 `EditableAction` 之后插入：

```tsx
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
```

修改 `Text` 组件以集成 Ellipsis：

```tsx
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
      <BaseTypography {...props} className={cn(ellipsis && !resolvedEllipsis.expandable && `line-clamp-${rows}`)}>
        {children}
      </BaseTypography>
    )

    return (
      <span ref={ref} className={cn('group inline-flex items-center', className)}>
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/typography.tsx src/__tests__/typography.test.tsx
git commit -m "feat: add ellipsis functionality to Text"
```

---

### Task 6: Paragraph 组件

**Files:**
- Modify: `src/components/ui/typography.tsx`
- Modify: `src/__tests__/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

追加测试：

```tsx
import { Paragraph } from '@/components/ui/typography'

describe('Paragraph', () => {
  it('renders p tag', () => {
    const { container } = render(<Paragraph>Content</Paragraph>)
    expect(container.querySelector('p')).toHaveTextContent('Content')
  })

  it('applies paragraph spacing', () => {
    const { container } = render(<Paragraph>Content</Paragraph>)
    expect(container.querySelector('p')).toHaveClass('leading-relaxed', 'mb-4')
  })

  it('applies type color', () => {
    render(<Paragraph type="danger">Danger</Paragraph>)
    expect(screen.getByText('Danger')).toHaveClass('text-red-500')
  })

  it('supports copyable', async () => {
    const user = userEvent.setup()
    render(<Paragraph copyable>Hello</Paragraph>)

    const copyButton = screen.getByLabelText('复制')
    await user.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('Hello')
  })

  it('supports editable', async () => {
    const user = userEvent.setup()
    render(<Paragraph editable>Hello</Paragraph>)

    await user.click(screen.getByLabelText('编辑'))
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: FAIL — `Paragraph` 未定义

- [ ] **Step 3: Write minimal implementation**

在 `typography.tsx` 中 `Text` 之后追加：

```tsx
// ============================== Paragraph ==============================

export interface ParagraphProps extends BaseTypographyProps {
  copyable?: boolean | CopyConfig
  editable?: boolean | EditConfig
  ellipsis?: boolean | EllipsisConfig
}

export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
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
        <p ref={ref} className={cn('leading-relaxed mb-4', className)}>
          <EditableAction
            value={displayValue}
            config={editable}
            onSave={setDisplayValue}
          />
        </p>
      )
    }

    const content = (
      <BaseTypography
        {...props}
        className={cn(ellipsis && !resolvedEllipsis.expandable && `line-clamp-${rows}`)}
      >
        {children}
      </BaseTypography>
    )

    return (
      <p ref={ref} className={cn('leading-relaxed mb-4 group', className)}>
        {ellipsis ? (
          <EllipsisWrapper config={ellipsis}>{content}</EllipsisWrapper>
        ) : (
          content
        )}
        {copyable && textString && <CopyableAction text={textString} config={copyable} />}
      </p>
    )
  }
)
Paragraph.displayName = 'Paragraph'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/typography.tsx src/__tests__/typography.test.tsx
git commit -m "feat: add Paragraph component"
```

---

### Task 7: Link 组件

**Files:**
- Modify: `src/components/ui/typography.tsx`
- Modify: `src/__tests__/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

追加测试：

```tsx
import { Link } from '@/components/ui/typography'

describe('Link', () => {
  it('renders a tag with href', () => {
    render(<Link href="https://example.com">Click</Link>)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })

  it('applies link styling', () => {
    render(<Link href="https://example.com">Click</Link>)
    expect(screen.getByRole('link')).toHaveClass('text-primary', 'hover:underline')
  })

  it('supports target prop', () => {
    render(<Link href="https://example.com" target="_blank">Click</Link>)
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
  })

  it('supports copyable', async () => {
    const user = userEvent.setup()
    render(<Link href="https://example.com" copyable>Click</Link>)

    const copyButton = screen.getByLabelText('复制')
    await user.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('Click')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: FAIL — `Link` 未定义

- [ ] **Step 3: Write minimal implementation**

在 `typography.tsx` 中 `Paragraph` 之后追加：

```tsx
// ============================== Link ==============================

export interface LinkProps extends BaseTypographyProps {
  href: string
  target?: string
  copyable?: boolean | CopyConfig
  editable?: boolean | EditConfig
  ellipsis?: boolean | EllipsisConfig
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, target, className, copyable, editable, ellipsis, children, ...props }, ref) => {
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
        <span ref={ref as React.Ref<HTMLSpanElement>} className={cn('group inline-flex items-center', className)}>
          <EditableAction
            value={displayValue}
            config={editable}
            onSave={setDisplayValue}
          />
        </span>
      )
    }

    const content = (
      <a
        ref={ref}
        href={href}
        target={target}
        className={cn('text-primary hover:underline cursor-pointer', className)}
      >
        <BaseTypography
          {...props}
          className={cn(ellipsis && !resolvedEllipsis.expandable && `line-clamp-${rows}`)}
        >
          {children}
        </BaseTypography>
      </a>
    )

    if (ellipsis) {
      return (
        <span className="group inline-flex items-center">
          <EllipsisWrapper config={ellipsis}>{content}</EllipsisWrapper>
          {copyable && textString && <CopyableAction text={textString} config={copyable} />}
        </span>
      )
    }

    return (
      <span className="group inline-flex items-center">
        {content}
        {copyable && textString && <CopyableAction text={textString} config={copyable} />}
      </span>
    )
  }
)
Link.displayName = 'Link'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/typography.tsx src/__tests__/typography.test.tsx
git commit -m "feat: add Link component"
```

---

### Task 8: 聚合导出与最终验证

**Files:**
- Modify: `src/components/ui/typography.tsx`
- Modify: `src/__tests__/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

追加测试：

```tsx
import { Typography } from '@/components/ui/typography'

describe('Typography aggregate export', () => {
  it('exports Title via Typography.Title', () => {
    render(<Typography.Title level={2}>Title</Typography.Title>)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('exports Text via Typography.Text', () => {
    render(<Typography.Text type="danger">Text</Typography.Text>)
    expect(screen.getByText('Text')).toHaveClass('text-red-500')
  })

  it('exports Paragraph via Typography.Paragraph', () => {
    const { container } = render(<Typography.Paragraph>Para</Typography.Paragraph>)
    expect(container.querySelector('p')).toHaveTextContent('Para')
  })

  it('exports Link via Typography.Link', () => {
    render(<Typography.Link href="/">Link</Typography.Link>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: FAIL — `Typography` 对象未定义或组件未附加

- [ ] **Step 3: Write minimal implementation**

在 `typography.tsx` 文件末尾追加：

```tsx
// ============================== Aggregate Export ==============================

export const Typography = {
  Title,
  Text,
  Paragraph,
  Link,
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/typography.test.tsx`

Expected: PASS (全部测试通过)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/typography.tsx src/__tests__/typography.test.tsx
git commit -m "feat: add Typography aggregate export"
```

---

## Self-Review

### 1. Spec Coverage

| Spec 要求 | 对应任务 |
|-----------|---------|
| Title (h1-h5) | Task 1 |
| Text 基础样式 (type, mark, code, etc.) | Task 2 |
| Text 交互 (copyable) | Task 3 |
| Text 交互 (editable) | Task 4 |
| Text 交互 (ellipsis) | Task 5 |
| Paragraph | Task 6 |
| Link | Task 7 |
| 聚合导出 | Task 8 |

无遗漏。

### 2. Placeholder Scan

- 无 "TBD"、"TODO"、"implement later"
- 每个步骤包含完整代码
- 每个步骤包含运行命令

### 3. Type Consistency

- `CopyConfig`、`EditConfig`、`EllipsisConfig` 在所有任务中定义一致
- `BaseTypographyProps` 被 Text、Paragraph、Link 复用
- `className` 始终使用 `cn()` 合并

无类型不一致问题。
