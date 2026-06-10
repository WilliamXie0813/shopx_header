# TreeView 拖拽排序设计文档

## 背景

现有 `src/shared/tree-view` 组件支持递归树渲染、展开折叠、选中状态、键盘导航和禁用状态，但不支持节点拖拽排序。需要通过 `@dnd-kit` 库为其增加拖拽能力，支持同级排序和跨层级移动。

## 目标

在保持现有功能完整性的前提下，为 TreeView 组件增加拖拽排序能力：
- 同级节点之间调整顺序
- 跨层级移动（将节点拖入其他父节点）
- 基于鼠标位置的智能放置（上方/下方/内部）
- 支持受控和非受控两种数据管理模式，且避免内部排序状态与外部 `data` prop 形成半受控冲突

## 范围

- **文件变更**：`types.ts`、`TreeView.tsx`、`TreeNode.tsx`（拆分）、`TreeViewDemo.tsx`
- **新增文件**：`useTreeDnD.ts`、`useTreeDnD.test.ts`
- **新增依赖**：`@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities`
- **排除范围**：键盘拖拽排序（V1 仅支持鼠标/指针拖拽）。现有键盘导航必须保持可用，V1 需要提供清晰的 drag handle、焦点样式和屏幕阅读器状态说明；键盘重排作为后续增强。

## 架构

### 组件结构

```
TreeView
└── DndContext (only when reorderable)
    ├── SortableContext
    │   └── TreeNode[] (visible nodes, each wrapped with useSortable)
    └── DragOverlay (shows dragged item clone)
```

### 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `types.ts` | 修改 | 新增 `reorderable`、`onTreeDragEnd`、`defaultData`、`droppable`、`canDrop` 等类型 |
| `TreeView.tsx` | 修改 | 集成 DndContext、SortableContext，调用 useTreeDnD |
| `TreeNode.tsx` | **拆分（新增）** | 从 TreeView.tsx 中独立出来，接入 `useSortable`，仅在 drag handle 上绑定拖拽 listeners |
| `useTreeDnD.ts` | 新增 | 封装 DnD 状态、碰撞检测、树重组逻辑 |
| `TreeViewDemo.tsx` | 修改 | 增加拖拽开关和操作日志展示 |
| `useTreeDnD.test.ts` | 新增 | 覆盖树重组算法、取消态、禁用节点和可投放规则 |

> `TreeNode` 拆分为独立文件的原因：现有 `TreeView.tsx` 已有 395 行，加入 DnD 后会超过 600 行。dnd-kit 的 `useSortable` 需要注入到每个节点中，独立文件后逻辑更清晰。

### 数据流

1. **初始化**：根据受控/非受控模式得到 `currentData`，再通过 `flattenVisible()` 展平当前可见节点 → 作为 `SortableContext` 的 `items`
2. **拖拽开始**：记录 `activeId`，被拖拽节点通过 CSS 降低透明度，由 `DragOverlay` 显示跟随鼠标的克隆节点
3. **拖拽过程中**：自定义 `collisionDetection` 计算鼠标与目标节点的相对位置 → 判断放置意图（上方 / 下方 / 内部），并通过 `canDrop` 过滤非法目标
4. **拖拽结束**：`useTreeDnD` 执行纯函数树重组算法，返回移动成功或取消结果；成功时非受控模式更新内部 `currentData`，受控模式只通过回调交给调用方更新
5. **展开状态处理**：如果成功拖入折叠目标，`TreeView` 在 `handleDragEnd` 层更新 `expandedIdsState`；`moveNode` 不处理展开副作用

`SortableContext.items` 必须使用 `flattenVisible(currentData, expandedIds).map((item) => item.id)`，并配置 `verticalListSortingStrategy`。递归渲染出来的可见节点顺序必须与这个 flat order 完全一致，否则 dnd-kit 的排序测量和视觉投放位置会错位。

## API 设计

### TreeViewProps 扩展

