# Typography 组件设计文档

## 背景

基于 shadcn/ui 实现 antd Typography 的组件功能，风格保持与现有 shadcn/ui 组件一致，使用 Tailwind CSS v4 和 lucide-react 图标。

## 目标

提供一套完整的排版组件，支持基础文本样式和交互功能。

## 范围

- **基础排版**：Title、Text、Paragraph、Link
- **交互功能**：可编辑（Editable）、可复制（Copyable）、省略号截断（Ellipsis）

## 架构

### 文件位置

```
src/components/ui/typography.tsx   # 主组件文件（单文件聚合）
```

### 导出方式

聚合 + 独立双模式导出：

```tsx
// 聚合导出（类 antd 用法）
<Typography.Title level={2}>标题</Typography.Title>
<Typography.Text type="danger">危险文本</Typography.Text>

// 独立导出（shadcn 习惯用法）
import { Title, Text, Paragraph, Link } from "@/components/ui/typography"
```

## API 设计

### Title

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | `1` | 对应 h1~h5 |
| `children` | `ReactNode` | — | 内容 |
| `className` | `string` | — | 额外类名 |
| `style` | `CSSProperties` | — | 行内样式 |

### Text

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `"secondary" \| "success" \| "warning" \| "danger" \| "muted"` | — | 语义化颜色 |
| `mark` | `boolean` | `false` | 高亮标记 |
| `code` | `boolean` | `false` | 代码样式 |
| `keyboard` | `boolean` | `false` | 键盘样式 |
| `underline` | `boolean` | `false` | 下划线 |
| `delete` | `boolean` | `false` | 删除线 |
| `strong` | `boolean` | `false` | 加粗 |
| `italic` | `boolean` | `false` | 斜体 |
| `copyable` | `boolean \| CopyConfig` | `false` | 可复制 |
| `editable` | `boolean \| EditConfig` | `false` | 可编辑 |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | 省略 |
| `children` | `ReactNode` | — | 内容 |
| `className` | `string` | — | 额外类名 |

### Paragraph

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | 同 Text | — | 语义化颜色 |
| `copyable` | `boolean \| CopyConfig` | `false` | 可复制 |
| `editable` | `boolean \| EditConfig` | `false` | 可编辑 |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | 省略（支持行数限制） |
| `children` | `ReactNode` | — | 内容 |
| `className` | `string` | — | 额外类名 |

### Link

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `href` | `string` | — | 链接地址 |
| `target` | `string` | — | 同 `<a>` |
| `copyable` | `boolean \| CopyConfig` | `false` | 可复制 |
| `editable` | `boolean \| EditConfig` | `false` | 可编辑 |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | 省略 |
| `children` | `ReactNode` | — | 内容 |
| `className` | `string` | — | 额外类名 |

### 配置类型

```ts
interface CopyConfig {
  text?: string;                       // 自定义复制文本
  icon?: ReactNode;                    // 自定义图标
  tooltips?: [ReactNode, ReactNode];   // [复制前提示, 复制后提示]
  onCopy?: () => void;                 // 复制成功回调
}

interface EditConfig {
  editing?: boolean;                   // 受控编辑状态
  icon?: ReactNode;                    // 编辑触发图标
  tooltip?: ReactNode;                 // 编辑按钮提示
  onStart?: () => void;                // 开始编辑回调
  onChange?: (value: string) => void;  // 值变更回调
  onEnd?: () => void;                  // 结束编辑回调
  onCancel?: () => void;               // 取消编辑回调
  maxLength?: number;                  // 最大输入长度
}

interface EllipsisConfig {
  rows?: number;                       // 最大显示行数（默认 1）
  expandable?: boolean;                // 是否可展开
  suffix?: string;                     // 省略后缀
  symbol?: ReactNode;                  // 展开/收起符号
  onExpand?: () => void;               // 展开回调
  onEllipsis?: () => void;             // 触发省略回调
}
```

## 交互设计

### 可编辑（Editable）

- 默认模式下，文本旁边显示铅笔图标（Pencil），hover 时可见
- 点击图标进入编辑模式，文本替换为 Input 组件
- 编辑模式下显示确认（Check）和取消（X）两个图标按钮
- 按 Enter 确认，Esc 取消
- 支持受控（`editing` prop）和非受控两种模式

状态机：
```
[显示模式] --点击编辑图标--> [编辑模式]
[编辑模式] --点击确认/Enter--> [显示模式] 保存值
[编辑模式] --点击取消/Esc--> [显示模式] 恢复原值
```

### 可复制（Copyable）

- 文本旁边显示复制图标（Copy），hover 时可见
- 点击后调用 `navigator.clipboard.writeText()` 复制内容
- 复制成功后图标临时变为 Check，显示 tooltip "已复制"，2 秒后恢复
- 复制失败时显示 tooltip "复制失败"

### 省略号（Ellipsis）

- 使用 CSS `-webkit-line-clamp` 实现多行截断
- `expandable: true` 时，截断末尾显示展开符号（默认 `...展开`）
- 点击展开符号切换到全文本模式，显示收起符号（默认 `收起`）
- `rows` 控制最大显示行数，默认 `1`

## 样式方案

基于 Tailwind CSS + shadcn/ui 设计令牌。

### 颜色映射

| type | 颜色类 |
|------|--------|
| `secondary` | `text-muted-foreground` |
| `success` | `text-green-600`（`--color-success`） |
| `warning` | `text-amber-500`（`--color-warning`） |
| `danger` | `text-red-500`（`--color-destructive`） |
| `muted` | `text-gray-400` |

### Title 字体大小

| level | 样式 |
|-------|------|
| 1 | `text-5xl font-medium`（匹配 h1 56px） |
| 2 | `text-2xl font-medium`（匹配 h2 24px） |
| 3 | `text-xl font-medium` |
| 4 | `text-lg font-medium` |
| 5 | `text-base font-medium` |

### Text 修饰样式

| 修饰 | 样式 |
|------|------|
| `mark` | `bg-yellow-200/50 px-1 rounded` |
| `code` | `font-mono text-sm bg-muted px-1.5 py-0.5 rounded` |
| `keyboard` | `font-mono text-xs border rounded px-1.5 py-0.5 shadow-sm` |
| `underline` | `underline underline-offset-4` |
| `delete` | `line-through` |
| `strong` | `font-semibold` |
| `italic` | `italic` |

### 交互图标按钮

- 使用 shadcn 现有的 Tooltip 组件包裹
- 图标大小 `h-3.5 w-3.5`
- 默认 `opacity-0`，hover 容器时 `opacity-100`，`transition-opacity`
- 图标按钮使用 `inline-flex items-center gap-1` 与文本对齐

### Paragraph 样式

- 默认行高 `leading-relaxed`（约 1.625）
- 边距 `mb-4`（段落间间距）

## 技术依赖

- 现有依赖：`react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
- 使用现有 shadcn/ui 组件：`Input`, `Tooltip`（如尚未安装则一并安装）
