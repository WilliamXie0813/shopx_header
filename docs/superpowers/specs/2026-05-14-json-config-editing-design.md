# JSON Config 可编辑系统设计

## 目标

在 ShopX-Preview 中实现：用户点击页面上的可编辑元素 → 修改值 → 对应更新全局 JSON Config。核心要解决嵌套数组场景下的路径定位问题。

## 共同基础：JsonConfigContext + 路径系统

两个方案共享以下基础设施。

### 路径格式

统一使用点号 + 方括号语法：

```
navigation.items[0].children[2].label
```

### 路径解析

```ts
function parsePath(path: string): (string | number)[] {
  // "items[0].children[2].label" → ['items', 0, 'children', 2, 'label']
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .map(seg => /^\d+$/.test(seg) ? Number(seg) : seg)
}
```

### 深路径不可变更新

```ts
function setValueByPath(obj: any, path: string, value: any): any {
  const keys = parsePath(path)

  function walk(current: any, i: number): any {
    if (i >= keys.length) return value

    const key = keys[i]

    if (Array.isArray(current)) {
      const copy = [...current]
      copy[key as number] = walk(copy[key as number], i + 1)
      return copy
    }

    return { ...current, [key]: walk(current[key], i + 1) }
  }

  return walk(obj, 0)
}
```

调用 `setValueByPath(config, 'nav.items[0].children[2].label', '女装')` 返回全新 config，沿途引用被克隆，其他分支保持结构共享。

### JsonConfigContext

```ts
interface JsonConfigContextValue {
  config: JsonConfig
  updateConfig: (path: string, value: any) => void
  mode: 'preview' | 'edit'
  setMode: (m: 'preview' | 'edit') => void
}
```

这是 ShopX-Preview 提供的全局状态层，是所有修改的唯一入口。

---

## 方案 A：useEditable Hook（显式路径绑定）

### 原理

ShopX-UI 组件调用 `useEditable()` 获取 `bind` 函数，在每个可编辑的 DOM 元素上展开 `{...bind(path)}`。在编辑模式下，`bind` 返回 `data-editable-path`、点击事件和视觉样式。

### API

```ts
// ShopX-Preview 提供的 hook
function useEditable(): {
  bind: (path: string, options?: BindOptions) => BindProps
  isEditing: boolean
}

interface BindOptions {
  type?: 'text' | 'color' | 'select' | 'image'  // 编辑器类型，默认 'text'
  label?: string                                   // 编辑时的字段标签
}

interface BindProps {
  'data-editable-path': string
  onClick: (e: React.MouseEvent) => void
  className: string   // 编辑模式下追加可编辑样式
  title?: string      // hover 提示
}
```

### 组件用法

```tsx
// ShopX-UI 的 Header 组件
import { useEditable } from 'shopx-preview'

function Header({ config, data }) {
  const { bind } = useEditable()

  return (
    <nav>
      {config.navigation.items.map((item, i) => (
        <div key={i}>
          <span {...bind(`navigation.items[${i}].label`)}>
            {item.label}
          </span>
          {item.children?.map((child, j) => (
            <span {...bind(`navigation.items[${i}].children[${j}].label`)}>
              {child.label}
            </span>
          ))}
        </div>
      ))}
    </nav>
  )
}
```

数组路径 `items[${i}].children[${j}].label` 在 `map` 循环中自然拼接。

### bind 函数实现

```ts
function bind(path: string, options?: BindOptions): BindProps {
  const { mode } = useJsonConfigContext()
  const { startEditing } = useEditorContext()

  if (mode !== 'edit') return {} as BindProps

  return {
    'data-editable-path': path,
    className: 'shopx-editable',
    title: options?.label ?? path,
    onClick: (e) => {
      e.stopPropagation()
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      startEditing({ path, type: options?.type ?? 'text', rect })
    }
  }
}
```

- **preview 模式**：返回空对象，零开销
- **edit 模式**：返回路径标记 + 点击启动编辑器

### InlineEditor

用户点击后，在点击元素旁弹出内联编辑器：

```tsx
function InlineEditor({ path, type, rect, onSave, onCancel }) {
  const { config } = useJsonConfigContext()
  const currentValue = getValueByPath(config, path)

  return (
    <div style={{ position: 'fixed', left: rect.left, top: rect.bottom + 4, zIndex: 1000 }}>
      {type === 'text' && (
        <input
          autoFocus
          defaultValue={currentValue}
          onKeyDown={e => e.key === 'Enter' && onSave(path, e.currentTarget.value)}
          onBlur={e => onSave(path, e.currentTarget.value)}
        />
      )}
      {type === 'color' && (
        <input type="color" defaultValue={currentValue}
          onChange={e => onSave(path, e.target.value)} />
      )}
    </div>
  )
}
```

`onSave` 调用 `updateConfig(path, newValue)` → 全局 config 更新 → 所有组件重渲染。

### 改动量估算

- 每个 ShopX-UI 组件：加 1 行 `const { bind } = useEditable()`
- 每个可编辑元素：加 `{...bind(path)}` 展开（path 字符串本身就存在，只是换个地方写）
- 不改动任何组件的渲染逻辑和样式逻辑

---

## 方案 B：Babel/Vite 插件自动注入路径

