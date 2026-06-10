# Ant Design Tree 到 ggoggam/shadcn-treeview 迁移说明

## 背景

目标是把现有使用 Ant Design `Tree` 的业务组件，迁移到当前项目新增的 ggoggam/shadcn-treeview 示例组件体系：

- registry 组件目录：`src/examples/ggoggam-treeview/registry`
- 使用示例：`src/examples/ggoggam-treeview/GgoggamTreeViewExample.tsx`
- 示例数据与辅助函数：`src/examples/ggoggam-treeview/ggoggam-tree-example.ts`

本文默认你的现有业务组件主要使用 AntD Tree 的基础能力和拖拽能力：`treeData`、展开、选中、自定义节点渲染、`draggable`、`allowDrop`、`onDrop`。

## 核心差异

AntD Tree 是完整 UI 组件，节点结构、图标、选中态、拖拽态、禁用态都由组件提供默认表现。ggoggam TreeView 更接近 headless/unstyled 组件：它负责树状态、键盘导航、展开、选中、拖拽重排；节点 UI 需要通过 `renderNode` 自己渲染。

迁移时不要尝试一比一替换 JSX prop，而是先做三件事：

1. 把 AntD 的 `treeData` 转成 ggoggam 的 `items`
2. 把 AntD 的 `onDrop` 重排逻辑迁移到 `onItemsChange`
3. 把 AntD 的 `titleRender` / `icon` / 样式迁移到 `renderNode`

## API 对照

| AntD Tree | ggoggam TreeView | 迁移说明 |
|---|---|---|
| `treeData` | `items` | AntD 节点是 `{ key, title, children }`；ggoggam 节点是 `{ id, data, isGroup, children }` |
| `fieldNames` | 无直接等价 | 先写 adapter，把业务字段统一映射到 `TreeNodeNested<T>` |
| `selectedKeys` | `selectedIds` | 都是受控选中 key/id 数组 |
| `onSelect` | `onSelectedIdsChange` + `renderNode` 内调用 `select(event)` | ggoggam 的节点点击由 `renderNode` 自己绑定 |
| `expandedKeys` | `expandedIds` | 都是受控展开 key/id 数组 |
| `onExpand` | `onExpandedIdsChange` | 直接保存新的 expanded id 数组 |
| `defaultExpandAll` | `defaultExpandAll` | 只在初始化生效；异步数据建议改受控 `expandedIds` |
| `draggable` | `draggable` | ggoggam 需要同时给 `droppable` 才允许投放 |
| `allowDrop` | `canDrop` | AntD 参数是 `{ dropNode, dropPosition }`；ggoggam 参数是 `TreeDragEvent<T>` |
| `onDrop` | `onItemsChange` + `onDragEnd` | ggoggam 内部已经计算新树结构，`onItemsChange(nextItems)` 是主要落点 |
| `titleRender` | `renderNode` | 所有节点 UI 都在这里实现 |
| `icon` / `showIcon` | `renderNode` | 自己渲染图标 |
| `showLine` | `showGuideLines` + `renderNode` | ggoggam 有 guide line，但样式与 AntD 不完全一致 |
| `loadData` | `loadChildren` | 返回 `Promise<TreeNodeNested<T>[]>` |
| `multiple` | `selectionMode="multiple"` | 支持多选，且拖拽选中节点时可批量移动 |
| `checkable` / `checkedKeys` | 无内置等价 | 需要在 `renderNode` 中自己渲染 checkbox 并实现 checked/halfChecked 逻辑 |
| `height` / `virtual` | 无内置等价 | 当前生成组件没有虚拟滚动，超大树需要单独评估 |
| `DirectoryTree` | 无直接等价 | 可以用 `renderNode` 模拟目录样式，但行为需自己补齐 |

## 数据结构迁移

AntD 常见数据：

```ts
interface AntTreeNode {
  key: string
  title: React.ReactNode
  children?: AntTreeNode[]
  disabled?: boolean
  selectable?: boolean
  isLeaf?: boolean
  [key: string]: unknown
}
```

ggoggam 数据：

```ts
import type { TreeNodeNested } from "@/examples/ggoggam-treeview/registry/components/tree-view"

interface BizTreeData {
  title: React.ReactNode
  disabled?: boolean
  selectable?: boolean
  original: AntTreeNode
}

type BizTreeItem = TreeNodeNested<BizTreeData>
```

推荐加一个 adapter：

```ts
function toGgoggamItems(nodes: AntTreeNode[]): BizTreeItem[] {
  return nodes.map((node) => ({
    id: String(node.key),
    data: {
      title: node.title,
      disabled: node.disabled,
      selectable: node.selectable,
      original: node,
    },
    isGroup: node.isLeaf === false || Boolean(node.children?.length),
    children: node.children ? toGgoggamItems(node.children) : undefined,
  }))
}
```

如果后端仍然要求 AntD 风格或业务原始树结构，也建议再写一个反向 adapter：

```ts
function toAntTreeData(items: BizTreeItem[]): AntTreeNode[] {
  return items.map((item) => ({
    ...item.data.original,
    key: item.id,
    title: item.data.title,
    disabled: item.data.disabled,
    selectable: item.data.selectable,
    children: item.children ? toAntTreeData(item.children) : undefined,
  }))
}
```

## 基础功能迁移

AntD 写法：

```tsx
<Tree
  treeData={treeData}
  expandedKeys={expandedKeys}
  selectedKeys={selectedKeys}
  onExpand={setExpandedKeys}
  onSelect={(keys) => setSelectedKeys(keys as string[])}
  titleRender={(node) => <TreeTitle node={node} />}
/>
```

ggoggam 写法：

