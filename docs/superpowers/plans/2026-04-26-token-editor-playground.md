# Token Editor Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Playground mode with a right-side token editing panel that updates Header components in real time.

**Architecture:** The Playground is a standalone mode inside Demo.tsx, toggled via a mode switch. It renders a variant button group, a Header preview area, and a TokenEditor sidebar. Theme/config overrides are stored as Partial objects and merged with defaults at render time.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, Tailwind CSS v4, Lucide React

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/shopxComponent/ColorField.tsx` | Create | Reusable color picker + hex text input component |
| `src/shopxComponent/ColorField.test.tsx` | Create | Tests for ColorField rendering and two-way sync |
| `src/shopxComponent/TokenEditor.tsx` | Create | Right-side panel with grouped token editors |
| `src/shopxComponent/TokenEditor.test.tsx` | Create | Tests for TokenEditor sections and callbacks |
| `src/shopxComponent/Playground.tsx` | Create | Playground mode container: variant selection, state, merge logic |
| `src/shopxComponent/Playground.test.tsx` | Create | Tests for variant switching and merge behavior |
| `src/shopxComponent/Demo.tsx` | Modify | Add mode toggle and Playground render branch |

---

## Task 1: ColorField Component

**Files:**
- Create: `src/shopxComponent/ColorField.tsx`
- Create: `src/shopxComponent/ColorField.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/shopxComponent/ColorField.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ColorField from './ColorField'

