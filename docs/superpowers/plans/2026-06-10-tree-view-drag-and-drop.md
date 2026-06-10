# TreeView Drag-and-Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag-and-drop reordering to the TreeView component using dnd-kit, supporting sibling reordering, cross-level moves, and smart drop positioning (above/below/inside).

**Architecture:** Split TreeNode from TreeView.tsx into its own file, add a `useTreeDnD` hook that encapsulates all dnd-kit integration and tree restructuring logic, and conditionally wrap the tree with DndContext/SortableContext when `reorderable` is enabled. The tree restructuring algorithm is a pure function (`moveNode`) tested independently.

**Tech Stack:** React 19, TypeScript, dnd-kit (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities), Tailwind CSS v4, lucide-react, vitest

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/shared/tree-view/types.ts` | Modify | Add DnD-related types: `DropPosition`, `DropCancelReason`, `TreeCanDropParams`, `TreeDragEndEvent`, `TreeViewProps` union for controlled/uncontrolled |
| `src/shared/tree-view/useTreeDnD.ts` | Create | Pure tree restructuring (`moveNode`, `findNodeLocation`, etc.) + React hook wrapping dnd-kit sensors/collision detection |
| `src/shared/tree-view/useTreeDnD.test.ts` | Create | Unit tests for `moveNode` covering all cancel reasons, reordering, cross-level moves, `canDrop`, immutability |
| `src/shared/tree-view/TreeNode.tsx` | Create | Extract TreeNode from TreeView.tsx, add dnd-kit `useSortable` integration, drag handle, drop indicators |
| `src/shared/tree-view/TreeView.tsx` | Modify | Conditionally render DndContext/SortableContext/DragOverlay, integrate `useTreeDnD`, handle controlled/uncontrolled data flow |
| `src/shared/tree-view/TreeViewDemo.tsx` | Modify | Add `reorderable` toggle, controlled mode demo, operation log |

---

## Task 1: Install dnd-kit Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Verify lockfile updated**

```bash
git diff package.json package-lock.json
```

Expected: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` added to dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install dnd-kit dependencies for tree-view drag-and-drop"
```

---

## Task 2: Extend Type Definitions

**Files:**
- Modify: `src/shared/tree-view/types.ts`

- [ ] **Step 1: Add new types**

Replace the entire file contents:

```ts
import type React from "react"

export interface TreeDataItem {
  id: string
  name: string
  icon?: React.ComponentType<{ className?: string }>
  selectedIcon?: React.ComponentType<{ className?: string }>
  openIcon?: React.ComponentType<{ className?: string }>
  children?: TreeDataItem[]
  actions?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  /** Whether other nodes can be dropped into this node. Defaults to true if children exist, false for leaf nodes. */
  droppable?: boolean
}

export type DropPosition = "above" | "below" | "inside"

export type DropCancelReason =
  | "no-target"
  | "same-node"
  | "descendant-target"
  | "disabled-node"
  | "drop-disallowed"

export interface TreeCanDropParams {
  active: TreeDataItem
  over: TreeDataItem
  position: DropPosition
  currentData: TreeDataItem[]
}

export type TreeDragEndEvent =
  | {
      canceled: true
      reason: DropCancelReason
      active: TreeDataItem
      over: TreeDataItem | null
    }
  | {
      canceled: false
      active: TreeDataItem
      over: TreeDataItem
      position: DropPosition
      newData: TreeDataItem[]
    }

interface BaseTreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  initialSelectedItemId?: string
  selectedItemId?: string
  onSelectChange?: (item: TreeDataItem | undefined) => void
  expandAll?: boolean
  defaultNodeIcon?: React.ComponentType<{ className?: string }>
  defaultLeafIcon?: React.ComponentType<{ className?: string }>
  /** Enable drag-and-drop reordering. Default false. */
  reorderable?: boolean
  /** Custom drop rules. Return false to disallow dropping on this target. */
  canDrop?: (params: TreeCanDropParams) => boolean
  /** Drag end callback. Avoids naming conflict with React DOM onDragEnd. */
  onTreeDragEnd?: (event: TreeDragEndEvent) => void
}

export type TreeViewProps = BaseTreeViewProps & (
  | {
      /** Controlled mode: external data is the single source of truth. */
      data: TreeDataItem[] | TreeDataItem
      defaultData?: never
    }
  | {
      /** Uncontrolled mode: used only to initialize internal tree data. */
      defaultData: TreeDataItem[] | TreeDataItem
      data?: never
    }
)

export interface TreeRenderItemParams {
  item: TreeDataItem
  depth: number
  expanded: boolean
  selected: boolean
  hasChildren: boolean
}
```

> Existing callers that pass `data` continue to compile. New uncontrolled callers must pass `defaultData`. Passing both `data` and `defaultData`, or neither, is a type error.

- [ ] **Step 2: Commit**

```bash
git add src/shared/tree-view/types.ts
git commit -m "feat(tree-view): add drag-and-drop type definitions"
```

---

## Task 3: Implement Tree Restructure Core Algorithm

**Files:**
- Create: `src/shared/tree-view/useTreeDnD.ts`

- [ ] **Step 1: Write the pure tree functions**

Create `src/shared/tree-view/useTreeDnD.ts` with the algorithmic core:

```ts
import type { TreeDataItem, DropPosition, TreeCanDropParams, TreeDragEndEvent } from "./types"

export function flattenVisible(items: TreeDataItem[], expandedIds: Set<string>): TreeDataItem[] {
  const result: TreeDataItem[] = []
  const walk = (list: TreeDataItem[]) => {
    for (const item of list) {
      result.push(item)
      if (item.children && item.children.length > 0 && expandedIds.has(item.id)) {
        walk(item.children)
      }
    }
  }
  walk(items)
  return result
}

