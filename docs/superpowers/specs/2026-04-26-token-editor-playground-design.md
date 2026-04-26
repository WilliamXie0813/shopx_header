# Token Editor Playground Design

**Date:** 2026-04-26  
**Scope:** Add a right-side token editing panel with live preview of Header component changes.

---

## Background

The current `Demo.tsx` is a slide carousel showcasing 6 different Header variants. Each slide has its own `theme` (ThemeTokens) and `config` (HeaderConfig). There is a read-only `ConfigPanel` that displays the current header's config and theme tokens as collapsible JSON using `react-json-view`.

The goal is to add a **Playground mode** where users can interactively edit design tokens in a right-side panel and see the Header component update in real time.

---

## Decisions

| Decision | Choice |
|---|---|
| Playground mode | Independent from the carousel |
| Variant selection | Top button group (6 variants) |
| Editable tokens | Key tokens only: all colors, typography.fontFamily, config.showSearch |
| Implementation | Option A: inline mode switch inside Demo.tsx |

---

## Layout

Playground mode uses a 3-area layout:

```
+---------------------------------------------------------+--------------+
| [Carousel]  Playground                        [variants] |              |
+---------------------------------------------------------+  TokenEditor |
|                                                         |    Panel     |
|                  Header Preview Area                     |   (320px)    |
|                 (remaining width)                       |  scrollable  |
|                                                         |              |
+---------------------------------------------------------+              |
|              Page skeleton (SkeletonGrid)                |              |
+---------------------------------------------------------+--------------+
```

### Top Variant Button Group

- A row of pill-shaped buttons with the 6 variant names: Centered, Floating, LuxeVault, Mega, Marketplace, Sticky.
- Active variant is visually highlighted.
- Clicking a button switches the rendered Header component immediately.

### Main Area

- **Left (flex-1):** Header component live preview + page skeleton content below, identical to the current carousel mode.
- **Right (fixed 320px):** `TokenEditor` panel with its own vertical scroll.

### TokenEditor Panel Structure

Grouped into collapsible sections:

1. **Colors** — One row per color token:
   - `primary`, `background`, `surface`, `text`, `textSecondary`, `textInverse`, `border`
   - Each row: `<input type="color">` picker + hex text input side by side.
   - Changing either input updates the state.

2. **Typography** — Text inputs for:
   - `fontFamily.heading`
   - `fontFamily.body`

3. **Config** — Toggle switch for:
   - `showSearch`

4. **Actions** — "Reset to Default" button at the bottom.

---

## Component Architecture

### Demo.tsx

- New state: `mode: 'carousel' | 'playground'`.
- In the header info area, add a mode toggle button next to the slide title.
- When `mode === 'playground'`, render `<Playground />` instead of the carousel content.

### Playground.tsx (new)

- **State owner** for the Playground.
- State:
  - `selectedVariant: string` — current variant id.
  - `themeOverrides: Partial<ThemeTokens>` — user-modified theme fields.
  - `configOverrides: Partial<HeaderConfig>` — user-modified config fields.
- Computes `mergedTheme` and `mergedConfig` by merging overrides onto the selected variant's defaults.
- Renders:
  - Variant button group.
  - `<ThemeProvider theme={mergedTheme}>` wrapping the selected Header component with `mergedConfig`.
  - `<TokenEditor theme={mergedTheme} config={mergedConfig} onChange={...} />` in the right panel.

### TokenEditor.tsx (new)

- Pure display component.
- Props:
  - `theme: ThemeTokens`
  - `config: HeaderConfig`
  - `onThemeChange: (path: string, value: string | boolean) => void`
  - `onConfigChange: (path: string, value: string | boolean) => void`
  - `onReset: () => void`
- Renders the grouped editing UI described in the Layout section.

### ColorField.tsx (new)

- Reusable component for a color token row.
- Props: `label: string`, `value: string`, `onChange: (value: string) => void`.
- Renders a color picker + hex text input with two-way sync.

---

## Data Flow

```
Playground.tsx
  ├── selectedVariant ──► lookup default theme/config from slides array
  ├── themeOverrides ──┐
  ├── configOverrides ─┤
  │                    ▼
  │            merge({ ...defaults, ...overrides })
  │                    ▼
  ├─► <ThemeProvider theme={mergedTheme}>
  │     <HeaderX config={mergedConfig} />
  │
  └─► <TokenEditor
        theme={mergedTheme}
        config={mergedConfig}
        onThemeChange={(path, val) => setThemeOverrides(prev => ...)}
        onConfigChange={(path, val) => setConfigOverrides(prev => ...)}
        onReset={() => { setThemeOverrides({}); setConfigOverrides({}); }}
      />
```

### State Rules

- `themeOverrides` and `configOverrides` are `Partial<>` objects. Only fields the user has explicitly modified are stored. Unmodified fields fall back to the current variant's default.
- **Switching variants does NOT clear overrides.** The user can tweak colors, then switch to another header to see how the same palette looks.
- **"Reset to Default" clears both override states**, reverting everything to the selected variant's defaults.
- Color values are always stored as 6-digit hex (`#RRGGBB`) because `<input type="color">` requires this format.

---

## Files to Create / Modify

| File | Action |
|---|---|
| `src/shopxComponent/Playground.tsx` | Create |
| `src/shopxComponent/TokenEditor.tsx` | Create |
| `src/shopxComponent/ColorField.tsx` | Create |
| `src/shopxComponent/Demo.tsx` | Modify — add mode toggle and Playground render |

---

## Out of Scope

- Editing `navigation` structure (labels, hrefs, children) — too complex for a token playground.
- Editing `spacing` or `borderRadius` tokens — not considered "key tokens" per user choice.
- Persisting edits to localStorage or URL — can be added later if needed.
- Routing — the mode switch is local state only.
