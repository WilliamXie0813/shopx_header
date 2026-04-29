# Theme DevTool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a global floating Theme DevTool panel that allows real-time editing of all ThemeTokens without modifying the ThemeContext interface, activated by keyboard shortcut.

**Architecture:** An overlay `ThemeDevToolProvider` wraps the app, manages `overrides` state, computes `mergedTheme`, and injects it via `ThemeContext.Provider`. A floating `ThemeDevToolPanel` (fixed position) renders the enhanced `TokenEditor` and handles keyboard shortcuts.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/shopxComponent/theme/ThemeContext.tsx` | Modify | Export `ThemeContext` so external Provider can inject merged theme |
| `src/App.tsx` | Modify | Wrap `<Demo />` with `<ThemeDevToolProvider>` |
| `src/shopxComponent/devtool/useKeyboardShortcut.ts` | Create | Hook to listen for keyboard shortcuts (Ctrl+Shift+T / Cmd+Shift+T, Escape) |
| `src/shopxComponent/devtool/ThemeDevToolProvider.tsx` | Create | Manages overrides state, computes mergedTheme, renders ThemeContext.Provider + floating panel |
| `src/shopxComponent/devtool/ThemeDevToolPanel.tsx` | Create | Floating panel UI: title bar, close button, platform-aware shortcut hint, TokenEditor, bottom toolbar |
| `src/shopxComponent/devtool/TokenEditor.tsx` | Create | Enhanced token editor supporting all ThemeTokens fields (colors, typography.fontFamily, typography.fontSizes, spacing, borderRadius) |

---

### Task 1: Export ThemeContext

**Files:**
- Modify: `src/shopxComponent/theme/ThemeContext.tsx:104`

**Context:** Currently `ThemeContext` is declared but not exported. `ThemeDevToolProvider` needs to access it to inject a merged theme value without going through the existing `ThemeProvider`.

- [ ] **Step 1: Write the failing test**

Create `src/shopxComponent/theme/ThemeContext.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { ThemeContext, defaultTheme } from './ThemeContext'

function Consumer() {
  const theme = useContext(ThemeContext)
  return <div data-testid="color">{theme.colors.primary}</div>
}