export function shallowCloneTree(tree: TreeDataItem[]): TreeDataItem[] {
  return tree.map((item) => ({
    ...item,
    children: item.children ? shallowCloneTree(item.children) : undefined,
  }))
}

export interface TreeNodeLocation {
  node: TreeDataItem
  parent: TreeDataItem | null
  siblings: TreeDataItem[]
  index: number
}

export function findNodeLocation(
  tree: TreeDataItem[],
  id: string,
  parent: TreeDataItem | null = null,
  siblings: TreeDataItem[] = tree
): TreeNodeLocation | null {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      return { node: tree[i], parent, siblings, index: i }
    }
    if (tree[i].children) {
      const result = findNodeLocation(tree[i].children!, id, tree[i], tree[i].children!)
      if (result) return result
    }
  }
  return null
}

export function removeNode(
  tree: TreeDataItem[],
  id: string
): { removed: TreeDataItem } | null {
  const location = findNodeLocation(tree, id)
  if (!location) return null
  const [removed] = location.siblings.splice(location.index, 1)
  return { removed }
}

export function isDescendant(node: TreeDataItem, descendantId: string): boolean {
  if (!node.children) return false
  for (const child of node.children) {
    if (child.id === descendantId) return true
    if (isDescendant(child, descendantId)) return true
  }
  return false
}

export function isNodeDroppable(node: TreeDataItem): boolean {
  if (node.droppable === false) return false
  if (node.droppable === true) return true
  return node.children !== undefined && node.children.length > 0
}

