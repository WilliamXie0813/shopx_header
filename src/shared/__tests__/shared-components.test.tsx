import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Badge } from "../badge"
import { Button } from "../button"
import { MessageProvider, useMessage } from "../message"
import { TreeView } from "../tree-view"
import type { TreeDataItem } from "../tree-view"

describe("Badge", () => {
  it("renders zero when showZero is enabled", () => {
    render(<Badge count={0} showZero />)

    expect(screen.getByText("0")).not.toHaveClass("hidden")
  })
})

describe("Button", () => {
  it("does not navigate when a link button is disabled", () => {
    render(
      <Button href="/danger-zone" disabled>
        Disabled Link
      </Button>
    )

    const link = screen.getByText("Disabled Link").closest("a")

    expect(link).toHaveAttribute("aria-disabled", "true")
    expect(link).not.toHaveAttribute("href")
    expect(link).toHaveAttribute("tabindex", "-1")
  })
})

describe("MessageProvider", () => {
  function MessageHarness() {
    const message = useMessage()

    return (
      <>
        <button
          type="button"
          onClick={() => message.info({ key: "same", content: "First", duration: 0 })}
        >
          first
        </button>
        <button
          type="button"
          onClick={() => message.info({ key: "same", content: "Second", duration: 0 })}
        >
          second
        </button>
      </>
    )
  }

  it("replaces an existing message when the same key is opened again", async () => {
    const user = userEvent.setup()

    render(
      <MessageProvider>
        <MessageHarness />
      </MessageProvider>
    )

    await user.click(screen.getByRole("button", { name: "first" }))
    await user.click(screen.getByRole("button", { name: "second" }))

    expect(screen.queryByText("First")).not.toBeInTheDocument()
    expect(screen.getAllByText("Second")).toHaveLength(1)
  })
})

describe("TreeView", () => {
  it("skips disabled nodes during keyboard navigation", async () => {
    const user = userEvent.setup()
    const onSelectChange = vi.fn()
    const data: TreeDataItem[] = [
      { id: "first", name: "First" },
      { id: "disabled", name: "Disabled", disabled: true },
      { id: "second", name: "Second" },
    ]

    render(
      <TreeView
        data={data}
        initialSelectedItemId="first"
        onSelectChange={onSelectChange}
      />
    )

    screen.getByRole("treeitem", { name: /First/ }).focus()
    await user.keyboard("{ArrowDown}")

    expect(onSelectChange).toHaveBeenCalledTimes(1)
    expect(onSelectChange).toHaveBeenLastCalledWith(data[2])
    expect(screen.getByRole("treeitem", { name: /Disabled/ })).toHaveAttribute(
      "aria-selected",
      "false"
    )
  })
})
