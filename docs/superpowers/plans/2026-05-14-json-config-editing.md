# JSON Config Editable System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete click-to-edit system for ShopX-Preview where users click page elements in edit mode to modify the underlying JSON config, with both manual hook binding and automatic Vite plugin injection.

**Architecture:** A React Context (`JsonConfigProvider`) holds the live config and editing state. Components use `useEditable()` hook or the Vite plugin auto-injects `__editable()` calls to mark elements as editable. Clicking an element opens an `InlineEditor` popover; saving calls `updateConfig(path, value)` which immutably updates the config via `setValueByPath`. A path string like `navigation.items[0].label` is parsed into segments and walked through nested objects/arrays.

**Tech Stack:** React 19, TypeScript, Vite, Vitest + Testing Library, Babel parser/traverse/generator (for the Vite plugin), Tailwind CSS, lucide-react.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/shopxComponent/editable/path.ts` | Path parsing and immutable deep updates (`parsePath`, `getValueByPath`, `setValueByPath`) |
| `src/shopxComponent/editable/context.tsx` | React context: config state, edit mode, editing target, `updateConfig` / `startEditing` / `cancelEditing` |
| `src/shopxComponent/editable/runtime.ts` | `__editable()` runtime function (auto-injected by plugin) and `useEditable()` hook for manual binding |
| `src/shopxComponent/editable/InlineEditor.tsx` | Popover editor that appears next to clicked element; handles text and color input types |
| `src/shopxComponent/editable/index.ts` | Public API exports |
| `vite-plugin-shopx-editable.ts` | Vite plugin that parses TSX/JSX AST, tracks `.map()` scope chains, and auto-injects `__editable()` spread attributes |
| `src/shopxComponent/DemoHeader.tsx` | Demo ShopX-UI header component with nested navigation arrays (plugin auto-injects editable marks) |
| `src/shopxComponent/EditableDemo.tsx` | Demo page wiring up `JsonConfigProvider`, edit toggle, `InlineEditor`, and live JSON preview |
| `src/index.css` | `.shopx-editable` outline styles |
| `src/shopxComponent/__tests__/path.test.ts` | Unit tests for path utilities |
| `src/shopxComponent/__tests__/context.test.tsx` | Tests for `JsonConfigProvider` and `useJsonConfig` |
| `src/shopxComponent/__tests__/runtime.test.tsx` | Tests for `__editable` and `useEditable` |
| `src/shopxComponent/__tests__/InlineEditor.test.tsx` | Tests for the inline editor popover |
| `src/shopxComponent/__tests__/vite-plugin.test.ts` | Tests for Vite plugin AST transformations |
| `src/shopxComponent/__tests__/EditableDemo.test.tsx` | Integration tests for the full demo flow |
| `src/__tests__/App.test.tsx` | Top-level App render test (update existing) |

---

## Task 1: Path Utilities (`path.ts`)

**Files:**
- Exists: `src/shopxComponent/editable/path.ts`
- Create: `src/shopxComponent/__tests__/path.test.ts`

**Goal:** Verify `parsePath`, `getValueByPath`, and `setValueByPath` with comprehensive unit tests.

- [ ] **Step 1: Write failing tests for `parsePath`**

```ts
import { describe, it, expect } from 'vitest'
import { parsePath, getValueByPath, setValueByPath } from '../editable/path'