export function moveNode(
  tree: TreeDataItem[],
  sourceId: string,
  targetId: string | null,
  position: DropPosition,
  canDrop?: (params: TreeCanDropParams) => boolean
): TreeDragEndEvent {
  const newTree = shallowCloneTree(tree)

  const sourceResult = findNodeLocation(newTree, sourceId)
  if (!sourceResult) {
    return {
      canceled: true,
      reason: "no-target",
      active: { id: sourceId, name: "" } as TreeDataItem,
      over: null,
    }
  }
  const { node: active } = sourceResult

  if (!targetId) {
    return { canceled: true, reason: "no-target", active, over: null }
  }

  const targetResult = findNodeLocation(newTree, targetId)
  if (!targetResult) {
    return { canceled: true, reason: "no-target", active, over: null }
  }
  const { node: over } = targetResult

  // Guard checks
  if (active.id === over.id) {
    return { canceled: true, reason: "same-node", active, over }
  }
  if (isDescendant(active, over.id)) {
    return { canceled: true, reason: "descendant-target", active, over }
  }
  if (active.disabled || over.disabled) {
    return { canceled: true, reason: "disabled-node", active, over }
  }
  if (position === "inside" && !isNodeDroppable(over)) {
    return { canceled: true, reason: "drop-disallowed", active, over }
  }

  // Custom canDrop check
  if (canDrop) {
    const params: TreeCanDropParams = { active, over, position, currentData: newTree }
    if (!canDrop(params)) {
      return { canceled: true, reason: "drop-disallowed", active, over }
    }
  }

  // Remove source from its current location
  const removeResult = removeNode(newTree, sourceId)
  if (!removeResult) {
    return { canceled: true, reason: "no-target", active, over }
  }
  const { removed: sourceNode } = removeResult

  // Re-locate target after removal
  const targetAfterRemove = findNodeLocation(newTree, targetId)
  if (!targetAfterRemove) {
    return { canceled: true, reason: "no-target", active, over: null }
  }

  // Insert at new position
  if (position === "inside") {
    if (!targetAfterRemove.node.children) targetAfterRemove.node.children = []
    targetAfterRemove.node.children.push(sourceNode)
  } else if (position === "above") {
    targetAfterRemove.siblings.splice(targetAfterRemove.index, 0, sourceNode)
  } else {
    // below
    targetAfterRemove.siblings.splice(targetAfterRemove.index + 1, 0, sourceNode)
  }

  return {
    canceled: false,
    active,
    over,
    position,
    newData: newTree,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/tree-view/useTreeDnD.ts
git commit -m "feat(tree-view): implement pure tree restructure algorithm"
```

---

## Task 4: Test Tree Restructure Algorithm

**Files:**
- Create: `src/shared/tree-view/useTreeDnD.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/shared/tree-view/useTreeDnD.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { moveNode, isNodeDroppable } from "./useTreeDnD"
import type { TreeDataItem } from "./types"

function makeTree(): TreeDataItem[] {
  return [
    {
      id: "a",
      name: "A",
      children: [
        { id: "a1", name: "A1" },
        { id: "a2", name: "A2" },
      ],
    },
    {
      id: "b",
      name: "B",
      children: [
        { id: "b1", name: "B1" },
        { id: "b2", name: "B2" },
      ],
    },
    {
      id: "c",
      name: "C",
      children: [{ id: "c1", name: "C1" }],
    },
  ]
}

describe("moveNode", () => {
  it("reorders siblings above", () => {
    const tree = makeTree()
    const result = moveNode(tree, "a2", "a1", "above")
    expect(result.canceled).toBe(false)
    if (result.canceled) return
    expect(result.newData[0].children!.map((c) => c.id)).toEqual(["a2", "a1"])
    expect(result.newData.map((n) => n.id)).toEqual(["a", "b", "c"])
  })

  it("reorders siblings below", () => {
    const tree = makeTree()
    const result = moveNode(tree, "a1", "a2", "below")
    expect(result.canceled).toBe(false)
    if (result.canceled) return
    expect(result.newData[0].children!.map((c) => c.id)).toEqual(["a2", "a1"])
  })

  it("moves node inside another node", () => {
    const tree = makeTree()
    const result = moveNode(tree, "c1", "b", "inside")
    expect(result.canceled).toBe(false)
    if (result.canceled) return
    const b = result.newData.find((n) => n.id === "b")!
    expect(b.children!.map((c) => c.id)).toEqual(["b1", "b2", "c1"])
    const c = result.newData.find((n) => n.id === "c")!
    expect(c.children).toEqual([])
  })

  it("cancels when there is no target", () => {
    const tree = makeTree()
    const result = moveNode(tree, "a1", null, "below")
    expect(result.canceled).toBe(true)
    if (!result.canceled) return
    expect(result.reason).toBe("no-target")
    expect(result.over).toBeNull()
  })

  it("cancels when dropping on self", () => {
    const tree = makeTree()
    const result = moveNode(tree, "a1", "a1", "below")
    expect(result.canceled).toBe(true)
    if (!result.canceled) return
    expect(result.reason).toBe("same-node")
  })

  it("cancels when dropping into own subtree", () => {
    const tree = makeTree()
    const result = moveNode(tree, "a", "a1", "inside")
    expect(result.canceled).toBe(true)
    if (!result.canceled) return
    expect(result.reason).toBe("descendant-target")
  })

  it("cancels when source is disabled", () => {
    const tree = makeTree()
    tree[0].children![0].disabled = true
    const result = moveNode(tree, "a1", "b1", "below")
    expect(result.canceled).toBe(true)
    if (!result.canceled) return
    expect(result.reason).toBe("disabled-node")
  })

  it("cancels when target is disabled", () => {
    const tree = makeTree()
    tree[0].children![0].disabled = true
    const result = moveNode(tree, "b1", "a1", "below")
    expect(result.canceled).toBe(true)
    if (!result.canceled) return
    expect(result.reason).toBe("disabled-node")
  })

  it("cancels dropping inside a leaf node by default", () => {
    const tree = makeTree()
    const result = moveNode(tree, "a1", "b1", "inside")
    expect(result.canceled).toBe(true)
    if (!result.canceled) return
    expect(result.reason).toBe("drop-disallowed")
  })

  it("allows dropping inside a leaf node marked droppable", () => {
    const tree = makeTree()
    // Find b1 and mark it droppable
    const b = tree.find((n) => n.id === "b")!
    b.children![0].droppable = true
    const result = moveNode(tree, "a1", "b1", "inside")
    expect(result.canceled).toBe(false)
    if (result.canceled) return
    const b1 = result.newData
      .find((n) => n.id === "b")!
      .children!.find((n) => n.id === "b1")!
    expect(b1.children!.map((c) => c.id)).toEqual(["a1"])
  })

  it("cancels dropping inside a node explicitly marked non-droppable", () => {
    const tree = makeTree()
    tree[1].droppable = false
    const result = moveNode(tree, "a1", "b", "inside")
    expect(result.canceled).toBe(true)
    if (!result.canceled) return
    expect(result.reason).toBe("drop-disallowed")
  })

  it("cancels when canDrop returns false", () => {
    const tree = makeTree()
    const result = moveNode(tree, "a1", "b1", "below", () => false)
    expect(result.canceled).toBe(true)
    if (!result.canceled) return
    expect(result.reason).toBe("drop-disallowed")
  })

  it("does not mutate original tree", () => {
    const tree = makeTree()
    const originalIds = JSON.stringify(tree)
    moveNode(tree, "a2", "a1", "above")
    expect(JSON.stringify(tree)).toBe(originalIds)
  })

  it("preserves React component references after move", () => {
    const icon = () => null
    const tree: TreeDataItem[] = [{ id: "a", name: "A", icon, children: [{ id: "a1", name: "A1" }] }]
    const result = moveNode(tree, "a1", "a", "inside")
    expect(result.canceled).toBe(false)
    if (result.canceled) return
    const a = result.newData.find((n) => n.id === "a")!
    expect(a.icon).toBe(icon)
  })

  it("reorders root-level nodes", () => {
    const tree = makeTree()
    const result = moveNode(tree, "c", "a", "above")
    expect(result.canceled).toBe(false)
    if (result.canceled) return
    expect(result.newData.map((n) => n.id)).toEqual(["c", "a", "b"])
  })
})

describe("isNodeDroppable", () => {
  it("returns true for nodes with non-empty children by default", () => {
    expect(isNodeDroppable({ id: "1", name: "A", children: [{ id: "2", name: "B" }] })).toBe(true)
  })

  it("returns false for empty children arrays by default", () => {
    expect(isNodeDroppable({ id: "1", name: "A", children: [] })).toBe(false)
  })

  it("returns false for leaf nodes by default", () => {
    expect(isNodeDroppable({ id: "1", name: "A" })).toBe(false)
  })

  it("returns true when droppable is explicitly true", () => {
    expect(isNodeDroppable({ id: "1", name: "A", droppable: true })).toBe(true)
  })

  it("returns false when droppable is explicitly false", () => {
    expect(isNodeDroppable({ id: "1", name: "A", children: [{ id: "2", name: "B" }], droppable: false })).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests (should pass)**

```bash
npx vitest run src/shared/tree-view/useTreeDnD.test.ts
```

Expected: All 20 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/shared/tree-view/useTreeDnD.test.ts
git commit -m "test(tree-view): add unit tests for tree restructure algorithm"
```

---

## Task 5: Extract TreeNode Component

**Files:**
- Create: `src/shared/tree-view/TreeNode.tsx`
- Modify: `src/shared/tree-view/TreeView.tsx`

- [ ] **Step 1: Create TreeNode.tsx**

Create `src/shared/tree-view/TreeNode.tsx` with the extracted node component:

```tsx
import * as React from "react"
import { ChevronRight, Folder, FolderOpen, File } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TreeDataItem } from "./types"

interface TreeNodeProps {
  item: TreeDataItem
  depth: number
  selectedId: string | null
  expandedIds: Set<string>
  focusableId: string | null
  onSelect: (item: TreeDataItem) => void
  onToggle: (id: string) => void
  onFocusChange: (id: string | null) => void
  defaultNodeIcon?: React.ComponentType<{ className?: string }>
  defaultLeafIcon?: React.ComponentType<{ className?: string }>
}

export function TreeNode({
  item,
  depth,
  selectedId,
  expandedIds,
  focusableId,
  onSelect,
  onToggle,
  onFocusChange,
  defaultNodeIcon,
  defaultLeafIcon,
}: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedIds.has(item.id)
  const isSelected = selectedId === item.id
  const isDisabled = item.disabled
  const isFocusable = focusableId === item.id

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDisabled) return
    if (hasChildren) {
      onToggle(item.id)
    }
  }

  const handleSelect = () => {
    if (isDisabled) return
    onSelect(item)
    onFocusChange(item.id)
    item.onClick?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleSelect()
      if (hasChildren) {
        onToggle(item.id)
      }
    }
  }

  let IconComponent: React.ComponentType<{ className?: string }> | undefined

  if (hasChildren) {
    if (isExpanded && item.openIcon) {
      IconComponent = item.openIcon
    } else if (isSelected && item.selectedIcon) {
      IconComponent = item.selectedIcon
    } else if (item.icon) {
      IconComponent = item.icon
    } else if (isExpanded) {
      IconComponent = FolderOpen
    } else {
      IconComponent = defaultNodeIcon || Folder
    }
  } else {
    if (isSelected && item.selectedIcon) {
      IconComponent = item.selectedIcon
    } else if (item.icon) {
      IconComponent = item.icon
    } else {
      IconComponent = defaultLeafIcon || File
    }
  }

  const Icon = IconComponent

  return (
    <div className={cn("select-none", item.className)}>
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={isFocusable ? 0 : -1}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-md py-1 pr-2 text-sm transition-colors",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          isSelected && "bg-primary/10 text-primary",
          !isSelected && !isDisabled && "hover:bg-muted text-foreground",
          isDisabled && "cursor-not-allowed opacity-50"
        )}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={handleToggle}
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm transition-transform duration-150",
            hasChildren ? "visible" : "invisible",
            !isDisabled && "hover:bg-muted-foreground/10"
          )}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
              isExpanded && "rotate-90"
            )}
          />
        </button>

        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}

        <span className="flex-1 truncate">{item.name}</span>

        {item.actions && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {item.actions}
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              focusableId={focusableId}
              onSelect={onSelect}
              onToggle={onToggle}
              onFocusChange={onFocusChange}
              defaultNodeIcon={defaultNodeIcon}
              defaultLeafIcon={defaultLeafIcon}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Remove TreeNode from TreeView.tsx**

In `src/shared/tree-view/TreeView.tsx`:
- Remove the entire `TreeNodeInner` function and `TreeNode` memo
- Remove unused imports: `ChevronRight`, `Folder`, `FolderOpen`, `File`
- Add import: `import { TreeNode } from "./TreeNode"`
- Keep everything else intact

The modified TreeView.tsx should look like this (only showing the changed parts):

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { TreeNode } from "./TreeNode"
import type { TreeDataItem, TreeViewProps } from "./types"

// ---- Helpers ---- (keep all existing helpers)

// Remove TreeNodeInner and TreeNode const

// ---- TreeView ----
export function TreeView({
  data,
  initialSelectedItemId,
  selectedItemId,
  onSelectChange,
  expandAll = false,
  defaultNodeIcon,
  defaultLeafIcon,
  className,
  ...props
}: TreeViewProps) {
  // ... rest of TreeView implementation stays the same
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/tree-view/TreeNode.tsx src/shared/tree-view/TreeView.tsx
git commit -m "refactor(tree-view): extract TreeNode into separate file"
```

---

## Task 6: Implement useTreeDnD Hook

**Files:**
- Modify: `src/shared/tree-view/useTreeDnD.ts`

- [ ] **Step 1: Add dnd-kit integration to useTreeDnD.ts**

Add the React and dnd-kit imports at the top of `src/shared/tree-view/useTreeDnD.ts`, then append the hook after the pure functions. Keep only the imports that are used in this file:

```ts
import * as React from "react"
import {
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type CollisionDetection,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core"
import type { TreeDataItem, TreeViewProps, DropPosition } from "./types"

export interface UseTreeDnDOptions {
  currentData: TreeDataItem[]
  canDrop?: TreeViewProps["canDrop"]
  onTreeDragEnd?: TreeViewProps["onTreeDragEnd"]
  expandedIds: Set<string>
  setExpandedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  expandAll: boolean
}

export interface UseTreeDnDResult {
  sensors: ReturnType<typeof useSensors>
  collisionDetection: CollisionDetection
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  activeId: string | null
  dropTarget: { id: string; position: DropPosition } | null
  flatItemIds: string[]
  announcement: string
}

export function useTreeDnD({
  currentData,
  canDrop,
  onTreeDragEnd,
  expandedIds,
  setExpandedIds,
  expandAll,
}: UseTreeDnDOptions): UseTreeDnDResult {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [dropTarget, setDropTarget] = React.useState<{ id: string; position: DropPosition } | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const dragStartPointer = React.useRef({ x: 0, y: 0 })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const flatItemIds = React.useMemo(
    () => flattenVisible(currentData, expandedIds).map((item) => item.id),
    [currentData, expandedIds]
  )

  const collisionDetection: CollisionDetection = React.useCallback(
    (args) => {
      const collisions = pointerWithin(args)
      if (!collisions.length) return []
      // Filter out disabled nodes
      return collisions.filter((collision) => {
        const id = collision.id as string
        const node = findNode(currentData, id)
        return node ? !node.disabled : false
      })
    },
    [currentData]
  )

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const pointerEvent = event.activatorEvent as PointerEvent
    dragStartPointer.current = { x: pointerEvent.clientX, y: pointerEvent.clientY }
    setActiveId(event.active.id as string)
    setAnnouncement("Dragging started")
  }, [])

  const getAllowedDropPosition = React.useCallback(
    (params: {
      activeId: string
      overId: string
      pointerX: number
      pointerY: number
      rect: DOMRect
    }): DropPosition | null => {
      const active = findNode(currentData, params.activeId)
      const over = findNode(currentData, params.overId)
      if (!active || !over) return null
      if (active.id === over.id) return null
      if (active.disabled || over.disabled) return null
      if (isDescendant(active, over.id)) return null

      const relativeY = (params.pointerY - params.rect.top) / params.rect.height
      const relativeX = params.pointerX - params.rect.left
      const insideAllowed = isNodeDroppable(over)

      let position: DropPosition
      if (insideAllowed && relativeX > 48 && relativeY >= 0.25 && relativeY <= 0.75) {
        position = "inside"
      } else if (relativeY < 0.33) {
        position = "above"
      } else if (relativeY > 0.67) {
        position = "below"
      } else {
        position = insideAllowed ? "inside" : "below"
      }

      if (position === "inside" && !insideAllowed) return null
      if (canDrop?.({ active, over, position, currentData }) === false) return null
      return position
    },
    [canDrop, currentData]
  )

  const handleDragOver = React.useCallback(
    (event: DragOverEvent) => {
      const { active, over, delta } = event
      if (!over) {
        setDropTarget(null)
        return
      }

      const pointerX = dragStartPointer.current.x + delta.x
      const pointerY = dragStartPointer.current.y + delta.y
      const escapedId = CSS.escape(String(over.id))
      const overElement = document.querySelector(`[data-tree-id="${escapedId}"]`)
      if (!overElement) {
        setDropTarget(null)
        return
      }

      const rect = overElement.getBoundingClientRect()
      const position = getAllowedDropPosition({
        activeId: String(active.id),
        overId: String(over.id),
        pointerX,
        pointerY,
        rect,
      })

      setDropTarget(position ? { id: String(over.id), position } : null)
    },
    [getAllowedDropPosition]
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      setDropTarget(null)

      const { active, over } = event
      if (!over) {
        setAnnouncement("Drag cancelled: no target")
        onTreeDragEnd?.({
          canceled: true,
          reason: "no-target",
          active: findNode(currentData, active.id as string) || ({ id: active.id, name: "" } as TreeDataItem),
          over: null,
        })
        return
      }

      const position = dropTarget?.position
      if (!position) {
        const activeItem = findNode(currentData, active.id as string) || ({ id: active.id, name: "" } as TreeDataItem)
        const overItem = findNode(currentData, over.id as string)
        setAnnouncement("Drag cancelled: drop disallowed")
        onTreeDragEnd?.({
          canceled: true,
          reason: "drop-disallowed",
          active: activeItem,
          over: overItem ?? null,
        })
        return
      }

      const result = moveNode(
        currentData,
        active.id as string,
        over.id as string,
        position,
        canDrop
      )

      if (result.canceled) {
        setAnnouncement(`Drag cancelled: ${result.reason}`)
      } else {
        setAnnouncement(`Moved to ${result.position} ${result.over.name}`)
        // Auto-expand target if dropped inside
        if (result.position === "inside" && !expandAll) {
          setExpandedIds((prev) => new Set(prev).add(result.over.id))
        }
      }

      onTreeDragEnd?.(result)
    },
    [currentData, canDrop, onTreeDragEnd, dropTarget, expandAll, setExpandedIds]
  )

  return {
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    dropTarget,
    flatItemIds,
    announcement,
  }
}