```ts
export interface TreeDataItem {
  id: string
  name: string
  // ... 现有字段

  /** 是否允许其他节点拖入此节点。默认：已有 children 的节点为 true，叶子节点为 false。 */
  droppable?: boolean
}

export type DropPosition = 'above' | 'below' | 'inside'
export type DropCancelReason =
  | 'no-target'
  | 'same-node'
  | 'descendant-target'
  | 'disabled-node'
  | 'drop-disallowed'

interface BaseTreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  // ... 现有 props（除 data 外）

  /** 是否启用拖拽排序。默认 false，保持向后兼容。 */
  reorderable?: boolean

  /** 自定义投放规则。返回 false 时该目标不显示投放反馈，也不会触发移动。 */
  canDrop?: (params: TreeCanDropParams) => boolean

  /** 拖拽结束回调。命名避开 React 原生 onDragEnd DOM 事件。 */
  onTreeDragEnd?: (event: TreeDragEndEvent) => void
}

export type TreeViewProps = BaseTreeViewProps & (
  | {
      /** 受控模式：外部 data 是唯一数据源。 */
      data: TreeDataItem[] | TreeDataItem
      defaultData?: never
    }
  | {
      /** 非受控模式：仅用于初始化内部树数据。 */
      defaultData: TreeDataItem[] | TreeDataItem
      data?: never
    }
)

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
```

### 受控 / 非受控双模式

组件不能把外部 `data` 同步进内部 `dragData` 再用 `useEffect([data])` 清空缓存，这会形成半受控状态：父组件只要重新创建 `data` 引用，内部排序就会丢失。

采用明确的受控/非受控互斥模型：

| 模式 | 条件 | 行为 |
|------|------|------|
| **受控** | 提供 `data` | `data` 是唯一数据源。拖拽成功后只触发 `onTreeDragEnd({ canceled: false, newData })`，由外部更新 `data`。 |
| **非受控** | 提供 `defaultData` | 组件初始化内部 `currentData`。拖拽成功后内部 `setCurrentData(newData)`，并仍触发 `onTreeDragEnd` 供调用方记录日志。 |

```tsx
const isControlled = data !== undefined

const [uncontrolledData, setUncontrolledData] = React.useState<TreeDataItem[]>(() =>
  normalizeTreeData(defaultData)
)

const currentData = isControlled ? normalizeTreeData(data) : uncontrolledData
```

### 使用示例

**非受控（最简单）：**
```tsx
<TreeView defaultData={data} reorderable />
```

**受控（外部管理数据）：**
```tsx
const [treeData, setTreeData] = useState(data)

<TreeView
  data={treeData}
  reorderable
  onTreeDragEnd={(event) => {
    if (!event.canceled) setTreeData(event.newData)
  }}
/>
```

**限制可投放目标：**
```tsx
<TreeView
  data={treeData}
  reorderable
  canDrop={({ over, position }) => position !== 'inside' || over.droppable === true}
/>
```

## 交互设计

### 放置位置判断策略

标准碰撞检测无法区分"上方/下方/内部"，需要自定义：

1. **碰撞检测**：先用 `pointerWithin` 找到鼠标所在的可用节点。disabled 节点不注册 droppable，也不会成为排序锚点。
2. **位置计算**：在 `onDragOver` / `handleDragEnd` 中，计算鼠标 Y 坐标相对于目标节点 rect 的位置比例
   - **上 1/3（< 33%）** → `above`：插入为目标节点的**前一个兄弟**
   - **下 1/3（> 67%）** → `below`：插入为目标节点的**后一个兄弟**
   - **中间 1/3（33%~67%）** → `inside`：成为目标节点的**子节点**
3. **缩进修正**：如果鼠标 X 坐标明显位于目标节点的内容区域右侧，且目标允许接收子节点，优先判定为 `inside`。不能把“鼠标在缩进空白区”解释为 `inside`，否则用户在树层级左侧拖动时会误触跨层移动。
4. **投放规则过滤**：得到初步 `position` 后执行默认规则和 `canDrop`。规则不通过时清空目标反馈，结束拖拽时返回 `canceled: true`。

### 可投放规则

