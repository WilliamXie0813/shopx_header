import type {
  TreeDataItem,
  DropPosition,
  DropCancelReason,
  TreeCanDropParams,
  TreeDragEndEvent,
} from "./types"

// ------------------------------------------------------------------
// 1. flattenVisible
// ------------------------------------------------------------------

export function flattenVisible(
  items: TreeDataItem[],
  expandedIds: Set<string>
): TreeDataItem[] {
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

// ------------------------------------------------------------------
// 2. shallowCloneTree
// ------------------------------------------------------------------

export function shallowCloneTree(tree: TreeDataItem[]): TreeDataItem[] {
  return tree.map((node) => ({
    ...node,
    children: node.children ? shallowCloneTree(node.children) : undefined,
  }))
}

// ------------------------------------------------------------------
// 3. findNodeLocation
// ------------------------------------------------------------------

export interface NodeLocation {
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
): NodeLocation | null {
  for (let i = 0; i < siblings.length; i++) {
    const node = siblings[i]
    if (node.id === id) {
      return { node, parent, siblings, index: i }
    }
    if (node.children) {
      const found = findNodeLocation(tree, id, node, node.children)
      if (found) return found
    }
  }
  return null
}

// ------------------------------------------------------------------
// 4. removeNode
// ------------------------------------------------------------------

export interface RemoveNodeResult {
  removed: TreeDataItem
}

export function removeNode(tree: TreeDataItem[], id: string): RemoveNodeResult | null {
  const loc = findNodeLocation(tree, id)
  if (!loc) return null
  loc.siblings.splice(loc.index, 1)
  return { removed: loc.node }
}

// ------------------------------------------------------------------
// 5. isDescendant
// ------------------------------------------------------------------

export function isDescendant(node: TreeDataItem, descendantId: string): boolean {
  if (!node.children || node.children.length === 0) return false
  for (const child of node.children) {
    if (child.id === descendantId) return true
    if (isDescendant(child, descendantId)) return true
  }
  return false
}

// ------------------------------------------------------------------
// 6. isNodeDroppable
// ------------------------------------------------------------------

export function isNodeDroppable(node: TreeDataItem): boolean {
  if (node.droppable === false) return false
  if (node.droppable === true) return true
  // Default: droppable if it already has children, otherwise not
  return !!(node.children && node.children.length > 0)
}

// ------------------------------------------------------------------
// 7. moveNode
// ------------------------------------------------------------------

export function moveNode(
  tree: TreeDataItem[],
  sourceId: string,
  targetId: string,
  position: DropPosition,
  canDrop?: (params: TreeCanDropParams) => boolean
): TreeDragEndEvent {
  const newData = shallowCloneTree(tree)

  const sourceLoc = findNodeLocation(newData, sourceId)
  const targetLoc = findNodeLocation(newData, targetId)

  // Guard: no target
  if (!targetLoc) {
    return {
      canceled: true,
      reason: "no-target",
      active: sourceLoc?.node ?? { id: sourceId, name: "" },
      over: null,
    }
  }

  const sourceNode = sourceLoc!.node
  const targetNode = targetLoc.node

  // Guard: same node
  if (sourceId === targetId) {
    return {
      canceled: true,
      reason: "same-node",
      active: sourceNode,
      over: targetNode,
    }
  }

  // Guard: target is descendant of source
  if (isDescendant(sourceNode, targetId)) {
    return {
      canceled: true,
      reason: "descendant-target",
      active: sourceNode,
      over: targetNode,
    }
  }

  // Guard: disabled node
  if (sourceNode.disabled || targetNode.disabled) {
    return {
      canceled: true,
      reason: "disabled-node",
      active: sourceNode,
      over: targetNode,
    }
  }

  // Guard: position inside but target not droppable
  if (position === "inside" && !isNodeDroppable(targetNode)) {
    return {
      canceled: true,
      reason: "drop-disallowed",
      active: sourceNode,
      over: targetNode,
    }
  }

  // Guard: custom canDrop
  if (canDrop) {
    const allowed = canDrop({
      active: sourceNode,
      over: targetNode,
      position,
      currentData: newData,
    })
    if (!allowed) {
      return {
        canceled: true,
        reason: "drop-disallowed",
        active: sourceNode,
        over: targetNode,
      }
    }
  }

  // Remove source from its current location
  const removeResult = removeNode(newData, sourceId)
  if (!removeResult) {
    return {
      canceled: true,
      reason: "no-target",
      active: sourceNode,
      over: targetNode,
    }
  }

  // Re-locate target after removal (indices may have shifted)
  const freshTargetLoc = findNodeLocation(newData, targetId)
  if (!freshTargetLoc) {
    return {
      canceled: true,
      reason: "no-target",
      active: sourceNode,
      over: targetNode,
    }
  }

  const movedNode = removeResult.removed

  switch (position) {
    case "above": {
      freshTargetLoc.siblings.splice(freshTargetLoc.index, 0, movedNode)
      break
    }
    case "below": {
      freshTargetLoc.siblings.splice(freshTargetLoc.index + 1, 0, movedNode)
      break
    }
    case "inside": {
      if (!freshTargetLoc.node.children) {
        freshTargetLoc.node.children = []
      }
      freshTargetLoc.node.children.push(movedNode)
      break
    }
  }

  return {
    canceled: false,
    active: sourceNode,
    over: targetNode,
    position,
    newData,
  }
}