// Helper for collision detection
function findNode(tree: TreeDataItem[], id: string): TreeDataItem | undefined {
  for (const item of tree) {
    if (item.id === id) return item
    if (item.children) {
      const found = findNode(item.children, id)
      if (found) return found
    }
  }
  return undefined
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds. If there are import errors, fix them (the file now imports from both local types and @dnd-kit).

- [ ] **Step 3: Commit**

```bash
git add src/shared/tree-view/useTreeDnD.ts
git commit -m "feat(tree-view): add useTreeDnD hook with dnd-kit integration"
```

---

## Task 7: Integrate DnD into TreeView

**Files:**
- Modify: `src/shared/tree-view/TreeView.tsx`
- Modify: `src/shared/tree-view/TreeNode.tsx`

- [ ] **Step 1: Update TreeView.tsx with DnD integration**

Replace the entire `src/shared/tree-view/TreeView.tsx` with:

```tsx
import * as React from "react"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { TreeNode } from "./TreeNode"
import { useTreeDnD } from "./useTreeDnD"
import type { TreeDataItem, TreeViewProps } from "./types"

// ---- Helpers ----

function flattenVisible(items: TreeDataItem[], expandedIds: Set<string>): TreeDataItem[] {
  const result: TreeDataItem[] = []
  const walk = (list: TreeDataItem[]) => {
    for (const item of list) {
      result.push(item)
      if (item.children && item.children.length > 0 && expandedIds.has(item.id)) {
        walk(item.children)
      }
    }
  }
  walk(items)
  return result
}

function collectExpandableIds(items: TreeDataItem[]): Set<string> {
  const ids = new Set<string>()
  const collect = (list: TreeDataItem[]) => {
    for (const item of list) {
      if (item.children && item.children.length > 0) {
        ids.add(item.id)
        collect(item.children)
      }
    }
  }
  collect(items)
  return ids
}

function findParent(items: TreeDataItem[], childId: string): TreeDataItem | undefined {
  for (const item of items) {
    if (item.children?.some((c) => c.id === childId)) return item
    if (item.children) {
      const found = findParent(item.children, childId)
      if (found) return found
    }
  }
  return undefined
}

function normalizeData(data: TreeDataItem[] | TreeDataItem): TreeDataItem[] {
  return Array.isArray(data) ? data : [data]
}

// ---- TreeView ----

export function TreeView({
  data,
  defaultData,
  initialSelectedItemId,
  selectedItemId,
  onSelectChange,
  expandAll = false,
  defaultNodeIcon,
  defaultLeafIcon,
  reorderable = false,
  canDrop,
  onTreeDragEnd,
  className,
  ...props
}: TreeViewProps) {
  const isControlled = data !== undefined
  const initialItems = normalizeData(isControlled ? data! : defaultData ?? [])

  const [uncontrolledData, setUncontrolledData] = React.useState<TreeDataItem[]>(initialItems)
  const currentData = isControlled ? initialItems : uncontrolledData

  const allExpandableIds = React.useMemo(() => collectExpandableIds(currentData), [currentData])

  const [selectedId, setSelectedId] = React.useState<string | null>(initialSelectedItemId ?? null)
  const [focusedId, setFocusedId] = React.useState<string | null>(initialSelectedItemId ?? null)
  const [expandedIdsState, setExpandedIdsState] = React.useState<Set<string>>(new Set())
  const expandedIds = expandAll ? allExpandableIds : expandedIdsState
  const currentSelectedId = selectedItemId ?? selectedId
  const currentFocusedId = selectedItemId ?? focusedId

  const {
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    dropTarget,
    flatItemIds,
    announcement,
  } = useTreeDnD({
    currentData,
    canDrop,
    onTreeDragEnd: (event) => {
      if (!event.canceled && !isControlled) {
        setUncontrolledData(event.newData)
      }
      onTreeDragEnd?.(event)
    },
    expandedIds,
    setExpandedIds: setExpandedIdsState,
    expandAll,
  })

  const handleSelect = React.useCallback(
    (item: TreeDataItem) => {
      if (selectedItemId === undefined) {
        setSelectedId(item.id)
      }
      setFocusedId(item.id)
      onSelectChange?.(item)
    },
    [onSelectChange, selectedItemId]
  )

  const handleToggle = React.useCallback(
    (id: string) => {
      if (expandAll) return
      setExpandedIdsState((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    },
    [expandAll]
  )

  const handleFocusChange = React.useCallback((id: string | null) => {
    setFocusedId(id)
  }, [])

  const focusableId = React.useMemo(() => {
    if (currentFocusedId) {
      const visible = flattenVisible(currentData, expandedIds)
      if (visible.some((i) => i.id === currentFocusedId && !i.disabled)) {
        return currentFocusedId
      }
    }
    const walk = (list: TreeDataItem[]): string | null => {
      for (const item of list) {
        if (!item.disabled) return item.id
        if (item.children && expandedIds.has(item.id)) {
          const found = walk(item.children)
          if (found) return found
        }
      }
      return null
    }
    return walk(currentData)
  }, [currentFocusedId, currentData, expandedIds])

  const handleTreeKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!focusableId) return

      const visibleItems = flattenVisible(currentData, expandedIds)
      const currentIndex = visibleItems.findIndex((i) => i.id === focusableId)
      if (currentIndex === -1) return

      const currentItem = visibleItems[currentIndex]
      const enabledItems = visibleItems.filter((item) => !item.disabled)
      const enabledIndex = enabledItems.findIndex((item) => item.id === focusableId)

      const selectItem = (item: TreeDataItem | undefined) => {
        if (!item || item.disabled) return
        setFocusedId(item.id)
        if (selectedItemId === undefined) {
          setSelectedId(item.id)
        }
        onSelectChange?.(item)
      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          selectItem(enabledItems[enabledIndex + 1])
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          selectItem(enabledItems[enabledIndex - 1])
          break
        }
        case "ArrowRight": {
          e.preventDefault()
          const hasChildren = currentItem.children && currentItem.children.length > 0
          if (hasChildren) {
            if (expandedIds.has(currentItem.id)) {
              selectItem(visibleItems.slice(currentIndex + 1).find((item) => !item.disabled))
            } else {
              if (!expandAll) {
                setExpandedIdsState((prev) => new Set(prev).add(currentItem.id))
              }
            }
          }
          break
        }
        case "ArrowLeft": {
          e.preventDefault()
          const hasChildren = currentItem.children && currentItem.children.length > 0
          if (hasChildren && expandedIds.has(currentItem.id)) {
            setExpandedIdsState((prev) => {
              const next = new Set(prev)
              next.delete(currentItem.id)
              return next
            })
          } else {
            const parent = findParent(currentData, currentItem.id)
            selectItem(parent)
          }
          break
        }
        case "Home": {
          e.preventDefault()
          selectItem(enabledItems[0])
          break
        }
        case "End": {
          e.preventDefault()
          selectItem(enabledItems[enabledItems.length - 1])
          break
        }
      }
    },
    [expandAll, focusableId, currentData, expandedIds, onSelectChange, selectedItemId]
  )

  const treeContent = (
    <div
      role="tree"
      className={cn("w-full", className)}
      onKeyDown={handleTreeKeyDown}
      {...props}
    >
      {currentData.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          depth={0}
          selectedId={currentSelectedId}
          expandedIds={expandedIds}
          focusableId={focusableId}
          onSelect={handleSelect}
          onToggle={handleToggle}
          onFocusChange={handleFocusChange}
          defaultNodeIcon={defaultNodeIcon}
          defaultLeafIcon={defaultLeafIcon}
          reorderable={reorderable}
          dropTarget={dropTarget}
        />
      ))}
    </div>
  )

  const activeItem = activeId ? flattenVisible(currentData, expandedIds).find((i) => i.id === activeId) : null

  return (
    <>
      {reorderable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={flatItemIds} strategy={verticalListSortingStrategy}>
            {treeContent}
          </SortableContext>
          <DragOverlay>
            {activeItem ? (
              <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm shadow-md">
                {activeItem.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        treeContent
      )}
      {announcement && (
        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Update TreeNode.tsx with sortable integration**

Replace `src/shared/tree-view/TreeNode.tsx` with the DnD-aware version:

```tsx
import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, Folder, FolderOpen, File, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TreeDataItem, DropPosition } from "./types"

