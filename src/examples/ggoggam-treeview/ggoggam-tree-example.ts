import type { TreeNodeNested } from "./registry/components/tree-view"

export interface ExampleTreeData {
  name: string
  type: "page" | "section" | "collection" | "system"
  locked?: boolean
  description?: string
}

export type ExampleTreeItem = TreeNodeNested<ExampleTreeData>

export const initialTreeItems: ExampleTreeItem[] = [
  {
    id: "storefront",
    data: {
      name: "Storefront",
      type: "page",
      description: "Main homepage layout",
    },
    isGroup: true,
    children: [
      {
        id: "hero",
        data: {
          name: "Hero section",
          type: "section",
          description: "Primary visual and headline",
        },
      },
      {
        id: "campaign-banner",
        data: {
          name: "Campaign banner",
          type: "section",
          description: "Seasonal promotion block",
        },
      },
      {
        id: "product-navigation",
        data: {
          name: "Product navigation",
          type: "section",
          description: "Shop links and filters",
        },
      },
    ],
  },
  {
    id: "collections",
    data: {
      name: "Collections",
      type: "collection",
      description: "Merchandising groups",
    },
    isGroup: true,
    children: [
      {
        id: "summer-edit",
        data: {
          name: "Summer edit",
          type: "collection",
          description: "Warm-weather products",
        },
      },
      {
        id: "outlet",
        data: {
          name: "Outlet",
          type: "collection",
          description: "Discounted inventory",
        },
      },
    ],
  },
  {
    id: "footer",
    data: {
      name: "Footer",
      type: "system",
      description: "Locked global footer",
      locked: true,
    },
    isGroup: true,
    children: [
      {
        id: "legal-links",
        data: {
          name: "Legal links",
          type: "system",
          description: "Terms, privacy, returns",
          locked: true,
        },
      },
      {
        id: "newsletter",
        data: {
          name: "Newsletter",
          type: "section",
          description: "Email capture form",
        },
      },
    ],
  },
]

export function flattenTreeNames(items: ExampleTreeItem[]): string[] {
  const names: string[] = []

  const walk = (nodes: ExampleTreeItem[]) => {
    for (const node of nodes) {
      names.push(node.data.name)

      if (node.children) {
        walk(node.children)
      }
    }
  }

  walk(items)

  return names
}

export function buildMoveLog(before: string[], after: string[]): string {
  if (before.join("\u0000") === after.join("\u0000")) {
    return "Order unchanged"
  }

  return `Order changed: ${before.join(" -> ")} to ${after.join(" -> ")}`
}

export function getExpandedGroupIds(items: ExampleTreeItem[]): string[] {
  const ids: string[] = []

  const walk = (nodes: ExampleTreeItem[]) => {
    for (const node of nodes) {
      if (node.isGroup || (node.children && node.children.length > 0)) {
        ids.push(node.id)
      }

      if (node.children) {
        walk(node.children)
      }
    }
  }

  walk(items)

  return ids
}
