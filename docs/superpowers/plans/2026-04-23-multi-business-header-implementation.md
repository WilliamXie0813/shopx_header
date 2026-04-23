# Multi-Business Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 6 independent e-commerce Header components (Essential, Fashion, Collection, Luxe Vault, Impulse, Card Market) with a shared color-derivation system, each with distinct visual styles driven by external `headerBg` and `headerText` props.

**Architecture:** Each Header lives in its own directory with a `theme.ts` (color derivation) and `Header.tsx` (component). Shared `types.ts` and `utils.ts` provide the common interface and HSL-based color math. All internal colors derive from the two external props.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 + Vite. Testing: Vitest + React Testing Library.

---

## File Structure

```
src/headers/
├── types.ts                 # Shared HeaderProps, MenuItem, HeaderTheme
├── utils.ts                 # Color derivation utilities (hexToHsl, deriveColors)
├── essential/
│   ├── EssentialHeader.tsx  # Zero-decoration functional header
│   ├── essential.theme.ts   # Minimal accent + derivation
│   └── EssentialHeader.test.tsx
├── collection/
│   ├── CollectionHeader.tsx # Editorial, serif, whitespace
│   ├── collection.theme.ts  # Burgundy accent, elegant spacing
│   └── CollectionHeader.test.tsx
├── fashion/
│   ├── FashionHeader.tsx    # Bold, neon, magnetic hover
│   ├── fashion.theme.ts     # Pink/cyan accent, energetic
│   └── FashionHeader.test.tsx
├── luxe-vault/
│   ├── LuxeVaultHeader.tsx  # Dark, gold, refined
│   ├── luxe-vault.theme.ts  # Champagne gold accent, thin type
│   └── LuxeVaultHeader.test.tsx
├── impulse/
│   ├── ImpulseHeader.tsx    # Promo bar, red urgency
│   ├── impulse.theme.ts     # Red/yellow accent, fast motion
│   └── ImpulseHeader.test.tsx
└── card-market/
    ├── CardMarketHeader.tsx # Gaming, rarity shimmer
    ├── card-market.theme.ts # Purple/gold accent, overdrive
    └── CardMarketHeader.test.tsx
```

---

## Task 1: Install Testing Framework

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install Vitest and testing libraries**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected: packages installed successfully.

- [ ] **Step 2: Add test script to package.json**

Modify `package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest"
}
```

- [ ] **Step 3: Create Vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Verify tests run**

Run:
```bash
npx vitest run --reporter=verbose
```

Expected: "No test files found, exiting with code 0" (or similar empty run).

- [ ] **Step 6: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts
git commit -m "test: add vitest and react testing library"
```

---

## Task 2: Shared Types and Color Utilities

**Files:**
- Create: `src/headers/types.ts`
- Create: `src/headers/utils.ts`
- Create: `src/headers/utils.test.ts`

- [ ] **Step 1: Write failing test for color utilities**

Create `src/headers/utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { hexToHsl, hslToHex, deriveColors } from './utils'