describe('ThemeContext export', () => {
  it('ThemeContext is exported and can be consumed directly', () => {
    render(
      <ThemeContext.Provider value={defaultTheme}>
        <Consumer />
      </ThemeContext.Provider>
    )

    expect(screen.getByTestId('color')).toHaveTextContent('#3b82f6')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shopxComponent/theme/ThemeContext.test.tsx`

Expected: FAIL — `ThemeContext` is not exported from `ThemeContext.tsx`

- [ ] **Step 3: Write minimal implementation**

Modify `src/shopxComponent/theme/ThemeContext.tsx` line 104:

```tsx
// Change from:
const ThemeContext = createContext<ThemeTokens>(defaultTheme)

// To:
export const ThemeContext = createContext<ThemeTokens>(defaultTheme)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shopxComponent/theme/ThemeContext.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/theme/ThemeContext.tsx src/shopxComponent/theme/ThemeContext.test.tsx
git commit -m "feat: export ThemeContext for external Provider injection

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: useKeyboardShortcut Hook

**Files:**
- Create: `src/shopxComponent/devtool/useKeyboardShortcut.ts`
- Test: `src/shopxComponent/devtool/useKeyboardShortcut.test.ts`

**Context:** A reusable hook that listens for keyboard events. On Windows/Linux: Ctrl+Shift+T toggles. On Mac: Cmd+Shift+T toggles. Escape always closes.

- [ ] **Step 1: Write the failing test**

Create `src/shopxComponent/devtool/useKeyboardShortcut.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import useKeyboardShortcut from './useKeyboardShortcut'

describe('useKeyboardShortcut', () => {
  const onToggle = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    onToggle.mockClear()
    onClose.mockClear()
  })

  afterEach(() => {
    // cleanup any remaining listeners
  })

  it('calls onToggle when Ctrl+Shift+T is pressed', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'T',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onToggle when Meta+Shift+T is pressed (Mac)', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'T',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('does not call onToggle for plain T key', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'T',
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onToggle).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shopxComponent/devtool/useKeyboardShortcut.test.ts`

Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `src/shopxComponent/devtool/useKeyboardShortcut.ts`:

```ts
import { useEffect } from 'react'

interface UseKeyboardShortcutOptions {
  onToggle: () => void
  onClose: () => void
}

export default function useKeyboardShortcut({ onToggle, onClose }: UseKeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'T' && e.shiftKey && !e.altKey && !e.ctrlKey && e.metaKey) {
        e.preventDefault()
        onToggle()
        return
      }

      if (e.key === 'T' && e.shiftKey && e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        onToggle()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggle, onClose])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shopxComponent/devtool/useKeyboardShortcut.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/devtool/
git commit -m "feat: add useKeyboardShortcut hook for devtool panel toggle

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: ThemeDevToolProvider

**Files:**
- Create: `src/shopxComponent/devtool/ThemeDevToolProvider.tsx`
- Test: `src/shopxComponent/devtool/ThemeDevToolProvider.test.tsx`

**Context:** The core provider. It maintains `overrides` state, computes `mergedTheme`, exposes `setOverride`/`resetOverrides`, renders `ThemeContext.Provider` with merged theme, and renders the floating panel as a sibling.

- [ ] **Step 1: Write the failing test**

Create `src/shopxComponent/devtool/ThemeDevToolProvider.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useContext } from 'react'
import ThemeDevToolProvider, { useThemeDevTool } from './ThemeDevToolProvider'
import { ThemeContext, defaultTheme } from '../theme/ThemeContext'

function ThemeConsumer() {
  const theme = useContext(ThemeContext)
  return <div data-testid="primary">{theme.colors.primary}</div>
}

function OverrideButton() {
  const { setOverride } = useThemeDevTool()
  return (
    <button onClick={() => setOverride('colors.primary', '#ff0000')}>
      Change Primary
    </button>
  )
}

function ResetButton() {
  const { resetOverrides } = useThemeDevTool()
  return <button onClick={resetOverrides}>Reset</button>
}

describe('ThemeDevToolProvider', () => {
  it('provides default theme initially', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeConsumer />
      </ThemeDevToolProvider>
    )

    expect(screen.getByTestId('primary')).toHaveTextContent('#3b82f6')
  })

  it('applies override to theme when setOverride is called', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeConsumer />
        <OverrideButton />
      </ThemeDevToolProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /change primary/i }))

    expect(screen.getByTestId('primary')).toHaveTextContent('#ff0000')
  })

  it('resets overrides when resetOverrides is called', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeConsumer />
        <OverrideButton />
        <ResetButton />
      </ThemeDevToolProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /change primary/i }))
    expect(screen.getByTestId('primary')).toHaveTextContent('#ff0000')

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByTestId('primary')).toHaveTextContent('#3b82f6')
  })

  it('does not render devtool panel in test environment by default', () => {
    // The panel renders conditionally based on import.meta.env.DEV
    // In jsdom tests, this is typically undefined/falsy
    render(
      <ThemeDevToolProvider>
        <ThemeConsumer />
      </ThemeDevToolProvider>
    )

    // Panel should not be visible
    expect(screen.queryByText(/theme devtool/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shopxComponent/devtool/ThemeDevToolProvider.test.tsx`

Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `src/shopxComponent/devtool/ThemeDevToolProvider.tsx`:

```tsx
import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react'
import { ThemeContext, defaultTheme, type ThemeTokens } from '../theme/ThemeContext'
import ThemeDevToolPanel from './ThemeDevToolPanel'

interface ThemeDevToolContextValue {
  overrides: Partial<ThemeTokens>
  setOverride: (path: string, value: string) => void
  resetOverrides: () => void
}

const ThemeDevToolContext = createContext<ThemeDevToolContextValue | null>(null)

export function useThemeDevTool() {
  const ctx = useContext(ThemeDevToolContext)
  if (!ctx) throw new Error('useThemeDevTool must be used within ThemeDevToolProvider')
  return ctx
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: string): Record<string, unknown> {
  const result = { ...obj }
  const keys = path.split('.')
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    current[key] = { ...(current[key] as Record<string, unknown> || {}) }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result
}

function mergeOverrides(base: ThemeTokens, overrides: Partial<ThemeTokens>): ThemeTokens {
  return {
    colors: { ...base.colors, ...overrides.colors },
    typography: {
      fontFamily: { ...base.typography.fontFamily, ...overrides.typography?.fontFamily },
      fontSizes: { ...base.typography.fontSizes, ...overrides.typography?.fontSizes },
    },
    spacing: { ...base.spacing, ...overrides.spacing },
    borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
  }
}

export default function ThemeDevToolProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Partial<ThemeTokens>>({})

  const mergedTheme = useMemo(
    () => mergeOverrides(defaultTheme, overrides),
    [overrides]
  )

  const setOverride = useCallback((path: string, value: string) => {
    setOverrides((prev) => {
      const next = { ...prev }
      const topKey = path.split('.')[0] as keyof ThemeTokens

      if (topKey === 'colors') {
        next.colors = setNestedValue(next.colors || {}, path, value) as ThemeTokens['colors']
      } else if (topKey === 'typography') {
        next.typography = setNestedValue(next.typography || {}, path, value) as ThemeTokens['typography']
      } else if (topKey === 'spacing') {
        next.spacing = setNestedValue(next.spacing || {}, path, value) as ThemeTokens['spacing']
      } else if (topKey === 'borderRadius') {
        next.borderRadius = setNestedValue(next.borderRadius || {}, path, value) as ThemeTokens['borderRadius']
      }

      return next
    })
  }, [])

  const resetOverrides = useCallback(() => {
    setOverrides({})
  }, [])

  const contextValue = useMemo(
    () => ({ overrides, setOverride, resetOverrides }),
    [overrides, setOverride, resetOverrides]
  )

  return (
    <ThemeDevToolContext.Provider value={contextValue}>
      <ThemeContext.Provider value={mergedTheme}>
        {children}
      </ThemeContext.Provider>
      {import.meta.env.DEV && <ThemeDevToolPanel />}
    </ThemeDevToolContext.Provider>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shopxComponent/devtool/ThemeDevToolProvider.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/devtool/ThemeDevToolProvider.tsx src/shopxComponent/devtool/ThemeDevToolProvider.test.tsx
git commit -m "feat: add ThemeDevToolProvider with override management

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: TokenEditor (Enhanced)

**Files:**
- Create: `src/shopxComponent/devtool/TokenEditor.tsx`
- Test: `src/shopxComponent/devtool/TokenEditor.test.tsx`

**Context:** Enhanced token editor supporting all ThemeTokens fields. Unlike the existing Playground TokenEditor, this one only handles theme tokens (no HeaderConfig). Uses `ColorField` from the parent directory for color inputs.

- [ ] **Step 1: Write the failing test**

Create `src/shopxComponent/devtool/TokenEditor.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TokenEditor from './TokenEditor'
import { defaultTheme } from '../theme/ThemeContext'

describe('TokenEditor (devtool)', () => {
  it('renders all color fields', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('primary')).toBeInTheDocument()
    expect(screen.getByText('background')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('renders typography font family inputs', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByLabelText(/heading font/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/body font/i)).toBeInTheDocument()
  })

  it('renders font size inputs', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByLabelText(/font size xs/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/font size base/i)).toBeInTheDocument()
  })

  it('renders spacing inputs', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText('Spacing')).toBeInTheDocument()
    expect(screen.getByLabelText(/spacing xs/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/spacing md/i)).toBeInTheDocument()
  })

  it('renders border radius inputs', () => {
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText('Border Radius')).toBeInTheDocument()
    expect(screen.getByLabelText(/border radius sm/i)).toBeInTheDocument()
  })

  it('calls onChange when a color is edited', () => {
    const onChange = vi.fn()
    render(<TokenEditor theme={defaultTheme} onChange={onChange} onReset={vi.fn()} />)

    const primaryInputs = screen.getAllByDisplayValue('#3b82f6')
    const textInput = primaryInputs.find((el) => el.getAttribute('type') === 'text')
    expect(textInput).toBeDefined()
    fireEvent.change(textInput!, { target: { value: '#ef4444' } })

    expect(onChange).toHaveBeenCalledWith('colors.primary', '#ef4444')
  })

  it('calls onChange when font size is edited', () => {
    const onChange = vi.fn()
    render(<TokenEditor theme={defaultTheme} onChange={onChange} onReset={vi.fn()} />)

    const input = screen.getByLabelText(/font size base/i)
    fireEvent.change(input, { target: { value: '1.25rem' } })

    expect(onChange).toHaveBeenCalledWith('typography.fontSizes.base', '1.25rem')
  })

  it('calls onReset when reset button is clicked', () => {
    const onReset = vi.fn()
    render(<TokenEditor theme={defaultTheme} onChange={vi.fn()} onReset={onReset} />)

    const resetButton = screen.getByRole('button', { name: /reset to default/i })
    fireEvent.click(resetButton)

    expect(onReset).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shopxComponent/devtool/TokenEditor.test.tsx`

Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `src/shopxComponent/devtool/TokenEditor.tsx`:

```tsx
import { useState } from 'react'
import ColorField from '../ColorField'
import type { ThemeTokens } from '../theme/ThemeContext'

interface TokenEditorProps {
  theme: ThemeTokens
  onChange: (path: string, value: string) => void
  onReset: () => void
}

const colorKeys: { key: keyof ThemeTokens['colors']; label: string }[] = [
  { key: 'primary', label: 'primary' },
  { key: 'background', label: 'background' },
  { key: 'surface', label: 'surface' },
  { key: 'text', label: 'text' },
  { key: 'textSecondary', label: 'textSecondary' },
  { key: 'textInverse', label: 'textInverse' },
  { key: 'border', label: 'border' },
]

const fontSizeKeys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const
const spacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const borderRadiusKeys = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(title === 'Colors')

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2"
      >
        <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
          {title}
        </h3>
        <span className="text-xs" style={{ color: '#94a3b8' }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && children}
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <label className="text-xs font-medium w-24 flex-shrink-0" style={{ color: '#64748b' }}>
        {label}
      </label>
      <input
        type="text"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 text-xs px-2 py-1 rounded border font-mono"
        style={{
          backgroundColor: '#f8fafc',
          borderColor: '#e2e8f0',
          color: '#1e293b',
        }}
      />
    </div>
  )
}

export default function TokenEditor({ theme, onChange, onReset }: TokenEditorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Colors */}
        <Section title="Colors">
          <div className="space-y-0.5">
            {colorKeys.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={theme.colors[key]}
                onChange={(value) => onChange(`colors.${key}`, value)}
              />
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-3">
            <TextField
              label="Heading Font"
              value={theme.typography.fontFamily.heading}
              onChange={(value) => onChange('typography.fontFamily.heading', value)}
            />
            <TextField
              label="Body Font"
              value={theme.typography.fontFamily.body}
              onChange={(value) => onChange('typography.fontFamily.body', value)}
            />
            <div className="pt-2">
              <div className="text-[10px] font-medium mb-2" style={{ color: '#94a3b8' }}>
                Font Sizes
              </div>
              <div className="space-y-1">
                {fontSizeKeys.map((key) => (
                  <TextField
                    key={key}
                    label={`Size ${key}`}
                    value={theme.typography.fontSizes[key]}
                    onChange={(value) => onChange(`typography.fontSizes.${key}`, value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Spacing */}
        <Section title="Spacing">
          <div className="space-y-1">
            {spacingKeys.map((key) => (
              <TextField
                key={key}
                label={`Spacing ${key}`}
                value={theme.spacing[key]}
                onChange={(value) => onChange(`spacing.${key}`, value)}
              />
            ))}
          </div>
        </Section>

        {/* Border Radius */}
        <Section title="Border Radius">
          <div className="space-y-1">
            {borderRadiusKeys.map((key) => (
              <TextField
                key={key}
                label={`Radius ${key}`}
                value={theme.borderRadius[key]}
                onChange={(value) => onChange(`borderRadius.${key}`, value)}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* Reset button */}
      <div className="flex-none px-4 py-3 border-t" style={{ borderColor: '#e2e8f0' }}>
        <button
          onClick={onReset}
          className="w-full text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
          }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shopxComponent/devtool/TokenEditor.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/devtool/TokenEditor.tsx src/shopxComponent/devtool/TokenEditor.test.tsx
git commit -m "feat: add enhanced TokenEditor for devtool with full ThemeTokens support

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: ThemeDevToolPanel

**Files:**
- Create: `src/shopxComponent/devtool/ThemeDevToolPanel.tsx`
- Test: `src/shopxComponent/devtool/ThemeDevToolPanel.test.tsx`

**Context:** The floating panel UI. Fixed position, platform-aware shortcut display, contains TokenEditor, bottom toolbar with Reset and Export buttons.

- [ ] **Step 1: Write the failing test**

Create `src/shopxComponent/devtool/ThemeDevToolPanel.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeDevToolPanel from './ThemeDevToolPanel'
import ThemeDevToolProvider from './ThemeDevToolProvider'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

describe('ThemeDevToolPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders panel when toggled open', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    expect(screen.getByText(/theme devtool/i)).toBeInTheDocument()
    expect(screen.getByText('Colors')).toBeInTheDocument()
  })

  it('closes when close button is clicked', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)

    expect(screen.queryByText(/theme devtool/i)).not.toBeInTheDocument()
  })

  it('shows platform-aware shortcut hint', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    const isMac = navigator.platform.toLowerCase().includes('mac')
    const expectedHint = isMac ? '⌘⇧T' : 'Ctrl+Shift+T'
    expect(screen.getByText(expectedHint)).toBeInTheDocument()
  })

  it('exports theme as JSON when export JSON is clicked', async () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    const exportBtn = screen.getByRole('button', { name: /export theme/i })
    fireEvent.click(exportBtn)

    const jsonOption = screen.getByRole('button', { name: /json/i })
    fireEvent.click(jsonOption)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    const writtenText = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(() => JSON.parse(writtenText)).not.toThrow()
  })

  it('exports theme as TypeScript when export TS is clicked', async () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    const exportBtn = screen.getByRole('button', { name: /export theme/i })
    fireEvent.click(exportBtn)

    const tsOption = screen.getByRole('button', { name: /typescript/i })
    fireEvent.click(tsOption)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    const writtenText = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(writtenText).toContain('colors:')
    expect(writtenText).toContain('typography:')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shopxComponent/devtool/ThemeDevToolPanel.test.tsx`

Expected: FAIL — module not found, `initialOpen` prop does not exist

- [ ] **Step 3: Write minimal implementation**

Create `src/shopxComponent/devtool/ThemeDevToolPanel.tsx`:

```tsx
import { useState, useCallback, useMemo } from 'react'
import { X } from 'lucide-react'
import TokenEditor from './TokenEditor'
import useKeyboardShortcut from './useKeyboardShortcut'
import { useThemeDevTool } from './ThemeDevToolProvider'
import { useTheme } from '../theme/ThemeContext'

function getShortcutHint(): string {
  return navigator.platform.toLowerCase().includes('mac') ? '⌘⇧T' : 'Ctrl+Shift+T'
}

function themeToCode(theme: ReturnType<typeof useTheme>): string {
  return `export const defaultTheme: ThemeTokens = ${JSON.stringify(theme, null, 2)}`
}

export default function ThemeDevToolPanel({ initialOpen = false }: { initialOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const theme = useTheme()
  const { setOverride, resetOverrides } = useThemeDevTool()

  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  const close = useCallback(() => setIsOpen(false), [])

  useKeyboardShortcut({ onToggle: toggle, onClose: close })

  const shortcutHint = useMemo(() => getShortcutHint(), [])

  const handleExport = useCallback(
    async (format: 'json' | 'typescript') => {
      const text =
        format === 'json'
          ? JSON.stringify(theme, null, 2)
          : themeToCode(theme)
      await navigator.clipboard.writeText(text)
      setShowExportMenu(false)
    },
    [theme]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed z-[100] rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        right: '16px',
        bottom: '16px',
        width: '320px',
        maxHeight: '90vh',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">Theme DevTool</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
            {shortcutHint}
          </span>
        </div>
        <button
          onClick={close}
          aria-label="Close"
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X size={14} className="text-white/60" />
        </button>
      </div>

      {/* Token Editor */}
      <div className="flex-1 overflow-hidden text-white">
        <TokenEditor
          theme={theme}
          onChange={setOverride}
          onReset={resetOverrides}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex-none px-4 py-3 border-t flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button
          onClick={resetOverrides}
          className="flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Reset
        </button>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu((v) => !v)}
            className="text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
            }}
          >
            Export Theme
          </button>
          {showExportMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 rounded-lg overflow-hidden shadow-xl"
              style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <button
                onClick={() => handleExport('json')}
                className="block w-full text-left text-xs px-4 py-2 hover:bg-white/10 transition-colors text-white"
              >
                Copy as JSON
              </button>
              <button
                onClick={() => handleExport('typescript')}
                className="block w-full text-left text-xs px-4 py-2 hover:bg-white/10 transition-colors text-white"
              >
                Copy as TypeScript
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shopxComponent/devtool/ThemeDevToolPanel.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/devtool/ThemeDevToolPanel.tsx src/shopxComponent/devtool/ThemeDevToolPanel.test.tsx
git commit -m "feat: add ThemeDevToolPanel floating UI with export support

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Integrate into App.tsx

**Files:**
- Modify: `src/App.tsx`

**Context:** Wrap `<Demo />` with `<ThemeDevToolProvider>` so the devtool is active across the entire app.

- [ ] **Step 1: Write the failing test**

Create `src/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./shopxComponent/Demo', () => ({
  default: () => <div data-testid="demo">Demo Content</div>,
}))

describe('App', () => {
  it('renders Demo component', () => {
    render(<App />)
    expect(screen.getByTestId('demo')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it passes (baseline)**

Run: `npx vitest run src/App.test.tsx`

Expected: PASS (App currently just renders `<Demo />`)

- [ ] **Step 3: Modify App.tsx**

Modify `src/App.tsx`:

```tsx
import Demo from './shopxComponent/Demo'
import ThemeDevToolProvider from './shopxComponent/devtool/ThemeDevToolProvider'

function App() {
  return (
    <ThemeDevToolProvider>
      <Demo />
    </ThemeDevToolProvider>
  )
}

export default App
```

- [ ] **Step 4: Run tests to verify everything still passes**

Run: `npx vitest run`

Expected: All tests PASS (ThemeDevToolProvider renders panel conditionally on `import.meta.env.DEV`, which is falsy in test environment)

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: integrate ThemeDevToolProvider into App

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Self-Review

### Spec Coverage Check

| Spec Requirement | Implementing Task |
|---|---|
| Export ThemeContext (minimal change) | Task 1 |
| Overlay Provider architecture | Task 3 |
| Global floating panel | Task 5 |
| Keyboard shortcut (Ctrl+Shift+T / Cmd+Shift+T) | Task 2, Task 5 |
| Escape to close | Task 2, Task 5 |
| Platform-aware shortcut display | Task 5 |
| Colors editing | Task 4 |
| Typography (fontFamily + fontSizes) editing | Task 4 |
| Spacing editing | Task 4 |
| BorderRadius editing | Task 4 |
| Reset to default | Task 3, Task 4 |
| Export JSON | Task 5 |
| Export TypeScript | Task 5 |
| No persistence (refresh resets) | Task 3 (no localStorage usage) |
| App integration | Task 6 |

All spec requirements are covered.

### Placeholder Scan

No TBD, TODO, "implement later", or vague steps found. All test code and implementation code are complete.

### Type Consistency

- `setOverride(path: string, value: string)` — consistent across Task 3 provider and Task 4 TokenEditor
- `ThemeTokens` type — imported from same source in all tasks
- `onChange` callback signature — `TokenEditorProps.onChange` matches `ThemeDevToolContextValue.setOverride`