默认规则：
- `active.id === over.id` → 取消，reason 为 `same-node`
- `over` 位于 `active` 子树中 → 取消，reason 为 `descendant-target`
- `active.disabled` 或 `over.disabled` → 取消，reason 为 `disabled-node`
- `position === 'inside'` 时，仅当 `over.droppable === true` 或 `over.children?.length > 0` 时允许；`over.droppable === false` 显式禁止
- `position === 'above' | 'below'` 时，目标节点必须是 enabled；disabled 节点本身及其周围都不作为排序锚点
- 如果提供 `canDrop(params)` 且返回 `false` → 取消，reason 为 `drop-disallowed`

`droppable` 只表达“是否允许接收子节点”，不影响节点能否被拖动或能否作为 above/below 的排序锚点。更复杂的业务规则通过 `canDrop` 表达，例如同类型节点限制、最大深度限制、禁止跨根移动等。

### 拖拽触发区域

拖拽 listeners 只绑定到独立 drag handle，不绑定整行节点：
- 整行点击仍负责选中节点
- 展开按钮仍负责展开/折叠
- `item.actions` 内的按钮不触发拖拽
- drag handle 使用 `aria-label="Drag ${item.name}"`，有可见 focus ring
- `PointerSensor` 设置 `activationConstraint: { distance: 6 }`，减少点击误触拖拽

### 视觉反馈

| 状态 | 效果 |
|------|------|
| 拖拽中（原节点） | `opacity: 0.3`，DragOverlay 显示高对比度克隆节点跟随鼠标 |
| 目标节点上方放置 | 目标节点顶部显示蓝色指示线（横跨整行） |
| 目标节点下方放置 | 目标节点底部显示蓝色指示线（横跨整行） |
| 目标节点内部放置 | 目标节点背景变为 `bg-primary/5`，暗示将成为容器 |
| disabled 节点 | 不参与碰撞检测，拖拽经过时无任何反馈 |
| 不允许投放 | 不显示指示线，必要时通过 `aria-live` 提示“Cannot move here” |

### disabled 节点行为

disabled 的节点**完全禁用**拖拽交互：
- 不能被拖拽（不绑定 Draggable 传感器）
- 不能作为放置目标（从碰撞检测中过滤）
- 其他节点不能拖入其中，也不能拖到其周围排序

### 可访问性

V1 不实现键盘重排，但必须保留现有 TreeView 键盘导航：
- `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` / `Home` / `End` 行为不变
- drag handle 可聚焦，但不拦截树节点的 roving tabindex
- 拖拽开始、可投放位置变化、取消和成功移动通过 `aria-live="polite"` 文本公告
- 屏幕阅读器文案避免承诺键盘拖拽能力，例如“Drag handle. Mouse drag reordering is available.”
- 后续键盘重排设计应基于 dnd-kit `KeyboardSensor` 独立补充

## 树重组算法

### 核心函数

```ts
type MoveNodeResult =
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

function moveNode(
  tree: TreeDataItem[],
  sourceId: string,
  targetId: string | null,
  position: DropPosition,
  canDrop?: (params: TreeCanDropParams) => boolean
): MoveNodeResult
```

### 算法步骤

1. **深拷贝原树** — 避免直接修改原数据，使用递归浅拷贝（非 `structuredClone`，保留 React 组件引用如 `icon`）

2. **前置校验**（在移除前执行）
   - 无目标节点 → 取消，reason 为 `no-target`
   - 源节点 == 目标节点 → 取消
   - 目标节点在源节点的子树中 → 取消（防止循环引用）
   - 源节点或目标节点 `disabled` → 取消
   - `inside` 目标不允许接收子节点 → 取消
   - `canDrop` 返回 `false` → 取消

3. **移除源节点** — 在拷贝树中找到并 `splice` 移除，返回被移除的节点对象

4. **在移除后的树中重新定位目标节点** — 此时目标节点的索引已自动修正（因为源节点已被移除）

5. **根据放置位置插入**
   - **`above`**：在 `targetParent.children[targetIndex]` 处插入，目标节点后移
   - **`below`**：在 `targetParent.children[targetIndex + 1]` 处插入
   - **`inside`**：推入 `targetNode.children` 末尾（如不存在则创建空数组）

6. **返回结果**
   - 成功：返回 `{ canceled: false, active, over, position, newData }`
   - 取消：返回 `{ canceled: true, reason, active, over }`，不修改原树

