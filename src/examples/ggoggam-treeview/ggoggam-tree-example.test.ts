import { describe, expect, it } from "vitest"
import {
  buildMoveLog,
  flattenTreeNames,
  initialTreeItems,
} from "./ggoggam-tree-example"

describe("ggoggam tree example helpers", () => {
  it("flattens nested tree names in structural order", () => {
    expect(flattenTreeNames(initialTreeItems)).toEqual([
      "Storefront",
      "Hero section",
      "Campaign banner",
      "Product navigation",
      "Collections",
      "Summer edit",
      "Outlet",
      "Footer",
      "Legal links",
      "Newsletter",
    ])
  })

  it("builds a compact move log when order changes", () => {
    expect(
      buildMoveLog(
        ["Storefront", "Hero section", "Campaign banner"],
        ["Hero section", "Campaign banner", "Storefront"]
      )
    ).toBe(
      "Order changed: Storefront -> Hero section -> Campaign banner to Hero section -> Campaign banner -> Storefront"
    )
  })
})