describe('hexToHsl', () => {
  it('converts white', () => {
    expect(hexToHsl('#ffffff')).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('converts black', () => {
    expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('converts a mid gray', () => {
    expect(hexToHsl('#808080')).toEqual({ h: 0, s: 0, l: 50 })
  })
})

describe('deriveColors', () => {
  it('derives dropdown bg lighter than header', () => {
    const result = deriveColors('#ffffff', '#1f2937')
    expect(result.dropdownBg).toBe('#ffffff')
    expect(result.hoverBg).toContain('0.08')
  })

  it('derives border color from text with alpha', () => {
    const result = deriveColors('#ffffff', '#1f2937')
    expect(result.border).toContain('0.12')
  })
})
```

Run:
```bash
npx vitest run src/headers/utils.test.ts
```

Expected: FAIL — "Cannot find module './utils'".

- [ ] **Step 2: Implement color utilities**

Create `src/headers/utils.ts`:
```typescript
export interface HslColor {
  h: number
  s: number
  l: number
}

export function hexToHsl(hex: string): HslColor {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToHex({ h, s, l }: HslColor): string {
  const sFrac = s / 100
  const lFrac = l / 100

  const c = (1 - Math.abs(2 * lFrac - 1)) * sFrac
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = lFrac - c / 2

  let r = 0, g = 0, b = 0

  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export interface DerivedColors {
  dropdownBg: string
  hoverBg: string
  border: string
  textMuted: string
}

export function deriveColors(headerBg: string, headerText: string): DerivedColors {
  const bgHsl = hexToHsl(headerBg)
  const textHsl = hexToHsl(headerText)

  // Dropdown bg: slightly lighter or darker based on background lightness
  const dropdownBg = hslToHex({
    h: bgHsl.h,
    s: bgHsl.s,
    l: bgHsl.l > 50 ? bgHsl.l - 3 : bgHsl.l + 3,
  })

  // Hover bg: text color at 8% opacity (CSS rgba format)
  const hoverBg = `${headerText}14` // 8% in hex

  // Border: text color at 12% opacity
  const border = `${headerText}1f` // 12% in hex

  // Muted text: text color at 60% opacity
  const textMuted = `${headerText}99` // 60% in hex

  return { dropdownBg, hoverBg, border, textMuted }
}
```

- [ ] **Step 3: Run tests**

Run:
```bash
npx vitest run src/headers/utils.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 4: Create shared types**

Create `src/headers/types.ts`:
```typescript
import type { ReactNode } from 'react'

export interface MenuItem {
  label: string
  href?: string
  icon?: ReactNode
  description?: string
  children?: MenuItem[]
}

export interface HeaderProps {
  logo: ReactNode
  menuItems: MenuItem[]
  headerBg?: string
  headerText?: string
  onSearch?: (query: string) => void
  cartCount?: number
  userAvatar?: string
}

export interface ThemeConfig {
  accent: string
  accentLight: string
  fontFamily?: string
  letterSpacing?: string
  fontWeight?: number
}
```

- [ ] **Step 5: Commit**

```bash
git add src/headers/
git commit -m "feat(headers): add shared types and color derivation utilities"
```

---

## Task 3: Essential Header (P0)

**Files:**
- Create: `src/headers/essential/essential.theme.ts`
- Create: `src/headers/essential/EssentialHeader.tsx`
- Create: `src/headers/essential/EssentialHeader.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/headers/essential/EssentialHeader.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EssentialHeader from './EssentialHeader'

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
]

describe('EssentialHeader', () => {
  it('renders logo and navigation', () => {
    render(<EssentialHeader logo={<span>Logo</span>} menuItems={menuItems} />)
    expect(screen.getByText('Logo')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('applies custom header background and text color', () => {
    render(
      <EssentialHeader
        logo={<span>Logo</span>}
        menuItems={menuItems}
        headerBg="#ffffff"
        headerText="#1f2937"
      />
    )
    const header = screen.getByRole('banner')
    expect(header).toHaveStyle({ backgroundColor: '#ffffff', color: '#1f2937' })
  })
})
```

Run:
```bash
npx vitest run src/headers/essential/EssentialHeader.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 2: Implement Essential theme**

Create `src/headers/essential/essential.theme.ts`:
```typescript
import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const essentialConfig: ThemeConfig = {
  accent: '#6b7280',       // Gray-500, minimal
  accentLight: '#f3f4f6',  // Gray-100
}

export function getEssentialTheme(headerBg = '#ffffff', headerText = '#1f2937') {
  const derived = deriveColors(headerBg, headerText)

  return {
    ...derived,
    ...essentialConfig,
    headerBg,
    headerText,
  }
}
```

- [ ] **Step 3: Implement Essential Header component**

Create `src/headers/essential/EssentialHeader.tsx`:
```typescript
import { useState } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getEssentialTheme } from './essential.theme'

function EssentialMenuItem({ item, headerText }: { item: MenuItem; headerText: string }) {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <li
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <a
        href={item.href ?? '#'}
        className="px-3 py-2 text-sm"
        style={{ color: headerText }}
        onClick={(e) => hasChildren && e.preventDefault()}
      >
        {item.label}
      </a>

      {hasChildren && open && (
        <div
          className="absolute top-full left-0 pt-1 min-w-[160px]"
          style={{ zIndex: 50 }}
        >
          <div
            className="py-1"
            style={{
              backgroundColor: getEssentialTheme().dropdownBg,
              border: `1px solid ${getEssentialTheme().border}`,
            }}
          >
            {item.children!.map((child, i) => (
              <a
                key={`${child.label}-${i}`}
                href={child.href ?? '#'}
                className="block px-4 py-2 text-sm"
                style={{ color: headerText }}
              >
                {child.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}

export default function EssentialHeader({
  logo,
  menuItems,
  headerBg = '#ffffff',
  headerText = '#1f2937',
  onSearch,
  cartCount,
  userAvatar,
}: HeaderProps) {
  const theme = getEssentialTheme(headerBg, headerText)

  return (
    <header
      role="banner"
      className="w-full"
      style={{ backgroundColor: headerBg, color: headerText }}
    >
      <div className="mx-auto max-w-5xl grid grid-cols-3 items-center px-6 py-4">
        {/* Logo */}
        <div className="text-base font-normal">{logo}</div>

        {/* Navigation */}
        <nav className="flex justify-center">
          <ul className="flex items-center gap-0">
            {menuItems.map((item, i) => (
              <EssentialMenuItem
                key={`${item.label}-${i}`}
                item={item}
                headerText={headerText}
              />
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          {onSearch && (
            <input
              type="search"
              placeholder="Search"
              className="w-[200px] px-3 py-1.5 text-sm"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${theme.border}`,
                color: headerText,
              }}
              onChange={(e) => onSearch(e.target.value)}
            />
          )}
          <a href="/cart" className="text-sm" style={{ color: headerText }}>
            Cart{cartCount ? ` (${cartCount})` : ''}
          </a>
          <a href="/account" className="text-sm" style={{ color: headerText }}>
            {userAvatar ? (
              <img src={userAvatar} alt="Account" className="w-6 h-6 rounded-full" />
            ) : (
              'Account'
            )}
          </a>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npx vitest run src/headers/essential/EssentialHeader.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/headers/essential/
git commit -m "feat(headers): add Essential header (zero-decoration functional)"
```

---

## Task 4: Collection Header (P1)

**Files:**
- Create: `src/headers/collection/collection.theme.ts`
- Create: `src/headers/collection/CollectionHeader.tsx`
- Create: `src/headers/collection/CollectionHeader.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/headers/collection/CollectionHeader.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CollectionHeader from './CollectionHeader'

const menuItems = [
  { label: 'Editorial', href: '/editorial' },
  {
    label: 'Shop',
    children: [
      { label: 'New Arrivals', href: '/new' },
      { label: 'Designers', href: '/designers' },
    ],
  },
]

describe('CollectionHeader', () => {
  it('renders with editorial typography', () => {
    render(<CollectionHeader logo={<span>Kinfolk</span>} menuItems={menuItems} />)
    expect(screen.getByText('Kinfolk')).toBeInTheDocument()
    expect(screen.getByText('Shop')).toBeInTheDocument()
  })

  it('shows dropdown on hover', () => {
    render(<CollectionHeader logo={<span>Kinfolk</span>} menuItems={menuItems} />)
    // Dropdown content should not be visible initially
    expect(screen.queryByText('New Arrivals')).not.toBeInTheDocument()
  })
})
```

Run:
```bash
npx vitest run src/headers/collection/CollectionHeader.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 2: Implement Collection theme**

Create `src/headers/collection/collection.theme.ts`:
```typescript
import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const collectionConfig: ThemeConfig = {
  accent: '#7c2d12',       // Burgundy
  accentLight: '#fef2f2',  // Rose-50
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  letterSpacing: '0.02em',
}

export function getCollectionTheme(headerBg = '#ffffff', headerText = '#1a1a1a') {
  return {
    ...deriveColors(headerBg, headerText),
    ...collectionConfig,
    headerBg,
    headerText,
  }
}
```

- [ ] **Step 3: Implement Collection Header**

Create `src/headers/collection/CollectionHeader.tsx`:
```typescript
import { useState } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getCollectionTheme } from './collection.theme'

function CollectionMenuItem({
  item,
  headerText,
  accent,
}: {
  item: MenuItem
  headerText: string
  accent: string
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const theme = getCollectionTheme()

  return (
    <li
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <a
        href={item.href ?? '#'}
        className="px-5 py-3 text-sm tracking-wide"
        style={{
          color: headerText,
          letterSpacing: theme.letterSpacing,
          fontFamily: "'Instrument Sans', system-ui, sans-serif",
        }}
        onClick={(e) => hasChildren && e.preventDefault()}
      >
        {item.label}
      </a>

      {hasChildren && open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 pt-4 min-w-[480px]"
          style={{ zIndex: 50 }}
        >
          <div
            className="grid grid-cols-2 gap-x-10 gap-y-4 p-8"
            style={{
              backgroundColor: theme.dropdownBg,
              border: `1px solid ${theme.border}`,
            }}
          >
            {item.children!.map((child, i) => (
              <div key={`${child.label}-${i}`}>
                <a
                  href={child.href ?? '#'}
                  className="block text-xs uppercase tracking-widest mb-2"
                  style={{ color: headerText, fontWeight: 500 }}
                >
                  {child.label}
                </a>
                {child.children && (
                  <ul className="flex flex-col gap-1">
                    {child.children.map((sub, j) => (
                      <li key={`${sub.label}-${j}`}>
                        <a
                          href={sub.href ?? '#'}
                          className="text-sm"
                          style={{ color: theme.textMuted }}
                        >
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active indicator */}
      <span
        className="absolute bottom-0 left-5 right-5 h-px transition-all duration-300"
        style={{
          backgroundColor: accent,
          opacity: open ? 1 : 0,
          transform: open ? 'scaleX(1)' : 'scaleX(0)',
        }}
      />
    </li>
  )
}

export default function CollectionHeader({
  logo,
  menuItems,
  headerBg = '#ffffff',
  headerText = '#1a1a1a',
  onSearch,
  cartCount,
}: HeaderProps) {
  const theme = getCollectionTheme(headerBg, headerText)

  return (
    <header
      role="banner"
      className="w-full"
      style={{ backgroundColor: headerBg, color: headerText }}
    >
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-5">
        {/* Logo - serif, left */}
        <div
          className="text-2xl italic"
          style={{ fontFamily: theme.fontFamily, color: headerText }}
        >
          {logo}
        </div>

        {/* Centered Navigation */}
        <nav className="absolute left-1/2 -translate-x-1/2">
          <ul className="flex items-center">
            {menuItems.map((item, i) => (
              <CollectionMenuItem
                key={`${item.label}-${i}`}
                item={item}
                headerText={headerText}
                accent={theme.accent}
              />
            ))}
          </ul>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          {onSearch && (
            <button
              aria-label="Search"
              className="text-sm"
              style={{ color: theme.textMuted }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          )}
          <a href="/cart" className="text-xs uppercase tracking-widest" style={{ color: headerText }}>
            Bag{cartCount ? ` (${cartCount})` : ''}
          </a>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npx vitest run src/headers/collection/CollectionHeader.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/headers/collection/
git commit -m "feat(headers): add Collection header (editorial, serif, whitespace)"
```

---

## Task 5: Fashion Header (P2)

**Files:**
- Create: `src/headers/fashion/fashion.theme.ts`
- Create: `src/headers/fashion/FashionHeader.tsx`
- Create: `src/headers/fashion/FashionHeader.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/headers/fashion/FashionHeader.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FashionHeader from './FashionHeader'

const menuItems = [
  { label: 'NEW', href: '/new' },
  { label: 'TRENDING', href: '/trending' },
]

describe('FashionHeader', () => {
  it('renders with bold uppercase nav', () => {
    render(<FashionHeader logo={<span>MOOD</span>} menuItems={menuItems} />)
    expect(screen.getByText('MOOD')).toBeInTheDocument()
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })
})
```

Run:
```bash
npx vitest run src/headers/fashion/FashionHeader.test.tsx
```

Expected: FAIL.

- [ ] **Step 2: Implement Fashion theme**

Create `src/headers/fashion/fashion.theme.ts`:
```typescript
import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const fashionConfig: ThemeConfig = {
  accent: '#FF0080',       // Neon pink
  accentLight: '#00D9FF',  // Electric blue
}

export function getFashionTheme(headerBg = '#0a0a0a', headerText = '#ffffff') {
  return {
    ...deriveColors(headerBg, headerText),
    ...fashionConfig,
    headerBg,
    headerText,
  }
}
```

- [ ] **Step 3: Implement Fashion Header**

Create `src/headers/fashion/FashionHeader.tsx`:
```typescript
import { useState } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getFashionTheme } from './fashion.theme'

function FashionMenuItem({
  item,
  headerText,
  accent,
}: {
  item: MenuItem
  headerText: string
  accent: string
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <li
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <a
        href={item.href ?? '#'}
        className="relative flex items-center gap-1 px-4 py-3 text-xs font-bold uppercase tracking-tight"
        style={{ color: headerText }}
        onClick={(e) => hasChildren && e.preventDefault()}
      >
        {item.label}
        {hasChildren && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
            <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </a>

      {/* Magnetic underline */}
      <span
        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all duration-300 ease-out"
        style={{
          backgroundColor: accent,
          opacity: open ? 1 : 0,
          transform: open ? 'scaleX(1)' : 'scaleX(0)',
        }}
      />

      {hasChildren && open && (
        <div className="absolute left-0 top-full pt-2 z-50 min-w-[360px]">
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: getFashionTheme().dropdownBg,
              boxShadow: `0 20px 50px -10px ${accent}33`,
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              {item.children!.map((child, i) => (
                <a
                  key={`${child.label}-${i}`}
                  href={child.href ?? '#'}
                  className="block text-sm py-2 px-3 rounded-lg transition-colors"
                  style={{ color: headerText }}
                >
                  {child.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

export default function FashionHeader({
  logo,
  menuItems,
  headerBg = '#0a0a0a',
  headerText = '#ffffff',
  onSearch,
  cartCount,
}: HeaderProps) {
  const theme = getFashionTheme(headerBg, headerText)

  return (
    <header
      role="banner"
      className="w-full"
      style={{ backgroundColor: headerBg, color: headerText }}
    >
      <div className="mx-auto max-w-6xl grid grid-cols-3 items-center px-6 py-4">
        {/* Logo */}
        <div className="text-lg font-black tracking-tighter uppercase">{logo}</div>

        {/* Navigation */}
        <nav className="flex justify-center">
          <ul className="flex items-center gap-2">
            {menuItems.map((item, i) => (
              <FashionMenuItem
                key={`${item.label}-${i}`}
                item={item}
                headerText={headerText}
                accent={theme.accent}
              />
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-end gap-5">
          {onSearch && (
            <button aria-label="Search" style={{ color: headerText }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          )}
          <a href="/cart" className="relative" style={{ color: headerText }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
            {cartCount ? (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse"
                style={{ backgroundColor: theme.accent, color: '#fff' }}
              >
                {cartCount}
              </span>
            ) : null}
          </a>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npx vitest run src/headers/fashion/FashionHeader.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/headers/fashion/
git commit -m "feat(headers): add Fashion header (bold, neon, magnetic)"
```

---

## Task 6: Luxe Vault Header (P3)

**Files:**
- Create: `src/headers/luxe-vault/luxe-vault.theme.ts`
- Create: `src/headers/luxe-vault/LuxeVaultHeader.tsx`
- Create: `src/headers/luxe-vault/LuxeVaultHeader.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/headers/luxe-vault/LuxeVaultHeader.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LuxeVaultHeader from './LuxeVaultHeader'

const menuItems = [
  { label: 'BAGS', href: '/bags' },
  { label: 'JEWELRY', href: '/jewelry' },
]

describe('LuxeVaultHeader', () => {
  it('renders with thin uppercase tracking', () => {
    render(<LuxeVaultHeader logo={<span>LV</span>} menuItems={menuItems} />)
    expect(screen.getByText('LV')).toBeInTheDocument()
    expect(screen.getByText('BAGS')).toBeInTheDocument()
  })
})
```

Run:
```bash
npx vitest run src/headers/luxe-vault/LuxeVaultHeader.test.tsx
```

Expected: FAIL.

- [ ] **Step 2: Implement Luxe Vault theme**

Create `src/headers/luxe-vault/luxe-vault.theme.ts`:
```typescript
import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const luxeConfig: ThemeConfig = {
  accent: '#c9a96e',       // Champagne gold
  accentLight: '#f5f3ef',  // Warm white
  fontFamily: "'Cormorant Garamond', serif",
  letterSpacing: '0.15em',
  fontWeight: 300,
}

export function getLuxeTheme(headerBg = '#0a0a0a', headerText = '#f5f3ef') {
  return {
    ...deriveColors(headerBg, headerText),
    ...luxeConfig,
    headerBg,
    headerText,
  }
}
```

- [ ] **Step 3: Implement Luxe Vault Header**

Create `src/headers/luxe-vault/LuxeVaultHeader.tsx`:
```typescript
import { useState } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getLuxeTheme } from './luxe-vault.theme'

function LuxeMenuItem({
  item,
  headerText,
  accent,
}: {
  item: MenuItem
  headerText: string
  accent: string
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <li
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <a
        href={item.href ?? '#'}
        className="relative block px-6 py-4 text-[11px] font-light uppercase"
        style={{
          color: headerText,
          letterSpacing: '0.15em',
        }}
        onClick={(e) => hasChildren && e.preventDefault()}
      >
        {item.label}
      </a>

      {/* Gold underline that expands from center */}
      <span
        className="absolute bottom-2 left-6 right-6 h-px transition-all duration-500 ease-out"
        style={{
          backgroundColor: accent,
          opacity: open ? 1 : 0,
          transform: open ? 'scaleX(1)' : 'scaleX(0)',
        }}
      />

      {hasChildren && open && (
        <div className="fixed left-0 right-0 top-[60px] z-50">
          <div
            className="w-full py-12"
            style={{
              backgroundColor: getLuxeTheme().dropdownBg,
              borderTop: `1px solid ${accent}40`,
            }}
          >
            <div className="mx-auto max-w-4xl grid grid-cols-3 gap-8">
              {item.children!.map((child, i) => (
                <div key={`${child.label}-${i}`}>
                  <a
                    href={child.href ?? '#'}
                    className="block text-xs uppercase mb-3"
                    style={{ color: accent, letterSpacing: '0.1em' }}
                  >
                    {child.label}
                  </a>
                  {child.children && (
                    <ul className="flex flex-col gap-2">
                      {child.children.map((sub, j) => (
                        <li key={`${sub.label}-${j}`}>
                          <a
                            href={sub.href ?? '#'}
                            className="text-sm"
                            style={{ color: getLuxeTheme().textMuted }}
                          >
                            {sub.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

export default function LuxeVaultHeader({
  logo,
  menuItems,
  headerBg = '#0a0a0a',
  headerText = '#f5f3ef',
  onSearch,
  cartCount,
}: HeaderProps) {
  const theme = getLuxeTheme(headerBg, headerText)

  return (
    <header
      role="banner"
      className="w-full"
      style={{ backgroundColor: headerBg, color: headerText }}
    >
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
        {/* Centered Logo */}
        <div className="flex-1" />

        <div
          className="text-xl"
          style={{ fontFamily: theme.fontFamily, letterSpacing: '0.2em' }}
        >
          {logo}
        </div>

        {/* Right: nav + actions */}
        <div className="flex-1 flex items-center justify-end gap-8">
          <nav>
            <ul className="flex items-center">
              {menuItems.map((item, i) => (
                <LuxeMenuItem
                  key={`${item.label}-${i}`}
                  item={item}
                  headerText={headerText}
                  accent={theme.accent}
                />
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-6">
            {onSearch && (
              <button aria-label="Search" style={{ color: theme.textMuted }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            )}
            <a href="/cart" className="relative" style={{ color: theme.textMuted }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 6h15l-1.5 9h-12z" />
              </svg>
              {cartCount ? (
                <span
                  className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
              ) : null}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npx vitest run src/headers/luxe-vault/LuxeVaultHeader.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/headers/luxe-vault/
git commit -m "feat(headers): add Luxe Vault header (dark, gold, refined)"
```

---

## Task 7: Impulse Header (P4)

**Files:**
- Create: `src/headers/impulse/impulse.theme.ts`
- Create: `src/headers/impulse/ImpulseHeader.tsx`
- Create: `src/headers/impulse/ImpulseHeader.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/headers/impulse/ImpulseHeader.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ImpulseHeader from './ImpulseHeader'

const menuItems = [
  { label: 'Flash Sale', href: '/sale' },
  { label: 'Categories', href: '/categories' },
]

describe('ImpulseHeader', () => {
  it('renders promo bar and navigation', () => {
    render(<ImpulseHeader logo={<span>FLASH</span>} menuItems={menuItems} />)
    expect(screen.getByText('FLASH')).toBeInTheDocument()
    expect(screen.getByText('Flash Sale')).toBeInTheDocument()
  })
})
```

Run:
```bash
npx vitest run src/headers/impulse/ImpulseHeader.test.tsx
```

Expected: FAIL.

- [ ] **Step 2: Implement Impulse theme**

Create `src/headers/impulse/impulse.theme.ts`:
```typescript
import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const impulseConfig: ThemeConfig = {
  accent: '#e53935',       // Alert red
  accentLight: '#ffd600',  // Promo yellow
}

export function getImpulseTheme(headerBg = '#ffffff', headerText = '#1f2937') {
  return {
    ...deriveColors(headerBg, headerText),
    ...impulseConfig,
    headerBg,
    headerText,
  }
}
```

- [ ] **Step 3: Implement Impulse Header**

Create `src/headers/impulse/ImpulseHeader.tsx`:
```typescript
import { useState } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getImpulseTheme } from './impulse.theme'

function ImpulseMenuItem({
  item,
  headerText,
  accent,
}: {
  item: MenuItem
  headerText: string
  accent: string
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <li
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <a
        href={item.href ?? '#'}
        className="flex items-center gap-1 px-3 py-2 text-sm font-semibold"
        style={{ color: headerText }}
        onClick={(e) => hasChildren && e.preventDefault()}
      >
        {item.label}
        {hasChildren && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </a>

      {hasChildren && open && (
        <div className="absolute top-full left-0 pt-1 z-50 min-w-[200px]">
          <div
            className="rounded-lg py-2 shadow-lg"
            style={{
              backgroundColor: getImpulseTheme().dropdownBg,
              border: `1px solid ${getImpulseTheme().border}`,
            }}
          >
            {item.children!.map((child, i) => (
              <a
                key={`${child.label}-${i}`}
                href={child.href ?? '#'}
                className="block px-4 py-2 text-sm"
                style={{ color: headerText }}
              >
                {child.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}

export default function ImpulseHeader({
  logo,
  menuItems,
  headerBg = '#ffffff',
  headerText = '#1f2937',
  onSearch,
  cartCount,
}: HeaderProps) {
  const theme = getImpulseTheme(headerBg, headerText)

  return (
    <>
      {/* Promo bar */}
      <div
        className="w-full text-center py-2 text-xs font-bold uppercase tracking-wide"
        style={{ backgroundColor: theme.accent, color: '#ffffff' }}
      >
        ⚡ LIMITED TIME: 50% OFF EVERYTHING — ENDS IN 02:14:33
      </div>

      <header
        role="banner"
        className="w-full"
        style={{ backgroundColor: headerBg, color: headerText }}
      >
        <div className="mx-auto max-w-5xl grid grid-cols-3 items-center px-6 py-3">
          {/* Logo */}
          <div className="text-lg font-black">{logo}</div>

          {/* Navigation */}
          <nav className="flex justify-center">
            <ul className="flex items-center gap-1">
              {menuItems.map((item, i) => (
                <ImpulseMenuItem
                  key={`${item.label}-${i}`}
                  item={item}
                  headerText={headerText}
                  accent={theme.accent}
                />
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            {onSearch && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{ border: `1px solid ${theme.border}` }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  placeholder="Search deals..."
                  className="text-sm bg-transparent outline-none w-[140px]"
                  style={{ color: headerText }}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            )}
            <a href="/cart" className="relative" style={{ color: headerText }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="18" cy="20" r="1.5" fill="currentColor" />
              </svg>
              {cartCount ? (
                <span
                  className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                  style={{ backgroundColor: theme.accent, color: '#fff' }}
                >
                  {cartCount}
                </span>
              ) : null}
            </a>
          </div>
        </div>
      </header>
    </>
  )
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npx vitest run src/headers/impulse/ImpulseHeader.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/headers/impulse/
git commit -m "feat(headers): add Impulse header (promo bar, urgency, red accent)"
```

---

## Task 8: Card Market Header (P5)

**Files:**
- Create: `src/headers/card-market/card-market.theme.ts`
- Create: `src/headers/card-market/CardMarketHeader.tsx`
- Create: `src/headers/card-market/CardMarketHeader.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/headers/card-market/CardMarketHeader.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CardMarketHeader from './CardMarketHeader'

const menuItems = [
  { label: 'PTCG', href: '/ptcg' },
  { label: 'MTG', href: '/mtg' },
]

describe('CardMarketHeader', () => {
  it('renders with game category nav', () => {
    render(<CardMarketHeader logo={<span>TCG</span>} menuItems={menuItems} />)
    expect(screen.getByText('TCG')).toBeInTheDocument()
    expect(screen.getByText('PTCG')).toBeInTheDocument()
  })
})
```

Run:
```bash
npx vitest run src/headers/card-market/CardMarketHeader.test.tsx
```

Expected: FAIL.

- [ ] **Step 2: Implement Card Market theme**

Create `src/headers/card-market/card-market.theme.ts`:
```typescript
import { deriveColors } from '../utils'
import type { ThemeConfig } from '../types'

export const cardMarketConfig: ThemeConfig = {
  accent: '#ffd700',       // Gold
  accentLight: '#1a1a2e',  // Deep purple
}

export function getCardMarketTheme(headerBg = '#1a1a2e', headerText = '#e2e8f0') {
  return {
    ...deriveColors(headerBg, headerText),
    ...cardMarketConfig,
    headerBg,
    headerText,
  }
}
```

- [ ] **Step 3: Implement Card Market Header**

Create `src/headers/card-market/CardMarketHeader.tsx`:
```typescript
import { useState } from 'react'
import type { HeaderProps, MenuItem } from '../types'
import { getCardMarketTheme } from './card-market.theme'

function CardMenuItem({
  item,
  headerText,
  accent,
}: {
  item: MenuItem
  headerText: string
  accent: string
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <li
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <a
        href={item.href ?? '#'}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150"
        style={{
          color: headerText,
          backgroundColor: open ? `${headerText}10` : 'transparent',
        }}
        onClick={(e) => hasChildren && e.preventDefault()}
      >
        {item.icon && <span>{item.icon}</span>}
        {item.label}
      </a>

      {hasChildren && open && (
        <div className="absolute top-full left-0 pt-1 z-50 min-w-[240px]">
          <div
            className="rounded-lg py-2 overflow-hidden"
            style={{
              backgroundColor: getCardMarketTheme().dropdownBg,
              border: `1px solid ${accent}40`,
            }}
          >
            {item.children!.map((child, i) => (
              <a
                key={`${child.label}-${i}`}
                href={child.href ?? '#'}
                className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: headerText }}
              >
                {child.icon && <span>{child.icon}</span>}
                {child.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}

export default function CardMarketHeader({
  logo,
  menuItems,
  headerBg = '#1a1a2e',
  headerText = '#e2e8f0',
  onSearch,
  cartCount,
  userAvatar,
}: HeaderProps) {
  const theme = getCardMarketTheme(headerBg, headerText)

  return (
    <header
      role="banner"
      className="w-full"
      style={{ backgroundColor: headerBg, color: headerText }}
    >
      <div className="mx-auto max-w-6xl flex items-center gap-6 px-6 py-3">
        {/* Logo */}
        <div className="text-xl font-bold tracking-tight" style={{ color: accent }}>
          {logo}
        </div>

        {/* Game category nav */}
        <nav className="flex items-center gap-1">
          {menuItems.map((item, i) => (
            <CardMenuItem
              key={`${item.label}-${i}`}
              item={item}
              headerText={headerText}
              accent={theme.accent}
            />
          ))}
        </nav>

        {/* Search - center, large */}
        {onSearch && (
          <div className="flex-1 flex justify-center">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg w-full max-w-md transition-all focus-within:ring-2"
              style={{
                backgroundColor: `${headerText}08`,
                border: `1px solid ${theme.border}`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: theme.textMuted }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search cards, sets, or card numbers..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: headerText }}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Right: reputation + cart */}
        <div className="flex items-center gap-4">
          {userAvatar && (
            <div className="relative">
              <img
                src={userAvatar}
                alt="Profile"
                className="w-8 h-8 rounded-full"
                style={{ border: `2px solid ${theme.accent}` }}
              />
              {/* Shimmer overlay */}
              <div
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${theme.accent}30 50%, transparent 100%)`,
                  animation: 'shimmer 2s infinite',
                }}
              />
            </div>
          )}
          <a href="/cart" className="relative" style={{ color: headerText }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
            {cartCount ? (
              <span
                className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                style={{ backgroundColor: theme.accent, color: '#1a1a2e' }}
              >
                {cartCount}
              </span>
            ) : null}
          </a>
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </header>
  )
}
```

- [ ] **Step 4: Run tests**

Run:
```bash
npx vitest run src/headers/card-market/CardMarketHeader.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/headers/card-market/
git commit -m "feat(headers): add Card Market header (gaming, rarity shimmer, search-centric)"
```

---

## Task 9: Export Barrel File

**Files:**
- Create: `src/headers/index.ts`

- [ ] **Step 1: Create barrel exports**

Create `src/headers/index.ts`:
```typescript
export { default as EssentialHeader } from './essential/EssentialHeader'
export { default as CollectionHeader } from './collection/CollectionHeader'
export { default as FashionHeader } from './fashion/FashionHeader'
export { default as LuxeVaultHeader } from './luxe-vault/LuxeVaultHeader'
export { default as ImpulseHeader } from './impulse/ImpulseHeader'
export { default as CardMarketHeader } from './card-market/CardMarketHeader'

export type { HeaderProps, MenuItem, HeaderTheme, ThemeConfig } from './types'
```

- [ ] **Step 2: Commit**

```bash
git add src/headers/index.ts
git commit -m "feat(headers): add barrel export file"
```

---

## Task 10: Final Verification

**Files:**
- Modify: `src/App.tsx` (temporary showcase)

- [ ] **Step 1: Update App.tsx to showcase all headers**

Replace `src/App.tsx` content temporarily:
```tsx
import {
  EssentialHeader,
  CollectionHeader,
  FashionHeader,
  LuxeVaultHeader,
  ImpulseHeader,
  CardMarketHeader,
} from './headers'

const menuItems = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    children: [
      { label: 'Category A', href: '/a' },
      { label: 'Category B', href: '/b' },
    ],
  },
  { label: 'About', href: '/about' },
]

function App() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="p-4 text-sm font-bold text-gray-500">Essential (Functional)</h2>
        <EssentialHeader logo="Essential" menuItems={menuItems} headerBg="#ffffff" headerText="#1f2937" />
      </section>

      <section>
        <h2 className="p-4 text-sm font-bold text-gray-500">Collection (Editorial)</h2>
        <CollectionHeader logo="Collection" menuItems={menuItems} headerBg="#ffffff" headerText="#1a1a1a" />
      </section>

      <section>
        <h2 className="p-4 text-sm font-bold text-gray-500">Fashion (Bold)</h2>
        <FashionHeader logo="FASHION" menuItems={menuItems} headerBg="#0a0a0a" headerText="#ffffff" />
      </section>

      <section>
        <h2 className="p-4 text-sm font-bold text-gray-500">Luxe Vault (Dark/Gold)</h2>
        <LuxeVaultHeader logo="LUXE" menuItems={menuItems} headerBg="#0a0a0a" headerText="#f5f3ef" />
      </section>

      <section>
        <h2 className="p-4 text-sm font-bold text-gray-500">Impulse (Urgent)</h2>
        <ImpulseHeader logo="FLASH" menuItems={menuItems} headerBg="#ffffff" headerText="#1f2937" />
      </section>

      <section>
        <h2 className="p-4 text-sm font-bold text-gray-500">Card Market (Gaming)</h2>
        <CardMarketHeader logo="TCG" menuItems={menuItems} headerBg="#1a1a2e" headerText="#e2e8f0" />
      </section>
    </div>
  )
}

export default App
```

- [ ] **Step 2: Run all tests**

Run:
```bash
npx vitest run --reporter=verbose
```

Expected: All 12 tests PASS.

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "chore: showcase all 6 header variants in App.tsx"
```

---

## Self-Review

### Spec Coverage
| Spec Section | Plan Task |
|-------------|-----------|
| Shared types & color derivation | Task 2 |
| Essential Header (zero-decoration) | Task 3 |
| Collection Header (editorial) | Task 4 |
| Fashion Header (bold/neon) | Task 5 |
| Luxe Vault Header (dark/gold) | Task 6 |
| Impulse Header (promo/urgency) | Task 7 |
| Card Market Header (gaming/shimmer) | Task 8 |
| Barrel exports | Task 9 |
| Final verification | Task 10 |

### Placeholder Scan
- No TBD/TODO/fill-in-details found
- All test code is complete
- All component code is complete
- No vague steps

### Type Consistency
- `HeaderProps` interface used consistently across all components
- `MenuItem` type used consistently
- `deriveColors()` signature matches in all theme files
- Color values are hex strings throughout