```tsx
<TreeView<BizTreeData>
  items={items}
  expandedIds={expandedIds}
  onExpandedIdsChange={setExpandedIds}
  selectedIds={selectedIds}
  onSelectedIdsChange={setSelectedIds}
  renderNode={({ node, depth, isExpanded, hasChildren, toggle, select }) => (
    <div
      style={{ paddingLeft: depth * 24 }}
      onClick={(event) => {
        if (node.data.selectable === false || node.data.disabled) return
        select(event)
      }}
    >
      {hasChildren ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            toggle()
          }}
        >
          {isExpanded ? "v" : ">"}
        </button>
      ) : null}
      <TreeTitle node={node.data.original} />
    </div>
  )}
/>
```

注意：ggoggam 的 `renderNode` 负责点击、图标、禁用态、行高、缩进、选中样式。迁移时应把原来依赖 AntD 默认样式的部分显式补出来。

## 拖拽迁移

AntD 常见写法：

```tsx
<Tree
  treeData={treeData}
  draggable
  allowDrop={({ dropNode, dropPosition }) => {
    return canDropTo(dropNode.key, dropPosition)
  }}
  onDrop={(info) => {
    const nextTreeData = moveAntTreeNode(treeData, info)
    setTreeData(nextTreeData)
    saveSort(nextTreeData)
  }}
/>
```

ggoggam 写法：

```tsx
<TreeView<BizTreeData>
  items={items}
  draggable
  droppable
  canDrag={(node) => !node.data.disabled}
  canDrop={(event) => {
    if (event.target.data.disabled) return false
    return canDropTo(event.target.id, event.position)
  }}
  onItemsChange={(nextItems) => {
    setItems(nextItems)
    saveSort(toAntTreeData(nextItems))
  }}
  onDragEnd={(event) => {
    trackTreeMove({
      sourceId: event.source.id,
      targetId: event.target.id,
      position: event.position,
      projectedDepth: event.projectedDepth,
    })
  }}
  renderNode={renderBizTreeNode}
/>
```

关键变化：

- AntD 通常在 `onDrop` 中自己计算新树
- ggoggam 已经在内部计算新树，直接通过 `onItemsChange(nextItems)` 返回
- AntD `allowDrop` 更偏投放前判断；ggoggam `canDrop` 使用语义化 `position`
- ggoggam 的 `position` 是 `"before" | "after" | "inside"`，但当前生成实现主要产生 `"after"` 和 `"inside"`；如果你的业务强依赖投放到目标节点上方，需要额外补 before 逻辑

## 禁用节点迁移

AntD 的 `disabled` 会影响节点选择、checkbox 传导和交互。ggoggam 不内置 AntD 的禁用传导规则，建议用业务字段统一控制：

```tsx
canDrag={(node) => !node.data.disabled}
canDrop={(event) => !event.target.data.disabled}
```

并在 `renderNode` 中禁止选择：

```tsx
onClick={(event) => {
  if (node.data.disabled || node.data.selectable === false) return
  select(event)
}}
```

如果你当前使用了 AntD 的 `checkable`，尤其依赖父子半选传导，不能只靠 `selectedIds` 迁移，需要单独实现：

- `checkedIds`
- `halfCheckedIds`
- 父子联动计算
- `checkStrictly` 等价行为
- disabled 节点的传导截断规则

## 异步加载迁移

AntD：

```tsx
<Tree loadData={loadData} loadedKeys={loadedKeys} />
```

ggoggam：

```tsx
<TreeView<BizTreeData>
  items={items}
  loadChildren={async (node) => {
    const children = await fetchChildren(node.id)
    return toGgoggamItems(children)
  }}
  onLoadError={(nodeId, error) => reportLoadError(nodeId, error)}
  renderNode={renderBizTreeNode}
/>
```

迁移异步加载时要注意：节点需要 `isGroup: true` 且 `children` 未加载时允许展开触发 `loadChildren`。

## 推荐迁移步骤

1. 新建 adapter：`toGgoggamItems` / `toAntTreeData`
2. 保留原 AntD 组件不动，新增一个 ggoggam 版本组件并行开发
3. 先迁移只读渲染：`treeData`、展开、选中、`titleRender`
4. 再迁移拖拽：`draggable`、`droppable`、`canDrag`、`canDrop`、`onItemsChange`
5. 最后迁移边缘能力：checkbox、异步加载、右键菜单、搜索过滤、虚拟滚动
6. 用同一份业务数据跑快照/单测，验证迁移前后树结构排序结果一致
7. 灰度替换真实业务组件，保留 AntD 版本回退开关

## 建议测试用例

- 初始渲染顺序与 AntD 版本一致
- 展开/折叠受控状态一致
- 单选/多选结果一致
- 同级拖拽排序后输出树一致
- 跨层级拖拽后输出树一致
- 禁止拖入 disabled 节点
- 禁止拖入自身子树
- 异步加载后可继续拖拽
- 搜索过滤状态下选中/拖拽不会丢失原始树状态

## 需要确认的业务项

请在正式迁移前确认这些点：

1. 当前业务 Tree 是否使用 `checkable`、`checkedKeys`、`halfCheckedKeys` 或 `checkStrictly`
2. 是否依赖 AntD 的虚拟滚动 `height` / `virtual`
3. 拖拽是否必须支持投放到目标节点上方，即严格的 before 位置
4. 是否存在跨 Tree 拖拽
5. 是否使用 `loadData` 异步加载
6. 是否使用 `DirectoryTree`
7. 后端保存排序时需要的是 AntD 原始 `treeData`，还是扁平化 `{ id, parentId, index }`
8. disabled 节点是否需要完全复刻 AntD 的选择/勾选传导规则

## 参考资料

- Ant Design Tree 官方文档：https://ant.design/components/tree/
- 本项目 ggoggam 示例：`src/examples/ggoggam-treeview/GgoggamTreeViewExample.tsx`