describe('ColorField', () => {
  it('renders label and current color value', () => {
    render(<ColorField label="Primary" value="#3b82f6" onChange={vi.fn()} />)

    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByDisplayValue('#3b82f6')).toBeInTheDocument()
  })

  it('calls onChange when color picker changes', () => {
    const onChange = vi.fn()
    render(<ColorField label="Primary" value="#3b82f6" onChange={onChange} />)

    const picker = screen.getByLabelText('Primary color picker')
    fireEvent.change(picker, { target: { value: '#ef4444' } })

    expect(onChange).toHaveBeenCalledWith('#ef4444')
  })

  it('calls onChange when hex text input changes', () => {
    const onChange = vi.fn()
    render(<ColorField label="Primary" value="#3b82f6" onChange={onChange} />)

    const textInput = screen.getByDisplayValue('#3b82f6')
    fireEvent.change(textInput, { target: { value: '#22c55e' } })

    expect(onChange).toHaveBeenCalledWith('#22c55e')
  })

  it('syncs hex text when color picker changes', () => {
    const { rerender } = render(
      <ColorField label="Primary" value="#3b82f6" onChange={vi.fn()} />
    )

    rerender(<ColorField label="Primary" value="#ef4444" onChange={vi.fn()} />)

    expect(screen.getByDisplayValue('#ef4444')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/shopxComponent/ColorField.test.tsx
```

Expected: FAIL with "ColorField not found" or similar import error.

- [ ] **Step 3: Write minimal implementation**

Create `src/shopxComponent/ColorField.tsx`:

```tsx
interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <label className="text-xs font-medium w-24 flex-shrink-0" style={{ color: '#64748b' }}>
        {label}
      </label>
      <input
        type="color"
        aria-label={`${label} color picker`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border-0 p-0 flex-shrink-0"
      />
      <input
        type="text"
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/shopxComponent/ColorField.test.tsx
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/ColorField.tsx src/shopxComponent/ColorField.test.tsx
git commit -m "feat: add ColorField component with tests

Reusable color picker + hex text input for token editor panel.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: TokenEditor Component

**Files:**
- Create: `src/shopxComponent/TokenEditor.tsx`
- Create: `src/shopxComponent/TokenEditor.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/shopxComponent/TokenEditor.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TokenEditor from './TokenEditor'
import { defaultTheme } from './theme/ThemeContext'
import type { HeaderConfig } from './types/header'

const mockConfig: HeaderConfig = {
  type: 'header',
  variant: 'centered',
  showSearch: true,
  navigation: [{ label: 'Home', href: '/' }],
}

describe('TokenEditor', () => {
  it('renders Colors section with all color fields', () => {
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('primary')).toBeInTheDocument()
    expect(screen.getByText('background')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('renders Typography section with font family inputs', () => {
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByLabelText(/heading font/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/body font/i)).toBeInTheDocument()
  })

  it('renders Config section with showSearch toggle', () => {
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByText('Config')).toBeInTheDocument()
    expect(screen.getByLabelText(/show search/i)).toBeInTheDocument()
  })

  it('calls onThemeChange when a color is edited', () => {
    const onThemeChange = vi.fn()
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={onThemeChange}
        onConfigChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    const primaryInput = screen.getByDisplayValue('#3b82f6')
    fireEvent.change(primaryInput, { target: { value: '#ef4444' } })

    expect(onThemeChange).toHaveBeenCalledWith('colors.primary', '#ef4444')
  })

  it('calls onConfigChange when showSearch is toggled', () => {
    const onConfigChange = vi.fn()
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={onConfigChange}
        onReset={vi.fn()}
      />
    )

    const toggle = screen.getByLabelText(/show search/i)
    fireEvent.click(toggle)

    expect(onConfigChange).toHaveBeenCalledWith('showSearch', false)
  })

  it('calls onReset when reset button is clicked', () => {
    const onReset = vi.fn()
    render(
      <TokenEditor
        theme={defaultTheme}
        config={mockConfig}
        onThemeChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReset={onReset}
      />
    )

    const resetButton = screen.getByRole('button', { name: /reset to default/i })
    fireEvent.click(resetButton)

    expect(onReset).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/shopxComponent/TokenEditor.test.tsx
```

Expected: FAIL with import/component errors.

- [ ] **Step 3: Write minimal implementation**

Create `src/shopxComponent/TokenEditor.tsx`:

```tsx
import ColorField from './ColorField'
import type { ThemeTokens } from './theme/ThemeContext'
import type { HeaderConfig } from './types/header'

interface TokenEditorProps {
  theme: ThemeTokens
  config: HeaderConfig
  onThemeChange: (path: string, value: string) => void
  onConfigChange: (path: string, value: boolean) => void
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

export default function TokenEditor({
  theme,
  config,
  onThemeChange,
  onConfigChange,
  onReset,
}: TokenEditorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Colors */}
        <section>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: '#64748b' }}
          >
            Colors
          </h3>
          <div className="space-y-0.5">
            {colorKeys.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={theme.colors[key]}
                onChange={(value) => onThemeChange(`colors.${key}`, value)}
              />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: '#64748b' }}
          >
            Typography
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="font-heading"
                className="text-xs font-medium block mb-1"
                style={{ color: '#64748b' }}
              >
                Heading Font
              </label>
              <input
                id="font-heading"
                type="text"
                value={theme.typography.fontFamily.heading}
                onChange={(e) =>
                  onThemeChange('typography.fontFamily.heading', e.target.value)
                }
                className="w-full text-xs px-2 py-1.5 rounded border font-mono"
                style={{
                  backgroundColor: '#f8fafc',
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                }}
              />
            </div>
            <div>
              <label
                htmlFor="font-body"
                className="text-xs font-medium block mb-1"
                style={{ color: '#64748b' }}
              >
                Body Font
              </label>
              <input
                id="font-body"
                type="text"
                value={theme.typography.fontFamily.body}
                onChange={(e) =>
                  onThemeChange('typography.fontFamily.body', e.target.value)
                }
                className="w-full text-xs px-2 py-1.5 rounded border font-mono"
                style={{
                  backgroundColor: '#f8fafc',
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                }}
              />
            </div>
          </div>
        </section>

        {/* Config */}
        <section>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: '#64748b' }}
          >
            Config
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              aria-label="Show search"
              checked={config.showSearch}
              onChange={(e) => onConfigChange('showSearch', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs" style={{ color: '#1e293b' }}>
              Show search
            </span>
          </label>
        </section>
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

Run:
```bash
npx vitest run src/shopxComponent/TokenEditor.test.tsx
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/TokenEditor.tsx src/shopxComponent/TokenEditor.test.tsx
git commit -m "feat: add TokenEditor component with tests

Right-side panel for editing colors, typography, and config tokens.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Playground Component

**Files:**
- Create: `src/shopxComponent/Playground.tsx`
- Create: `src/shopxComponent/Playground.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/shopxComponent/Playground.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Playground from './Playground'

vi.mock('./headers', () => ({
  CenteredHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">CenteredHeader-{config.variant}</div>
  ),
  FloatingHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">FloatingHeader-{config.variant}</div>
  ),
  LuxeValutHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">LuxeValutHeader-{config.variant}</div>
  ),
  MegaHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">MegaHeader-{config.variant}</div>
  ),
  MarketplaceHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">MarketplaceHeader-{config.variant}</div>
  ),
  StickyCompactHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">StickyCompactHeader-{config.variant}</div>
  ),
}))

describe('Playground', () => {
  it('renders all variant buttons', () => {
    render(<Playground />)

    expect(screen.getByRole('button', { name: 'Centered' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Floating' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'LuxeVault' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mega' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marketplace' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sticky' })).toBeInTheDocument()
  })

  it('shows CenteredHeader by default', () => {
    render(<Playground />)

    expect(screen.getByTestId('header')).toHaveTextContent('CenteredHeader')
  })

  it('switches header variant when button is clicked', () => {
    render(<Playground />)

    const floatingBtn = screen.getByRole('button', { name: 'Floating' })
    fireEvent.click(floatingBtn)

    expect(screen.getByTestId('header')).toHaveTextContent('FloatingHeader')
  })

  it('renders TokenEditor panel', () => {
    render(<Playground />)

    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Config')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/shopxComponent/Playground.test.tsx
```

Expected: FAIL with import/component errors.

- [ ] **Step 3: Write minimal implementation**

Create `src/shopxComponent/Playground.tsx`:

```tsx
import { useState, useMemo } from 'react'
import TokenEditor from './TokenEditor'
import { ThemeProvider, defaultTheme, type ThemeTokens } from './theme/ThemeContext'
import type { HeaderConfig } from './types/header'
import {
  CenteredHeader,
  FloatingHeader,
  LuxeValutHeader,
  MegaHeader,
  MarketplaceHeader,
  StickyCompactHeader,
} from './headers'

const demoNavigation = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    href: '/shop',
    description: 'Browse our products',
    children: [
      { label: 'New Arrivals', href: '/new', description: 'Latest collection' },
      { label: 'Best Sellers', href: '/bestsellers', description: 'Customer favorites' },
      { label: 'Sale', href: '/sale', description: 'Up to 50% off' },
    ],
  },
  {
    label: 'Collections',
    href: '/collections',
    description: 'Curated for you',
    children: [
      { label: 'Spring', href: '/spring', description: 'Light & airy styles' },
      { label: 'Summer', href: '/summer', description: 'Warm weather picks' },
      { label: 'Fall', href: '/fall', description: 'Cozy seasonal tones' },
      { label: 'Winter', href: '/winter', description: 'Cold weather essentials' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const darkTheme: ThemeTokens = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: '#0a0a0a',
    surface: '#141414',
    text: '#f5f3ef',
    textSecondary: '#888888',
    textInverse: '#f5f3ef',
    primary: '#c9a96e',
    border: '#2a2a2a',
  },
}

const variants = [
  { id: 'centered', label: 'Centered', theme: defaultTheme, render: (config: HeaderConfig) => <CenteredHeader config={config} /> },
  { id: 'floating', label: 'Floating', theme: defaultTheme, render: (config: HeaderConfig) => <FloatingHeader config={config} /> },
  { id: 'luxe', label: 'LuxeVault', theme: darkTheme, render: (config: HeaderConfig) => <LuxeValutHeader config={config} /> },
  { id: 'mega', label: 'Mega', theme: defaultTheme, render: (config: HeaderConfig) => <MegaHeader config={config} /> },
  { id: 'marketplace', label: 'Marketplace', theme: defaultTheme, render: (config: HeaderConfig) => <MarketplaceHeader config={config} /> },
  { id: 'sticky', label: 'Sticky', theme: defaultTheme, render: (config: HeaderConfig) => <StickyCompactHeader config={config} /> },
]

function makeConfig(variant: string, showSearch: boolean): HeaderConfig {
  return {
    type: 'header',
    variant,
    showSearch,
    navigation: demoNavigation,
  }
}

export default function Playground() {
  const [selectedVariant, setSelectedVariant] = useState('centered')
  const [themeOverrides, setThemeOverrides] = useState<Partial<ThemeTokens>>({})
  const [configOverrides, setConfigOverrides] = useState<Partial<HeaderConfig>>({})

  const variant = variants.find((v) => v.id === selectedVariant) || variants[0]

  const mergedTheme = useMemo(() => {
    const base = variant.theme
    if (Object.keys(themeOverrides).length === 0) return base
    return {
      ...base,
      colors: { ...base.colors, ...themeOverrides.colors },
      typography: themeOverrides.typography
        ? {
            ...base.typography,
            fontFamily: {
              ...base.typography.fontFamily,
              ...themeOverrides.typography.fontFamily,
            },
          }
        : base.typography,
    } as ThemeTokens
  }, [variant, themeOverrides])

  const mergedConfig = useMemo(() => {
    const base = makeConfig(variant.id, true)
    return { ...base, ...configOverrides } as HeaderConfig
  }, [variant, configOverrides])

  const handleThemeChange = (path: string, value: string) => {
    setThemeOverrides((prev) => {
      const next = { ...prev }
      if (path === 'colors.primary') next.colors = { ...next.colors, primary: value }
      if (path === 'colors.background') next.colors = { ...next.colors, background: value }
      if (path === 'colors.surface') next.colors = { ...next.colors, surface: value }
      if (path === 'colors.text') next.colors = { ...next.colors, text: value }
      if (path === 'colors.textSecondary') next.colors = { ...next.colors, textSecondary: value }
      if (path === 'colors.textInverse') next.colors = { ...next.colors, textInverse: value }
      if (path === 'colors.border') next.colors = { ...next.colors, border: value }
      if (path === 'typography.fontFamily.heading')
        next.typography = { ...next.typography, fontFamily: { ...next.typography?.fontFamily, heading: value } as ThemeTokens['typography']['fontFamily'] }
      if (path === 'typography.fontFamily.body')
        next.typography = { ...next.typography, fontFamily: { ...next.typography?.fontFamily, body: value } as ThemeTokens['typography']['fontFamily'] }
      return next
    })
  }

  const handleConfigChange = (path: string, value: boolean) => {
    setConfigOverrides((prev) => ({
      ...prev,
      [path]: value,
    }))
  }

  const handleReset = () => {
    setThemeOverrides({})
    setConfigOverrides({})
  }

  return (
    <div className="h-full flex flex-col">
      {/* Variant selector */}
      <div className="flex-none px-6 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#e2e8f0' }}>
        <span className="text-[10px] font-bold uppercase tracking-wider mr-2" style={{ color: '#94a3b8' }}>
          Variant
        </span>
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVariant(v.id)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
            style={{
              backgroundColor: selectedVariant === v.id ? '#0f172a' : '#f1f5f9',
              color: selectedVariant === v.id ? '#ffffff' : '#64748b',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Preview area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <ThemeProvider theme={mergedTheme}>
              {variant.render(mergedConfig)}
            </ThemeProvider>
          </div>
          {/* Skeleton content below header */}
          <div className="px-6 pb-6">
            <SkeletonGrid bg={mergedTheme.colors.background} surface={mergedTheme.colors.surface} />
          </div>
        </div>

        {/* TokenEditor sidebar */}
        <div
          className="w-80 flex-none border-l overflow-hidden"
          style={{ borderColor: '#e2e8f0' }}
        >
          <TokenEditor
            theme={mergedTheme}
            config={mergedConfig}
            onThemeChange={handleThemeChange}
            onConfigChange={handleConfigChange}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  )
}

function SkeletonGrid({ bg, surface }: { bg: string; surface: string }) {
  const isDark = bg === '#0a0a0a' || bg === '#000000'
  const surfaceLight = isDark ? '#222222' : '#f8fafc'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 flex-[2]">
        <div className="flex-[3] rounded-2xl" style={{ backgroundColor: surface }} />
        <div className="flex-[2] flex flex-col gap-3">
          <div className="flex-1 rounded-2xl" style={{ backgroundColor: surface }} />
          <div className="h-16 rounded-xl" style={{ backgroundColor: surfaceLight }} />
        </div>
      </div>
      <div className="flex gap-3 flex-1">
        <div className="flex-1 rounded-xl" style={{ backgroundColor: surface }} />
        <div className="flex-1 rounded-xl" style={{ backgroundColor: surfaceLight }} />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-8 rounded-lg" style={{ backgroundColor: surface }} />
          <div className="flex-1 rounded-xl" style={{ backgroundColor: surface }} />
        </div>
      </div>
      <div className="h-12 rounded-xl" style={{ backgroundColor: surface }} />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/shopxComponent/Playground.test.tsx
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/Playground.tsx src/shopxComponent/Playground.test.tsx
git commit -m "feat: add Playground component with tests

Standalone playground mode with variant selection, token state
management, and live header preview.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Demo.tsx Mode Toggle

**Files:**
- Modify: `src/shopxComponent/Demo.tsx`

- [ ] **Step 1: Add Playground import and mode state**

At the top of `src/shopxComponent/Demo.tsx`, add:

```tsx
import Playground from './Playground'
```

Inside the `Demo` component (after existing state declarations), add:

```tsx
const [mode, setMode] = useState<'carousel' | 'playground'>('carousel')
```

- [ ] **Step 2: Add mode toggle button in header area**

In the `<header className="flex-none px-8 pt-6 pb-3 relative z-10">` section, after the subtitle `<p>` element, add a mode toggle button:

```tsx
<div className="absolute top-6 right-8">
  <button
    onClick={() => setMode((m) => (m === 'carousel' ? 'playground' : 'carousel'))}
    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
    style={{
      backgroundColor: isDark ? '#1a1a1a' : '#f1f5f9',
      color: isDark ? '#c9a96e' : '#3b82f6',
      border: `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
    }}
  >
    {mode === 'carousel' ? 'Playground →' : '← Carousel'}
  </button>
</div>
```

- [ ] **Step 3: Add Playground render branch**

After the existing `<header>` element (the info header, not the Header component demo), and before `{/* Header component demo */}`, add:

```tsx
{mode === 'playground' && (
  <div className="flex-1 min-h-0">
    <Playground />
  </div>
)}

{mode === 'carousel' && (
  <>
```

Then wrap the existing carousel content (from `{/* Header component demo */}` through `{/* Bottom navigation */}`) in a fragment, and close it before the final `</div>` of the main container:

```tsx
  </>
)}
```

The structure should be:

```tsx
{/* Info header */}
<header>...</header>

{mode === 'playground' && <div className="flex-1 min-h-0"><Playground /></div>}

{mode === 'carousel' && (
  <>
    {/* Header component demo */}
    ...existing header demo...
    {/* Page content skeleton */}
    ...existing skeleton...
    {/* Bottom navigation */}
    ...existing navigation...
  </>
)}
```

- [ ] **Step 4: Verify dev server works**

Run:
```bash
npm run dev
```

Open the browser at the displayed URL (usually `http://localhost:5173`).

Verify:
1. Carousel mode loads correctly (existing behavior preserved).
2. Click **"Playground →"** button — the view switches to Playground mode.
3. Playground shows the variant button group at the top.
4. Clicking different variants switches the Header preview.
5. The right panel shows Colors, Typography, and Config sections.
6. Changing a color in the right panel updates the Header immediately.
7. Changing the "Show search" toggle hides/shows the search input in the Header.
8. Clicking **"Reset to Default"** reverts all changes.
9. Clicking **"← Carousel"** returns to carousel mode.

- [ ] **Step 5: Commit**

```bash
git add src/shopxComponent/Demo.tsx
git commit -m "feat: integrate Playground mode into Demo with mode toggle

Add carousel/playground mode switch to Demo.tsx. Playground mode
renders the interactive token editor with live header preview.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Self-Review

### Spec Coverage

| Spec Requirement | Task |
|---|---|
| Independent Playground mode | Task 4: Demo.tsx mode toggle |
| Top variant button group | Task 3: Playground.tsx variant selector |
| Right-side TokenEditor panel | Task 2: TokenEditor.tsx |
| Colors editing (7 color fields) | Task 2: TokenEditor Colors section |
| Typography editing (fontFamily) | Task 2: TokenEditor Typography section |
| Config editing (showSearch) | Task 2: TokenEditor Config section |
| Real-time preview | Task 3: Playground mergedTheme/mergedConfig |
| Reset to Default | Task 2: TokenEditor onReset |
| Variants don't clear overrides | Task 3: Playground state logic |

### Placeholder Scan

- No "TBD", "TODO", "implement later" found.
- No vague "add validation" or "handle edge cases" steps.
- Every step includes actual code or exact commands.

### Type Consistency

- `ThemeTokens` and `HeaderConfig` types are imported from existing project files.
- `Partial<ThemeTokens>` and `Partial<HeaderConfig>` used consistently for override state.
- Callback signatures match between TokenEditor props and Playground handlers.

---

## Notes

- The `demoNavigation` array is duplicated in Playground.tsx from Demo.tsx. This is intentional to keep Playground self-contained. If desired, it can be extracted to a shared module later.
- The `darkTheme` object is also duplicated from Demo.tsx for the same reason.
- The `SkeletonGrid` in Playground.tsx is a simplified inline copy of Demo's `SkeletonGrid`, adapted to accept dynamic background colors from the current theme.