### 原理

构建时 AST 转换：自动检测 JSX 中引用的 `config.*` 或 `item.*`（在 `config.*.map` 回调内），推断其完整 JSON 路径，注入 `__editable(path)` 调用。组件源码完全看不到编辑相关代码。

### 编译前后对比

**源码（开发者写的）：**
```tsx
function Header({ config, data }) {
  return (
    <nav>
      {config.navigation.items.map((item, i) => (
        <div key={i}>
          <span>{item.label}</span>
          {item.children?.map((child, j) => (
            <span>{child.label}</span>
          ))}
        </div>
      ))}
    </nav>
  )
}
```

**编译产物：**
```tsx
import { __editable } from 'shopx-preview/runtime'

function Header({ config, data }) {
  return (
    <nav>
      {config.navigation.items.map((item, i) => (
        <div key={i}>
          <span {...__editable(`navigation.items[${i}].label`)}>
            {item.label}
          </span>
          {item.children?.map((child, j) => (
            <span {...__editable(`navigation.items[${i}].children[${j}].label`)}>
              {child.label}
            </span>
          ))}
        </div>
      ))}
    </nav>
  )
}
```

`__editable` 是方案 A 中 `bind` 的运行时代理——同样的逻辑，只是调用方式从手动变成自动。

### 插件核心逻辑

AST 遍历分为两个阶段：

**第一阶段：追踪 config 访问链**

```
config.navigation.items.map((item, i) => ...)
       ↓
记录: { basePath: "navigation.items", varName: "item", indexVar: "i" }
       ↓
item.children.map((child, j) => ...)
       ↓
记录: { basePath: "navigation.items[${i}].children", varName: "child", indexVar: "j" }
       ↓
child.label
       ↓
解析: basePath + ".label" = "navigation.items[${i}].children[${j}].label"
```

每个 `config.xxx.yyy.map()` 调用在 scope chain 中推入一条记录。遇到 `item.xxx` 时沿 scope chain 查找并拼接完整路径。

**第二阶段：注入 JSX 属性**

```
<span>{child.label}</span>
         ↓ 检测到 child 来自 scope chain
         ↓ 解析完整路径: "navigation.items[${i}].children[${j}].label"
         ↓
<span {...__editable(`navigation.items[${i}].children[${j}].label`)}>
  {child.label}
</span>
```

### 插件能处理的情况

```
config.title                              → __editable("title")
config.logo.src                           → __editable("logo.src")
config.nav.items[0].label                 → __editable("nav.items[0].label")
config.nav.items.map((item, i) => item.label)     → __editable(`nav.items[${i}].label`)
config.nav.items.map((item, i) =>
  item.children.map((child, j) => child.label)    → __editable(`nav.items[${i}].children[${j}].label`)
)
```

### 插件无法处理的情况（需降级为方案 A）

```
// 解构别名
const { items } = config.navigation         // 变量来源不直接是 config.xxx

// 条件路径
const label = showAlt ? item.altLabel : item.label   // 静态分析无法确定单一来源

// 动态 key
item[fieldName]                             // fieldName 是变量

// 提前终止
const nav = config.navigation
function renderItem(item) { ... }           // 跨函数边界
```

对于这些情况，插件跳过并输出 warning，开发者手动补 `{...bind(path)}`。两者可共存。

### Vite 插件结构

```ts
// vite-plugin-shopx-editable.ts
export default function shopxEditable(): Plugin {
  return {
    name: 'shopx-editable',
    transform(code, id) {
      if (!id.includes('shopx-ui') || !/\.(tsx|jsx)$/.test(id)) return

      const ast = parse(code, { sourceType: 'module', plugins: ['typescript'] })
      let transformed = false

      traverse(ast, {
        JSXElement(path) {
          if (hasEditableExpression(path.node)) {
            const fullPath = resolveConfigPath(path)
            if (fullPath) {
              injectEditableAttribute(path.node, fullPath)
              transformed = true
            }
          }
        }
      })

      if (!transformed) return
      return generate(ast, {}, code)
    }
  }
}
```

---

## 两种方案对比

| 维度 | 方案 A: useEditable Hook | 方案 B: Babel 插件 |
|------|------------------------|-------------------|
| ShopX-UI 源码改动 | 需要（hook + bind 展开） | 零 |
| 路径准确性 | 100%，显式声明 | ~90%，复杂 AST 模式可能解析失败 |
| 灵活性 | 完全可控（选哪些元素可编辑、编辑器类型） | 自动推断，可能多也可能漏 |
| 实现复杂度 | 低，纯运行时 | 中，需编写和维护 AST 遍历插件 |
| 调试体验 | 源码即真相 | 需对比编译产物 |
| 解构/动态 key | 天然支持 | 处理不了，需降级方案 A |
| 维护成本 | 低 | 中，TypeScript/Babel 版本升级需适配 |
| 构建速度影响 | 无 | 微小 |

## 推荐策略

1. **先实施方案 A** —— 改动量可控，路径精准，快速可用
2. **方案 A 稳定后，逐步引入方案 B** —— 对常见的 `config.xxx.map(item => item.yyy)` 模式自动注入，减少样板代码
3. 两者共存：插件覆盖 80% 的场景，剩余复杂情况手动 `bind()`