interface TreeNodeProps {
  item: TreeDataItem
  depth: number
  selectedId: string | null
  expandedIds: Set<string>
  focusableId: string | null
  onSelect: (item: TreeDataItem) => void
  onToggle: (id: string) => void
  onFocusChange: (id: string | null) => void
  defaultNodeIcon?: React.ComponentType<{ className?: string }>
  defaultLeafIcon?: React.ComponentType<{ className?: string }>
  reorderable?: boolean
  dropTarget?: { id: string; position: DropPosition } | null
}

export function TreeNode({
  item,
  depth,
  selectedId,
  expandedIds,
  focusableId,
  onSelect,
  onToggle,
  onFocusChange,
  defaultNodeIcon,
  defaultLeafIcon,
  reorderable,
  dropTarget,
}: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedIds.has(item.id)
  const isSelected = selectedId === item.id
  const isDisabled = item.disabled
  const isFocusable = focusableId === item.id

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: !reorderable || isDisabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOver = dropTarget?.id === item.id
  const dropPosition = dropTarget?.position

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDisabled) return
    if (hasChildren) {
      onToggle(item.id)
    }
  }

  const handleSelect = () => {
    if (isDisabled) return
    onSelect(item)
    onFocusChange(item.id)
    item.onClick?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleSelect()
      if (hasChildren) {
        onToggle(item.id)
      }
    }
  }

  let IconComponent: React.ComponentType<{ className?: string }> | undefined

  if (hasChildren) {
    if (isExpanded && item.openIcon) {
      IconComponent = item.openIcon
    } else if (isSelected && item.selectedIcon) {
      IconComponent = item.selectedIcon
    } else if (item.icon) {
      IconComponent = item.icon
    } else if (isExpanded) {
      IconComponent = FolderOpen
    } else {
      IconComponent = defaultNodeIcon || Folder
    }
  } else {
    if (isSelected && item.selectedIcon) {
      IconComponent = item.selectedIcon
    } else if (item.icon) {
      IconComponent = item.icon
    } else {
      IconComponent = defaultLeafIcon || File
    }
  }

  const Icon = IconComponent

  return (
    <div
      ref={reorderable ? setNodeRef : undefined}
      style={reorderable ? style : undefined}
      className={cn("select-none relative", item.className)}
      data-tree-id={item.id}
    >
      {/* Drop indicators */}
      {isOver && dropPosition === "above" && (
        <div className="absolute -top-[2px] left-0 right-0 h-[2px] bg-primary z-10" />
      )}
      {isOver && dropPosition === "below" && (
        <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-primary z-10" />
      )}

      <div
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={isFocusable ? 0 : -1}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-md py-1 pr-2 text-sm transition-colors",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          isSelected && "bg-primary/10 text-primary",
          !isSelected && !isDisabled && "hover:bg-muted text-foreground",
          isDisabled && "cursor-not-allowed opacity-50",
          isDragging && "opacity-30",
          isOver && dropPosition === "inside" && "bg-primary/5"
        )}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        {/* Drag handle */}
        {reorderable && !isDisabled && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Drag ${item.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-3" />
          </button>
        )}

        <button
          type="button"
          tabIndex={-1}
          onClick={handleToggle}
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm transition-transform duration-150",
            hasChildren ? "visible" : "invisible",
            !isDisabled && "hover:bg-muted-foreground/10"
          )}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
              isExpanded && "rotate-90"
            )}
          />
        </button>

        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}

        <span className="flex-1 truncate">{item.name}</span>

        {item.actions && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {item.actions}
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              focusableId={focusableId}
              onSelect={onSelect}
              onToggle={onToggle}
              onFocusChange={onFocusChange}
              defaultNodeIcon={defaultNodeIcon}
              defaultLeafIcon={defaultLeafIcon}
              reorderable={reorderable}
              dropTarget={dropTarget}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds. If there are type errors from dnd-kit imports, ensure the packages were installed correctly.

- [ ] **Step 4: Run existing tests**

```bash
npx vitest run
```

Expected: All existing tests pass. If any tests related to TreeView fail, fix them.

- [ ] **Step 5: Commit**

```bash
git add src/shared/tree-view/TreeView.tsx src/shared/tree-view/TreeNode.tsx
git commit -m "feat(tree-view): integrate dnd-kit drag-and-drop sorting"
```

---

## Task 8: Update TreeViewDemo

**Files:**
- Modify: `src/shared/tree-view/TreeViewDemo.tsx`

- [ ] **Step 1: Add reorderable demo**

Replace `src/shared/tree-view/TreeViewDemo.tsx`:

```tsx
import { useState } from "react"
import { Folder, FolderOpen, FileText, Star, Trash2, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TreeView } from "./TreeView"
import type { TreeDataItem, TreeDragEndEvent } from "./types"

const baseData: TreeDataItem[] = [
  {
    id: "docs",
    name: "Documents",
    icon: Folder,
    openIcon: FolderOpen,
    children: [
      {
        id: "work",
        name: "Work",
        icon: Folder,
        openIcon: FolderOpen,
        children: [
          {
            id: "report",
            name: "Annual Report.pdf",
            icon: FileText,
            actions: (
              <>
                <Button variant="ghost" size="icon-xs" className="size-5">
                  <Edit3 className="size-3" />
                </Button>
                <Button variant="ghost" size="icon-xs" className="size-5 text-destructive">
                  <Trash2 className="size-3" />
                </Button>
              </>
            ),
          },
          { id: "budget", name: "Budget.xlsx", icon: FileText },
        ],
      },
      {
        id: "personal",
        name: "Personal",
        icon: Folder,
        openIcon: FolderOpen,
        children: [
          { id: "resume", name: "Resume.docx", icon: FileText },
          {
            id: "photo",
            name: "Photos",
            icon: Folder,
            openIcon: FolderOpen,
            children: [
              { id: "trip", name: "Trip 2025", icon: Folder },
              { id: "family", name: "Family.jpg", icon: FileText },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    icon: Folder,
    openIcon: FolderOpen,
    children: [
      {
        id: "web",
        name: "Website",
        icon: Folder,
        openIcon: FolderOpen,
        children: [
          { id: "index", name: "index.html", icon: FileText },
          { id: "styles", name: "styles.css", icon: FileText },
        ],
      },
      { id: "mobile", name: "Mobile App (disabled)", icon: Folder, disabled: true },
    ],
  },
  {
    id: "favorites",
    name: "Favorites",
    icon: Star,
    children: [
      { id: "link1", name: "Shadcn UI", icon: FileText },
      { id: "link2", name: "Tailwind CSS", icon: FileText },
    ],
  },
]

export default function TreeViewDemo() {
  const [selectedItem, setSelectedItem] = useState<TreeDataItem | undefined>()
  const [expandAll, setExpandAll] = useState(false)
  const [reorderable, setReorderable] = useState(false)
  const [treeData, setTreeData] = useState<TreeDataItem[]>(baseData)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev].slice(0, 10))
  }

  const handleDragEnd = (event: TreeDragEndEvent) => {
    if (event.canceled) {
      addLog(`Canceled: ${event.reason}`)
    } else {
      setTreeData(event.newData)
      addLog(`Moved "${event.active.name}" ${event.position} "${event.over.name}"`)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-medium text-foreground">TreeView 组件演示</h1>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => setExpandAll((v) => !v)}>
          {expandAll ? "全部折叠" : "全部展开"}
        </Button>
        <Button variant={reorderable ? "default" : "outline"} onClick={() => setReorderable((v) => !v)}>
          {reorderable ? "禁用拖拽" : "启用拖拽"}
        </Button>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <TreeView
          data={treeData}
          expandAll={expandAll}
          onSelectChange={setSelectedItem}
          defaultNodeIcon={Folder}
          defaultLeafIcon={FileText}
          className="text-sm"
          reorderable={reorderable}
          onTreeDragEnd={handleDragEnd}
          canDrop={({ over, position }) => {
            // Example: prevent dropping into "favorites" folder
            if (over.id === "favorites" && position === "inside") return false
            return true
          }}
        />
      </div>

      {selectedItem && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          已选中：
          <span className="font-medium text-foreground">{selectedItem.name}</span>
          {" "}(id: {selectedItem.id})
        </div>
      )}

      {logs.length > 0 && (
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-medium">操作日志</h3>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify dev server**

```bash
npm run dev
```

Open the dev server in browser. Verify:
1. Tree renders correctly without errors
2. "启用拖拽" button toggles drag handles on/off
3. Drag handles appear on the left of each node
4. Dragging a node shows the DragOverlay clone
5. Dropping on targets shows correct visual feedback (lines / highlight)
6. Operation log updates correctly
7. Existing functionality (select, expand, collapse, keyboard nav) still works

- [ ] **Step 3: Commit**

```bash
git add src/shared/tree-view/TreeViewDemo.tsx
git commit -m "feat(tree-view): update demo with drag-and-drop controls and logging"
```

---

## Task 9: Final Verification

**Files:**
- All modified files

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass, including the new `useTreeDnD.test.ts`.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(tree-view): complete drag-and-drop sorting implementation"
```

---

## Self-Review

### Spec Coverage

| Spec Section | Implementing Task |
|--------------|------------------|
| Architecture (DndContext + SortableContext + DragOverlay) | Task 7 |
| File split (TreeNode extraction) | Task 5 |
| `reorderable` / `onTreeDragEnd` / `canDrop` props | Task 2 |
| Controlled/uncontrolled data flow | Task 7 |
| `droppable` field on TreeDataItem | Task 2 + Task 3 |
| Drop position detection (33%/67%) | Task 6 + Task 7 |
| Default drop rules (same-node, descendant, disabled, etc.) | Task 3 + Task 4 |
| Drag handle only (not full row) | Task 7 (TreeNode) |
| Visual feedback (lines, highlight, opacity) | Task 7 (TreeNode) |
| Auto-expand on inside drop | Task 6 + Task 7 |
| Accessibility (aria-live, screen reader) | Task 7 |
| Disabled node behavior | Task 3 + Task 4 + Task 7 |
| Pure `moveNode` function | Task 3 |
| Unit tests for algorithm | Task 4 |
| Demo updates | Task 8 |

**Gaps:** None. All spec requirements are covered.

### Placeholder Scan

No TBD, TODO, or vague steps found. All steps contain actual code, commands, and expected outputs.

### Type Consistency

- `DropPosition` = `'above' | 'below' | 'inside'` — consistent across all tasks
- `TreeDragEndEvent` — union type with `canceled` discriminator — consistent
- `moveNode` signature matches usage in Task 6
- `useTreeDnD` return type matches consumption in Task 7
- Prop names (`reorderable`, `onTreeDragEnd`, `canDrop`) consistent between types, hook, and component