`moveNode` 必须保持纯函数职责：只计算新树或取消原因，不更新展开状态、不触发回调、不写 React state。

### TreeView 层副作用

`handleDragEnd` 负责处理算法结果：
- 取消时调用 `onTreeDragEnd(result)`，不更新数据
- 成功且为非受控模式时调用 `setUncontrolledData(result.newData)`
- 成功且为受控模式时不更新内部数据，只调用 `onTreeDragEnd(result)`
- 成功且 `position === 'inside'`、`expandAll === false` 时，将 `over.id` 加入 `expandedIdsState`
- `expandAll === true` 时不写 `expandedIdsState`，因为展开集合由当前数据派生

### 边界情况

| 场景 | 处理 |
|------|------|
| 同父节点内排序 | 先移除再插入，自然处理索引偏移，无需特殊补偿 |
| 拖入自己的子树 | 前置校验拦截，操作取消 |
| 拖入 disabled 节点 | 碰撞检测阶段已过滤，不会触发重组 |
| 拖到 disabled 节点前后 | disabled 节点不作为排序锚点，操作取消 |
| 拖入空文件夹 | 仅当 `droppable: true` 或 `canDrop` 明确允许时成功 |
| 拖入普通叶子节点 | 默认取消，除非 `droppable: true` 或 `canDrop` 明确允许 |
| 无投放目标 | 返回 `canceled: true`，reason 为 `no-target` |
| 根级节点（无 parent） | `targetParent` 为 `null`，直接操作根数组 |

### 性能

- 单次拖拽最坏情况需要 3 次树遍历（查找源、查找目标、移除）+ 1 次子树遍历（循环检测）
- 对于常规规模的树（< 1000 节点），耗时 < 1ms，可忽略
- 深拷贝仅拷贝对象引用层级，不拷贝 `icon` 等 React 组件引用

## 测试计划

### 单元测试：`useTreeDnD.test.ts`

覆盖 `moveNode` 和辅助函数：
- 同父节点内 `above` / `below` 排序，验证索引偏移正确
- 根级节点之间排序，验证 `targetParent === null` 场景
- 跨层级移动到已有 children 的节点内部
- 拖入 `droppable: true` 的空节点，自动创建 `children`
- 拖入普通叶子节点默认取消，reason 为 `drop-disallowed`
- 拖入 `droppable: false` 节点取消，即使节点已有 children
- 拖入自身取消，reason 为 `same-node`
- 拖入自身子树取消，reason 为 `descendant-target`
- 源节点或目标节点 disabled 时取消，reason 为 `disabled-node`
- `canDrop` 返回 `false` 时取消，reason 为 `drop-disallowed`
- 原始输入树不被修改，React 组件引用如 `icon` 保持原引用

### 组件测试：`shared-components.test.tsx` 或 `TreeView.test.tsx`

覆盖 TreeView 集成行为：
- `reorderable={false}` 时不渲染 drag handle，不改变现有 DOM 语义
- 受控模式下拖拽成功只调用 `onTreeDragEnd`，不私自修改外部 `data`
- 非受控模式下 `defaultData` 初始化内部数据，拖拽成功后 UI 顺序更新
- 拖入折叠目标内部后，`expandAll === false` 时目标节点自动展开
- `expandAll === true` 时不写 `expandedIdsState`，展开状态继续由数据派生
- 点击节点仍选中，点击展开按钮仍展开/折叠，点击 `item.actions` 不触发拖拽
- 现有键盘导航测试继续通过，disabled 节点仍被跳过

### 手动验证

在 `TreeViewDemo.tsx` 中验证：
- 拖拽开关能启用/禁用排序
- 操作日志能展示成功移动和取消原因
- 指示线、内部高亮、DragOverlay、disabled 无反馈都符合视觉设计
- 屏幕阅读器公告不会宣称支持键盘拖拽排序

## 技术依赖

- **新增依赖**：
  - `@dnd-kit/core` — DnD 核心引擎
  - `@dnd-kit/sortable` — 排序功能
  - `@dnd-kit/utilities` — 工具函数（CSS 变换等）
- **现有依赖复用**：`react`、`lucide-react`、`tailwind-merge`、`cn`
