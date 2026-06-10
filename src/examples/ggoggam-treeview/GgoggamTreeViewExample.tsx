import { useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  GripVertical,
  Layers,
  Lock,
  PanelTop,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  TreeView,
  type TreeDragEvent,
  type TreeNodeRenderProps,
} from "./registry/components/tree-view"
import {
  buildMoveLog,
  flattenTreeNames,
  getExpandedGroupIds,
  initialTreeItems,
  type ExampleTreeData,
  type ExampleTreeItem,
} from "./ggoggam-tree-example"

const typeStyles: Record<ExampleTreeData["type"], string> = {
  page: "border-sky-200 bg-sky-50 text-sky-700",
  section: "border-emerald-200 bg-emerald-50 text-emerald-700",
  collection: "border-amber-200 bg-amber-50 text-amber-700",
  system: "border-zinc-200 bg-zinc-100 text-zinc-600",
}

const typeIcons = {
  page: PanelTop,
  section: Layers,
  collection: Folder,
  system: Lock,
}

function TreeRow({
  node,
  isExpanded,
  isSelected,
  isFocused,
  isDragging,
  depth,
  hasChildren,
  toggle,
  select,
}: TreeNodeRenderProps<ExampleTreeData>) {
  const TypeIcon = typeIcons[node.data.type]

  return (
    <div
      className={cn(
        "group flex min-h-10 items-center gap-2 rounded-md border border-transparent py-1.5 pr-2 text-sm transition-colors",
        isSelected && "border-primary/20 bg-primary/10 text-primary",
        isFocused && "ring-2 ring-ring/40",
        isDragging && "opacity-50",
        !isSelected && "hover:bg-muted"
      )}
      style={{ paddingLeft: depth * 24 + 8 }}
      onClick={select}
    >
      <GripVertical
        className={cn(
          "size-4 shrink-0 text-muted-foreground opacity-45 transition-opacity group-hover:opacity-100",
          node.data.locked && "opacity-20"
        )}
        aria-hidden="true"
      />

      <button
        type="button"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-background",
          !hasChildren && "invisible"
        )}
        onClick={(event) => {
          event.stopPropagation()
          toggle()
        }}
        aria-label={isExpanded ? "Collapse node" : "Expand node"}
      >
        {isExpanded ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>

      <TypeIcon className="size-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-foreground">
            {node.data.name}
          </span>
          <span
            className={cn(
              "shrink-0 rounded border px-1.5 py-0.5 text-[11px] leading-none",
              typeStyles[node.data.type]
            )}
          >
            {node.data.type}
          </span>
        </div>
        {node.data.description ? (
          <div className="truncate text-xs text-muted-foreground">
            {node.data.description}
          </div>
        ) : null}
      </div>

      {node.data.locked ? (
        <Lock className="size-3.5 shrink-0 text-muted-foreground" />
      ) : null}
    </div>
  )
}

function renderOverlay(props: TreeNodeRenderProps<ExampleTreeData>) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <FileText className="size-4 text-muted-foreground" />
      <span className="font-medium text-foreground">{props.node.data.name}</span>
    </div>
  )
}

export default function GgoggamTreeViewExample() {
  const [items, setItems] = useState<ExampleTreeItem[]>(initialTreeItems)
  const [logs, setLogs] = useState<string[]>([
    "Drag enabled. Move rows by grabbing the handle area.",
  ])

  const expandedIds = useMemo(() => getExpandedGroupIds(items), [items])
  const flatNames = useMemo(() => flattenTreeNames(items), [items])

  const handleItemsChange = (nextItems: ExampleTreeItem[]) => {
    const before = flattenTreeNames(items)
    const after = flattenTreeNames(nextItems)

    setItems(nextItems)
    setLogs((current) => [buildMoveLog(before, after), ...current].slice(0, 5))
  }

  const handleDragEnd = (event: TreeDragEvent<ExampleTreeData>) => {
    setLogs((current) =>
      [
        `Dropped "${event.source.data.name}" ${event.position} "${event.target.data.name}"`,
        ...current,
      ].slice(0, 5)
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            ggoggam/shadcn-treeview example
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Controlled tree data, drag sorting, nested moves, locked-node guard.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setItems(initialTreeItems)
            setLogs(["Tree reset to initial order."])
          }}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="rounded-lg border border-border bg-card p-3">
          <TreeView<ExampleTreeData>
            aria-label="Sortable storefront tree"
            items={items}
            onItemsChange={handleItemsChange}
            expandedIds={expandedIds}
            onDragEnd={handleDragEnd}
            draggable
            droppable
            indentationWidth={24}
            guideLineOffset={18}
            canDrag={(node) => !node.data.locked}
            canDrop={(event) => !event.target.data.locked}
            renderNode={(props) => <TreeRow {...props} />}
            renderDragOverlay={renderOverlay}
            className="text-sm"
          />
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-foreground">Current order</h3>
            <ol className="mt-3 space-y-1 text-sm text-muted-foreground">
              {flatNames.map((name, index) => (
                <li key={`${name}-${index}`} className="flex gap-2">
                  <span className="w-6 shrink-0 text-right tabular-nums">
                    {index + 1}.
                  </span>
                  <span className="truncate">{name}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-foreground">Event log</h3>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {logs.map((log, index) => (
                <div
                  key={`${log}-${index}`}
                  className="rounded-md bg-muted px-2 py-1.5"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