describe('parsePath', () => {
  it('parses simple property path', () => {
    expect(parsePath('title')).toEqual(['title'])
  })

  it('parses nested property path', () => {
    expect(parsePath('navigation.items')).toEqual(['navigation', 'items'])
  })

  it('parses array index notation', () => {
    expect(parsePath('items[0]')).toEqual(['items', 0])
  })

  it('parses mixed nested arrays and properties', () => {
    expect(parsePath('navigation.items[0].children[2].label')).toEqual([
      'navigation', 'items', 0, 'children', 2, 'label',
    ])
  })

  it('parses multiple consecutive indices', () => {
    expect(parsePath('grid[3][4]')).toEqual(['grid', 3, 4])
  })

  it('returns empty array for empty string', () => {
    expect(parsePath('')).toEqual([])
  })

  it('handles leading dot gracefully', () => {
    expect(parsePath('.title')).toEqual(['title'])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/shopxComponent/__tests__/path.test.ts`
Expected: FAIL — `path.test.ts` not found or module not found (the test file doesn't exist yet)

- [ ] **Step 3: Create test file and re-run**

Create `src/shopxComponent/__tests__/path.test.ts` with the code from Step 1.

Run: `npx vitest run src/shopxComponent/__tests__/path.test.ts`
Expected: PASS for `parsePath` tests (implementation already exists)

- [ ] **Step 4: Write failing tests for `getValueByPath`**

Append to `src/shopxComponent/__tests__/path.test.ts`:

```ts
describe('getValueByPath', () => {
  const obj = {
    title: 'ShopX',
    navigation: {
      items: [
        { label: 'Home', children: [{ label: 'Sub' }] },
        { label: 'About' },
      ],
    },
  }

  it('gets top-level value', () => {
    expect(getValueByPath(obj, 'title')).toBe('ShopX')
  })

  it('gets nested object value', () => {
    expect(getValueByPath(obj, 'navigation.items')).toEqual(obj.navigation.items)
  })

  it('gets array element by index', () => {
    expect(getValueByPath(obj, 'navigation.items[0].label')).toBe('Home')
  })

  it('gets deeply nested array value', () => {
    expect(getValueByPath(obj, 'navigation.items[0].children[0].label')).toBe('Sub')
  })

  it('returns undefined for missing path', () => {
    expect(getValueByPath(obj, 'missing.path')).toBeUndefined()
  })

  it('returns undefined for out-of-bounds index', () => {
    expect(getValueByPath(obj, 'navigation.items[99]')).toBeUndefined()
  })

  it('returns undefined for null intermediate', () => {
    expect(getValueByPath({ a: null }, 'a.b')).toBeUndefined()
  })
})
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/shopxComponent/__tests__/path.test.ts`
Expected: PASS for all `getValueByPath` tests

- [ ] **Step 6: Write failing tests for `setValueByPath`**

Append to `src/shopxComponent/__tests__/path.test.ts`:

```ts
describe('setValueByPath', () => {
  it('sets top-level value', () => {
    const result = setValueByPath({ title: 'Old' }, 'title', 'New')
    expect(result).toEqual({ title: 'New' })
  })

  it('sets nested object value', () => {
    const result = setValueByPath(
      { nav: { items: [] } },
      'nav.items',
      [{ label: 'Home' }]
    )
    expect(result).toEqual({ nav: { items: [{ label: 'Home' }] } })
  })

  it('sets array element by index', () => {
    const result = setValueByPath(
      { items: [{ label: 'Old' }] },
      'items[0].label',
      'New'
    )
    expect(result).toEqual({ items: [{ label: 'New' }] })
  })

  it('does not mutate original object', () => {
    const original = { title: 'Old', other: 'preserved' }
    const result = setValueByPath(original, 'title', 'New')
    expect(original.title).toBe('Old')
    expect(result.other).toBe('preserved')
  })

  it('shares unmodified branches', () => {
    const branch = { keep: true }
    const original = { a: branch, b: { c: 'change' } }
    const result = setValueByPath(original, 'b.c', 'changed')
    expect(result.a).toBe(branch)
  })

  it('sets deeply nested array value', () => {
    const original = {
      nav: { items: [{ children: [{ label: 'Old' }] }] },
    }
    const result = setValueByPath(
      original,
      'nav.items[0].children[0].label',
      'New'
    )
    expect(result.nav.items[0].children[0].label).toBe('New')
  })
})
```

- [ ] **Step 7: Run tests**

Run: `npx vitest run src/shopxComponent/__tests__/path.test.ts`
Expected: PASS for all tests

- [ ] **Step 8: Commit**

```bash
git add src/shopxComponent/__tests__/path.test.ts
git commit -m "test: add path utility unit tests"
```

---

## Task 2: JsonConfigContext (`context.tsx`)

**Files:**
- Exists: `src/shopxComponent/editable/context.tsx`
- Create: `src/shopxComponent/__tests__/context.test.tsx`

**Goal:** Test the context provider: config updates, mode toggling, editing target lifecycle.

- [ ] **Step 1: Write failing test for provider render**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { JsonConfigProvider, useJsonConfig } from '../editable/context'

function TestConsumer() {
  const { config, mode, setMode, updateConfig, editingTarget, startEditing, cancelEditing } = useJsonConfig()
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="title">{String(config.title ?? '')}</span>
      <span data-testid="editing">{editingTarget ? editingTarget.path : 'none'}</span>
      <button data-testid="toggle" onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}>
        Toggle
      </button>
      <button data-testid="update" onClick={() => updateConfig('title', 'Updated')}>
        Update
      </button>
      <button
        data-testid="start"
        onClick={() =>
          startEditing({ path: 'title', type: 'text', rect: new DOMRect() })
        }
      >
        Start
      </button>
      <button data-testid="cancel" onClick={cancelEditing}>
        Cancel
      </button>
    </div>
  )
}

describe('JsonConfigProvider', () => {
  it('provides initial config values', () => {
    render(
      <JsonConfigProvider initialConfig={{ title: 'ShopX' }}>
        <TestConsumer />
      </JsonConfigProvider>
    )
    expect(screen.getByTestId('mode')).toHaveTextContent('preview')
    expect(screen.getByTestId('title')).toHaveTextContent('ShopX')
    expect(screen.getByTestId('editing')).toHaveTextContent('none')
  })

  it('throws when useJsonConfig is used outside provider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useJsonConfig must be used within JsonConfigProvider')
    spy.mockRestore()
  })
})
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/context.test.tsx`
Expected: PASS

- [ ] **Step 3: Write failing test for mode toggle**

Append to `src/shopxComponent/__tests__/context.test.tsx`:

```tsx
  it('toggles mode between preview and edit', () => {
    render(
      <JsonConfigProvider initialConfig={{ title: 'ShopX' }}>
        <TestConsumer />
      </JsonConfigProvider>
    )
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('mode')).toHaveTextContent('edit')
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('mode')).toHaveTextContent('preview')
  })
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/context.test.tsx`
Expected: PASS

- [ ] **Step 5: Write failing test for config update**

Append:

```tsx
  it('updates config immutably via updateConfig', () => {
    render(
      <JsonConfigProvider initialConfig={{ title: 'ShopX', nav: { items: [] } }}>
        <TestConsumer />
      </JsonConfigProvider>
    )
    fireEvent.click(screen.getByTestId('update'))
    expect(screen.getByTestId('title')).toHaveTextContent('Updated')
  })
```

- [ ] **Step 6: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/context.test.tsx`
Expected: PASS

- [ ] **Step 7: Write failing test for editing target lifecycle**

Append:

```tsx
  it('starts and cancels editing', () => {
    render(
      <JsonConfigProvider initialConfig={{ title: 'ShopX' }}>
        <TestConsumer />
      </JsonConfigProvider>
    )
    fireEvent.click(screen.getByTestId('start'))
    expect(screen.getByTestId('editing')).toHaveTextContent('title')
    fireEvent.click(screen.getByTestId('cancel'))
    expect(screen.getByTestId('editing')).toHaveTextContent('none')
  })
```

- [ ] **Step 8: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/context.test.tsx`
Expected: PASS

- [ ] **Step 9: Write failing test for nested config update**

Append:

```tsx
  it('updates nested array paths', () => {
    function NestedConsumer() {
      const { config, updateConfig } = useJsonConfig()
      return (
        <div>
          <span data-testid="label">{String(config.nav?.items?.[0]?.label ?? '')}</span>
          <button
            data-testid="nested-update"
            onClick={() => updateConfig('nav.items[0].label', 'Changed')}
          >
            Update
          </button>
        </div>
      )
    }
    render(
      <JsonConfigProvider initialConfig={{ nav: { items: [{ label: 'Home' }] } }}>
        <NestedConsumer />
      </JsonConfigProvider>
    )
    fireEvent.click(screen.getByTestId('nested-update'))
    expect(screen.getByTestId('label')).toHaveTextContent('Changed')
  })
```

- [ ] **Step 10: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/context.test.tsx`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add src/shopxComponent/__tests__/context.test.tsx
git commit -m "test: add JsonConfigContext unit tests"
```

---

## Task 3: Runtime (`runtime.ts`) — `__editable` and `useEditable`

**Files:**
- Exists: `src/shopxComponent/editable/runtime.ts`
- Create: `src/shopxComponent/__tests__/runtime.test.tsx`

**Goal:** Test that `__editable` and `useEditable` return correct props in edit vs preview mode, and that clicking triggers `startEditing`.

- [ ] **Step 1: Write failing test for preview mode returns empty props**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { JsonConfigProvider, useJsonConfig } from '../editable/context'
import { __editable, useEditable } from '../editable/runtime'

function PreviewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <JsonConfigProvider initialConfig={{ title: 'ShopX' }}>
      {children}
    </JsonConfigProvider>
  )
}

describe('__editable', () => {
  it('returns noop props in preview mode', () => {
    function TestComponent() {
      const props = __editable('title')
      return <span data-testid="props">{JSON.stringify(props)}</span>
    }
    render(
      <PreviewWrapper>
        <TestComponent />
      </PreviewWrapper>
    )
    const text = screen.getByTestId('props').textContent
    const props = JSON.parse(text!)
    expect(props['data-editable-path']).toBe('')
    expect(props.className).toBe('')
  })
})
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/runtime.test.tsx`
Expected: FAIL — file not found

- [ ] **Step 3: Create test file and run**

Create `src/shopxComponent/__tests__/runtime.test.tsx`.

Run: `npx vitest run src/shopxComponent/__tests__/runtime.test.tsx`
Expected: PASS

- [ ] **Step 4: Write failing test for edit mode returns editable props**

Append:

```tsx
  it('returns editable props in edit mode', () => {
    function TestComponent() {
      const { setMode } = useJsonConfig()
      const props = __editable('title')
      return (
        <div>
          <button data-testid="enter-edit" onClick={() => setMode('edit')}>
            Edit
          </button>
          <span data-testid="path">{props['data-editable-path']}</span>
          <span data-testid="class">{props.className}</span>
        </div>
      )
    }
    render(
      <PreviewWrapper>
        <TestComponent />
      </PreviewWrapper>
    )
    fireEvent.click(screen.getByTestId('enter-edit'))
    expect(screen.getByTestId('path')).toHaveTextContent('title')
    expect(screen.getByTestId('class')).toHaveTextContent('shopx-editable')
  })
```

- [ ] **Step 5: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/runtime.test.tsx`
Expected: PASS

- [ ] **Step 6: Write failing test for click triggers startEditing**

Append:

```tsx
  it('clicking calls startEditing with correct target', () => {
    function TestComponent() {
      const { setMode, editingTarget } = useJsonConfig()
      const props = __editable('navigation.items[0].label', { type: 'text', label: 'Nav Label' })
      return (
        <div>
          <button data-testid="enter-edit" onClick={() => setMode('edit')}>
            Edit
          </button>
          <span data-testid="target">{editingTarget ? editingTarget.path : 'none'}</span>
          <span data-testid="clickable" {...props}>
            Click me
          </span>
        </div>
      )
    }
    render(
      <PreviewWrapper>
        <TestComponent />
      </PreviewWrapper>
    )
    fireEvent.click(screen.getByTestId('enter-edit'))
    fireEvent.click(screen.getByTestId('clickable'))
    expect(screen.getByTestId('target')).toHaveTextContent('navigation.items[0].label')
  })
```

- [ ] **Step 7: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/runtime.test.tsx`
Expected: PASS

- [ ] **Step 8: Write failing test for `useEditable` hook**

Append:

```tsx
describe('useEditable', () => {
  it('bind returns noop in preview mode', () => {
    function TestComponent() {
      const { bind } = useEditable()
      const props = bind('title')
      return <span data-testid="class">{props.className}</span>
    }
    render(
      <PreviewWrapper>
        <TestComponent />
      </PreviewWrapper>
    )
    expect(screen.getByTestId('class')).toHaveTextContent('')
  })

  it('bind returns editable props in edit mode', () => {
    function TestComponent() {
      const { setMode } = useJsonConfig()
      const { bind, isEditing } = useEditable()
      const props = bind('title', { type: 'color' })
      return (
        <div>
          <button data-testid="enter-edit" onClick={() => setMode('edit')}>
            Edit
          </button>
          <span data-testid="editing">{isEditing ? 'yes' : 'no'}</span>
          <span data-testid="path">{props['data-editable-path']}</span>
          <span data-testid="type">{props.title}</span>
        </div>
      )
    }
    render(
      <PreviewWrapper>
        <TestComponent />
      </PreviewWrapper>
    )
    fireEvent.click(screen.getByTestId('enter-edit'))
    expect(screen.getByTestId('editing')).toHaveTextContent('yes')
    expect(screen.getByTestId('path')).toHaveTextContent('title')
    expect(screen.getByTestId('type')).toContainHTML('color')
  })
})
```

- [ ] **Step 9: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/runtime.test.tsx`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/shopxComponent/__tests__/runtime.test.tsx
git commit -m "test: add runtime (__editable, useEditable) unit tests"
```

---

## Task 4: InlineEditor Component

**Files:**
- Exists: `src/shopxComponent/editable/InlineEditor.tsx`
- Create: `src/shopxComponent/__tests__/InlineEditor.test.tsx`

**Goal:** Test that InlineEditor renders only when there's an editing target, displays the current value, and calls `updateConfig` + `cancelEditing` on save.

- [ ] **Step 1: Write failing test for hidden when no target**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { JsonConfigProvider, useJsonConfig } from '../editable/context'
import InlineEditor from '../editable/InlineEditor'

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <JsonConfigProvider initialConfig={{ title: 'ShopX', color: '#3b82f6' }}>
      {children}
    </JsonConfigProvider>
  )
}

describe('InlineEditor', () => {
  it('does not render when no editing target', () => {
    render(
      <TestWrapper>
        <InlineEditor />
      </TestWrapper>
    )
    expect(document.querySelector('input')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/InlineEditor.test.tsx`
Expected: PASS

- [ ] **Step 3: Write failing test for text input rendering**

Append:

```tsx
  it('renders text input when editing target is active', () => {
    function Trigger() {
      const { setMode, startEditing } = useJsonConfig()
      return (
        <button
          data-testid="trigger"
          onClick={() => {
            setMode('edit')
            startEditing({ path: 'title', type: 'text', rect: new DOMRect(0, 0, 100, 20) })
          }}
        >
          Trigger
        </button>
      )
    }
    render(
      <TestWrapper>
        <Trigger />
        <InlineEditor />
      </TestWrapper>
    )
    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByRole('textbox')).toHaveValue('ShopX')
  })
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/InlineEditor.test.tsx`
Expected: PASS

- [ ] **Step 5: Write failing test for save on Enter**

Append:

```tsx
  it('saves value and closes on Enter key', () => {
    function Consumer() {
      const { config, setMode, startEditing, editingTarget } = useJsonConfig()
      return (
        <div>
          <span data-testid="title">{String(config.title)}</span>
          <span data-testid="editing">{editingTarget ? 'yes' : 'no'}</span>
          <button
            data-testid="trigger"
            onClick={() => {
              setMode('edit')
              startEditing({ path: 'title', type: 'text', rect: new DOMRect(0, 0, 100, 20) })
            }}
          >
            Trigger
          </button>
          <InlineEditor />
        </div>
      )
    }
    render(
      <TestWrapper>
        <Consumer />
      </TestWrapper>
    )
    fireEvent.click(screen.getByTestId('trigger'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'New Title' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByTestId('title')).toHaveTextContent('New Title')
    expect(screen.getByTestId('editing')).toHaveTextContent('no')
  })
```

- [ ] **Step 6: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/InlineEditor.test.tsx`
Expected: PASS

- [ ] **Step 7: Write failing test for cancel on Escape**

Append:

```tsx
  it('closes without saving on Escape key', () => {
    function Consumer() {
      const { config, setMode, startEditing, editingTarget } = useJsonConfig()
      return (
        <div>
          <span data-testid="title">{String(config.title)}</span>
          <span data-testid="editing">{editingTarget ? 'yes' : 'no'}</span>
          <button
            data-testid="trigger"
            onClick={() => {
              setMode('edit')
              startEditing({ path: 'title', type: 'text', rect: new DOMRect(0, 0, 100, 20) })
            }}
          >
            Trigger
          </button>
          <InlineEditor />
        </div>
      )
    }
    render(
      <TestWrapper>
        <Consumer />
      </TestWrapper>
    )
    fireEvent.click(screen.getByTestId('trigger'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Unsaved' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.getByTestId('title')).toHaveTextContent('ShopX')
    expect(screen.getByTestId('editing')).toHaveTextContent('no')
  })
```

- [ ] **Step 8: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/InlineEditor.test.tsx`
Expected: PASS

- [ ] **Step 9: Write failing test for color type**

Append:

```tsx
  it('renders color picker for color type', () => {
    function Trigger() {
      const { setMode, startEditing } = useJsonConfig()
      return (
        <button
          data-testid="trigger"
          onClick={() => {
            setMode('edit')
            startEditing({ path: 'color', type: 'color', rect: new DOMRect(0, 0, 100, 20) })
          }}
        >
          Trigger
        </button>
      )
    }
    render(
      <TestWrapper>
        <Trigger />
        <InlineEditor />
      </TestWrapper>
    )
    fireEvent.click(screen.getByTestId('trigger'))
    expect(screen.getByDisplayValue('#3b82f6')).toBeInTheDocument()
  })
```

- [ ] **Step 10: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/InlineEditor.test.tsx`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add src/shopxComponent/__tests__/InlineEditor.test.tsx
git commit -m "test: add InlineEditor component tests"
```

---

## Task 5: Vite Plugin AST Transformation

**Files:**
- Exists: `vite-plugin-shopx-editable.ts`
- Create: `src/shopxComponent/__tests__/vite-plugin.test.ts`

**Goal:** Test that the Vite plugin correctly transforms TSX source by injecting `__editable()` spread attributes on JSX elements that reference config properties inside `.map()` callbacks.

- [ ] **Step 1: Write failing test for simple config property injection**

```ts
import { describe, it, expect } from 'vitest'
import shopxEditable from '../../../vite-plugin-shopx-editable'

describe('vite-plugin-shopx-editable', () => {
  const plugin = shopxEditable({
    importSource: '@shopx/editable',
    configParamName: 'config',
  })

  function transform(code: string, id: string = 'test.tsx') {
    return (plugin as any).transform(code, id)
  }

  it('injects __editable on JSX element with config.title', () => {
    const source = `
      function Header({ config }) {
        return <span>{config.title}</span>
      }
    `
    const result = transform(source)
    expect(result).toBeDefined()
    expect(result.code).toContain('__editable')
    expect(result.code).toContain('data-editable-path')
  })
})
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/vite-plugin.test.ts`
Expected: FAIL — file not found, or the plugin doesn't handle bare `config.title` in JSXExpressionContainer (the plugin only handles MemberExpression inside JSXExpressionContainer when parent is JSXElement; `config.title` should be caught by `resolveMemberPath` but `resolveRoot` returns `[]` for `configParamName` which is correct, then `chain.parts` = `['title']`, but wait — `config.title` is not inside a `.map()` callback, so `scopeStack` is empty. The `resolveMemberPath` function only looks up `scopeStack` for tracked vars, it doesn't handle direct `config.xxx` access. The plugin's `JSXExpressionContainer` handler calls `resolveMemberPath` which returns `null` for direct config access. This is a gap in the existing plugin implementation.)

Actually, let me re-read the plugin code more carefully...

In `JSXExpressionContainer`:
```ts
const expression = exprPath.node.expression
if (!t.isMemberExpression(expression)) return
const segments = resolveMemberPath(expression, scopeStack)
if (!segments) return
```

`resolveMemberPath` walks the member chain, then looks in `scopeStack` for a matching var. If not found, it returns `null`. It does NOT check if the root is `configParamName`.

So the plugin currently only handles expressions inside `.map()` callbacks, NOT bare `config.title`. This is a bug/gap. The spec says `config.title` should work. We need to fix the plugin.

Let me update the plan to include fixing this gap.

- [ ] **Step 3: Fix `resolveMemberPath` to handle direct config access**

Modify `vite-plugin-shopx-editable.ts` at the end of `resolveMemberPath`:

```ts
  // Direct config access: config.title → ['title']
  if (current.name === configParamName) {
    return properties
  }

  return null
}
```

Wait, `resolveMemberPath` doesn't have access to `configParamName`. We need to pass it in. Also need to update the call site in `JSXExpressionContainer`.

Actually, looking at the code again, `resolveMemberPath` is defined without `configParamName`. We need to add it as a parameter and update the call.

Let me trace through the code:
1. `resolveMemberPath(expr, scopeStack)` — doesn't know about `configParamName`
2. It checks `scopeStack` for tracked vars
3. If root is `configParamName`, it returns `null` instead of the properties

This is indeed a bug. The fix is:

In `resolveMemberPath`, add `configParamName` parameter, and at the end:
```ts
  if (current.name === configParamName) {
    return properties
  }
  return null
```

Then update the call in `JSXExpressionContainer`:
```ts
const segments = resolveMemberPath(expression, scopeStack, configParamName)
```

But we also need to handle the case where the member chain comes from `config.navigation.items` (not inside a map). In that case, `properties` would be `['navigation', 'items']` and we'd return that. But the plugin's `injectEditableAttribute` expects a `JSXElement` parent, and the `JSXExpressionContainer` visitor checks `if (!t.isJSXElement(exprPath.parent)) return`. So for `{config.title}` inside a `<span>`, `exprPath.parent` is the `<span>` JSXElement, which is correct.

But wait — `walkMemberChain` only walks `MemberExpression` chains. For `config.title`, it would return `{ root: Identifier('config'), parts: ['title'] }`. Then in `resolveMemberPath`, we walk the chain again to get `properties`. This is duplicated work. But for now, the simplest fix is to add the `configParamName` check.

Actually, I realize I need to be more careful. The `resolveMemberPath` function currently:
1. Walks member chain to get `properties` array
2. Checks if `current` (the root identifier) matches any scope var
3. If not, returns `null`

For `config.title`, `current` is `config` which doesn't match any scope var, so it returns `null`.

The fix: pass `configParamName` to `resolveMemberPath` and check at the end.

Let me write this into the plan properly.

Actually, I should also consider: does the plugin handle `config.title` correctly in terms of what it produces? The `segmentsToTemplateLiteral` function would take `['title']` and produce a template literal with quasis `['title']` and expressions `[]`. That's a valid template literal (just one quasi, no expressions). But wait — `segmentsToTemplateLiteral` always returns a `TemplateLiteral`, and `injectEditableAttribute` wraps it in `__editable(pathTemplate)`. So we'd get `__editable(\`title\`)` which is fine.

OK let me write the plan steps.

- [ ] **Step 3: Fix `resolveMemberPath` to handle direct `config.xxx` access**

Edit `vite-plugin-shopx-editable.ts`. First, update the function signature and add the config check:

Old:
```ts
function resolveMemberPath(
  expr: t.MemberExpression,
  scopeStack: MapScope[],
): PathSegment[] | null {
```

New:
```ts
function resolveMemberPath(
  expr: t.MemberExpression,
  scopeStack: MapScope[],
  configParamName: string,
): PathSegment[] | null {
```

At the end of `resolveMemberPath`, replace:
```ts
  // Direct config access: config.title → ['title']
  // We don't track this here since it's not in a .map callback,
  // but for standalone config.xxx references we support it.
  // Check if it's the configParamName
  return null
}
```

With:
```ts
  // Direct config access: config.title → ['title']
  if (current.name === configParamName) {
    return properties
  }

  return null
}
```

Then update the call site in the `JSXExpressionContainer` visitor:

Old:
```ts
          const segments = resolveMemberPath(expression, scopeStack)
```

New:
```ts
          const segments = resolveMemberPath(expression, scopeStack, configParamName)
```

- [ ] **Step 4: Re-run test after fix**

Run: `npx vitest run src/shopxComponent/__tests__/vite-plugin.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing test for nested map injection**

Append:

```ts
  it('injects __editable for item.label inside config.items.map', () => {
    const source = `
      function Header({ config }) {
        return (
          <nav>
            {config.navigation.items.map((item, i) => (
              <span key={i}>{item.label}</span>
            ))}
          </nav>
        )
      }
    `
    const result = transform(source)
    expect(result).toBeDefined()
    expect(result.code).toContain('__editable(`navigation.items[${i}].label`)')
  })
```

- [ ] **Step 6: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/vite-plugin.test.ts`
Expected: PASS

- [ ] **Step 7: Write failing test for double-nested map injection**

Append:

```ts
  it('injects __editable for child.label inside nested maps', () => {
    const source = `
      function Header({ config }) {
        return (
          <nav>
            {config.navigation.items.map((item, i) => (
              <div key={i}>
                <span>{item.label}</span>
                {item.children?.map((child, j) => (
                  <span key={j}>{child.label}</span>
                ))}
              </div>
            ))}
          </nav>
        )
      }
    `
    const result = transform(source)
    expect(result).toBeDefined()
    expect(result.code).toContain('__editable(`navigation.items[${i}].label`)')
    expect(result.code).toContain('__editable(`navigation.items[${i}].children[${j}].label`)')
  })
```

- [ ] **Step 8: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/vite-plugin.test.ts`
Expected: PASS

- [ ] **Step 9: Write failing test for import injection**

Append:

```ts
  it('injects import for __editable when transformations occur', () => {
    const source = `
      function Header({ config }) {
        return <span>{config.title}</span>
      }
    `
    const result = transform(source)
    expect(result.code).toContain('import { __editable } from "@shopx/editable"')
  })
```

- [ ] **Step 10: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/vite-plugin.test.ts`
Expected: PASS

- [ ] **Step 11: Write failing test for no transform when no config refs**

Append:

```ts
  it('returns undefined when no transformations needed', () => {
    const source = `
      function Header({ data }) {
        return <span>{data.title}</span>
      }
    `
    const result = transform(source)
    expect(result).toBeUndefined()
  })
```

- [ ] **Step 12: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/vite-plugin.test.ts`
Expected: PASS

- [ ] **Step 13: Write failing test for skip files not matching include pattern**

Append:

```ts
  it('skips non-tsx files', () => {
    const source = `
      function Header({ config }) {
        return <span>{config.title}</span>
      }
    `
    const result = transform(source, 'test.css')
    expect(result).toBeUndefined()
  })
```

- [ ] **Step 14: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/vite-plugin.test.ts`
Expected: PASS

- [ ] **Step 15: Commit**

```bash
git add src/shopxComponent/__tests__/vite-plugin.test.ts vite-plugin-shopx-editable.ts
git commit -m "test: add Vite plugin AST transformation tests + fix direct config access"
```

---

## Task 6: Integration — EditableDemo End-to-End Flow

**Files:**
- Exists: `src/shopxComponent/EditableDemo.tsx`
- Create: `src/shopxComponent/__tests__/EditableDemo.test.tsx`

**Goal:** Test the full user flow: enter edit mode → click an editable element → type new value → save → see updated config.

- [ ] **Step 1: Write failing test for entering edit mode**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EditableDemo from '../EditableDemo'

describe('EditableDemo integration', () => {
  it('renders in preview mode by default', () => {
    render(<EditableDemo />)
    expect(screen.getByText('Enter Edit Mode')).toBeInTheDocument()
  })

  it('enters edit mode when toggle is clicked', () => {
    render(<EditableDemo />)
    fireEvent.click(screen.getByText('Enter Edit Mode'))
    expect(screen.getByText('Exit Edit Mode')).toBeInTheDocument()
    expect(screen.getByText('Edit Mode — click any outlined element to edit')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/EditableDemo.test.tsx`
Expected: PASS

- [ ] **Step 3: Write failing test for editing a value**

Append:

```tsx
  it('edits config title and reflects in header', () => {
    render(<EditableDemo />)
    fireEvent.click(screen.getByText('Enter Edit Mode'))

    // Find the title element (it should have shopx-editable class in edit mode)
    // The DemoHeader renders config.title inside an <a> tag
    const titleLink = screen.getByText('ShopX')
    fireEvent.click(titleLink)

    // InlineEditor should appear
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'NewBrand' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Header should reflect new value
    expect(screen.getByText('NewBrand')).toBeInTheDocument()
  })
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/EditableDemo.test.tsx`
Expected: PASS

- [ ] **Step 5: Write failing test for JSON preview updates**

Append:

```tsx
  it('updates JSON preview after edit', () => {
    render(<EditableDemo />)
    fireEvent.click(screen.getByText('Enter Edit Mode'))

    const titleLink = screen.getByText('ShopX')
    fireEvent.click(titleLink)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'UpdatedShop' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // JSON preview should contain the updated value
    expect(screen.getByText(/UpdatedShop/)).toBeInTheDocument()
  })
```

- [ ] **Step 6: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/EditableDemo.test.tsx`
Expected: PASS

- [ ] **Step 7: Write failing test for cancel edit**

Append:

```tsx
  it('does not change value when editing is cancelled', () => {
    render(<EditableDemo />)
    fireEvent.click(screen.getByText('Enter Edit Mode'))

    const titleLink = screen.getByText('ShopX')
    fireEvent.click(titleLink)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Ignored' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
    expect(screen.getByText('ShopX')).toBeInTheDocument()
  })
```

- [ ] **Step 8: Run test**

Run: `npx vitest run src/shopxComponent/__tests__/EditableDemo.test.tsx`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/shopxComponent/__tests__/EditableDemo.test.tsx
git commit -m "test: add EditableDemo integration tests"
```

---

## Task 7: Update App.test.tsx

**Files:**
- Exists: `src/__tests__/App.test.tsx`
- Modify: `src/__tests__/App.test.tsx`

**Goal:** Fix the existing App test which still mocks the old `Demo` component. App now renders `EditableDemo`.

- [ ] **Step 1: Write failing updated test**

Replace the contents of `src/__tests__/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders EditableDemo', () => {
    render(<App />)
    expect(screen.getByText('ShopX')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/__tests__/App.test.tsx`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/App.test.tsx
git commit -m "test: update App.test.tsx for EditableDemo"
```

---

## Task 8: Full Test Suite & Dev Server Verification

**Files:**
- All test files above
- Exists: `src/shopxComponent/EditableDemo.tsx`

**Goal:** Run the full test suite and verify the dev server renders the demo correctly.

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Start dev server and verify in browser**

Run: `npm run dev` (in background or separate terminal)
Open `http://localhost:5173` in browser.

Verify:
1. Page shows the ShopX header with navigation
2. Click "Enter Edit Mode" button → header elements get blue dashed outlines
3. Click "ShopX" title → inline text editor appears
4. Type "NewBrand" and press Enter → title updates to "NewBrand"
5. JSON preview at bottom shows updated `title: "NewBrand"`
6. Click "Exit Edit Mode" → outlines disappear

- [ ] **Step 3: Commit**

```bash
git commit --allow-empty -m "chore: verify full test suite and dev server"
```

---

## Self-Review

### 1. Spec Coverage

| Spec Section | Implementing Task |
|-------------|------------------|
| Path format (`navigation.items[0].children[2].label`) | Task 1 |
| `parsePath` function | Task 1 — tested |
| `setValueByPath` immutable update | Task 1 — tested |
| `JsonConfigContext` with `config`, `updateConfig`, `mode`, `setMode` | Task 2 — tested |
| `useEditable()` hook + `bind()` | Task 3 — tested |
| `__editable()` runtime | Task 3 — tested |
| `InlineEditor` popover (text + color) | Task 4 — tested |
| Vite plugin: scope tracking for `.map()` | Task 5 — tested |
| Vite plugin: nested map path resolution | Task 5 — tested |
| Vite plugin: import injection | Task 5 — tested |
| Vite plugin: direct `config.xxx` access | Task 5 — fixed + tested |
| DemoHeader auto-injection via plugin | Task 6 — integration tested |
| EditableDemo full flow | Task 6 — integration tested |

**Gap found during review:** The Vite plugin did not handle direct `config.title` access (outside `.map()` callbacks). Fixed in Task 5 Step 3.

### 2. Placeholder Scan

- No "TBD", "TODO", "implement later" found.
- No "Add appropriate error handling" placeholders.
- All test code is complete with assertions.
- No "Similar to Task N" references.
- All steps include actual code or exact commands.

### 3. Type Consistency

- `BindOptions.type`: `'text' | 'color' | 'image' | 'select'` — consistent across runtime.ts and spec.
- `EditingTarget.type`: same union — consistent across context.tsx and spec.
- `updateConfig(path: string, value: unknown)` — consistent in context and all tests.
- `setValueByPath(obj: any, path: string, value: any)` — consistent.
- `configParamName` default `'config'` — consistent in plugin and vite.config.ts.

All type signatures match between implementation and tests.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-14-json-config-editing.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for review.

**Which approach?**
