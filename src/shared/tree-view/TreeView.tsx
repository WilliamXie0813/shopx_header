import * as React from "react"
import { ChevronRight, Folder, FolderOpen, File } from "lucide-react"
import { cn } from "@/lib/utils"
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

// ---- TreeNode ----

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

function TreeNodeInner({
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
        {/* Expand/Collapse chevron */}
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

        {/* Icon */}
        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}

        {/* Label */}
        <span className="flex-1 truncate">{item.name}</span>

        {/* Actions */}
        {item.actions && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {item.actions}
          </div>
        )}
      </div>

      {/* Children */}
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

const TreeNode = React.memo(TreeNodeInner)

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
  const items = React.useMemo(() => (Array.isArray(data) ? data : [data]), [data])
  const allExpandableIds = React.useMemo(() => collectExpandableIds(items), [items])

  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSelectedItemId ?? null
  )
  const [focusedId, setFocusedId] = React.useState<string | null>(
    initialSelectedItemId ?? null
  )

  const [expandedIdsState, setExpandedIdsState] = React.useState<Set<string>>(new Set())
  const expandedIds = expandAll ? allExpandableIds : expandedIdsState
  const currentSelectedId = selectedItemId ?? selectedId
  const currentFocusedId = selectedItemId ?? focusedId

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

  const handleToggle = React.useCallback((id: string) => {
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
  }, [expandAll])

  const handleFocusChange = React.useCallback((id: string | null) => {
    setFocusedId(id)
  }, [])

  const focusableId = React.useMemo(() => {
    if (currentFocusedId) {
      const visible = flattenVisible(items, expandedIds)
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
    return walk(items)
  }, [currentFocusedId, items, expandedIds])

  const handleTreeKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!focusableId) return

      const visibleItems = flattenVisible(items, expandedIds)
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
            const parent = findParent(items, currentItem.id)
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
    [expandAll, focusableId, items, expandedIds, onSelectChange, selectedItemId]
  )

  return (
    <div
      role="tree"
      className={cn("w-full", className)}
      onKeyDown={handleTreeKeyDown}
      {...props}
    >
      {items.map((item) => (
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
        />
      ))}
    </div>
  )
}
