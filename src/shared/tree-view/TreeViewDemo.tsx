import { useState } from "react"
import { Folder, FolderOpen, FileText, Star, Trash2, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TreeView } from "./TreeView"
import type { TreeDataItem } from "./types"

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
          { id: "photo", name: "Photos", icon: Folder, openIcon: FolderOpen, children: [
            { id: "trip", name: "Trip 2025", icon: Folder },
            { id: "family", name: "Family.jpg", icon: FileText },
          ]},
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

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-medium text-foreground">TreeView 组件演示</h1>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => setExpandAll((v) => !v)}>
          {expandAll ? "全部折叠" : "全部展开"}
        </Button>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <TreeView
          data={baseData}
          expandAll={expandAll}
          onSelectChange={setSelectedItem}
          defaultNodeIcon={Folder}
          defaultLeafIcon={FileText}
          className="text-sm"
        />
      </div>

      {selectedItem && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          已选中：
          <span className="font-medium text-foreground">{selectedItem.name}</span>
          {" "}(id: {selectedItem.id})
        </div>
      )}
    </div>
  )
}
