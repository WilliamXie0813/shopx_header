# ShopX JSON Config 可编辑系统 — 完整设计文档

## 一、背景与问题

### 1.1 项目关系

```
ShopX            — AI 驱动，基于 JSON Schema 配置化生成电商网站
ShopX-UI         — 组件库（Header, Hero, ProductCard, Cart, Footer）
                   每个组件只接收 2 个 PROPS：config + data
ShopX-Preview    — 页面编辑器，给 Seller 使用，可视化编辑页面元素
```

### 1.2 核心问题

在 ShopX-Preview 中，用户点击页面上可编辑元素并修改后，如何将修改对应更新到全局 JSON Config 中？

**核心卡点：嵌套且数组类型的配置项。** 例如用户修改了导航菜单中二级菜单的 label：

```json
"navigation": {
  "items": [
    {
      "label": "Shop",
      "children": [
        { "label": "Women", "href": "/shop/women" },   // ← 改了这个
        { "label": "Men",   "href": "/shop/men" }
      ]
    }
  ]
}
```

需要精确生成路径 `navigation.items[0].children[0].label`，不可变更新沿途引用，触发页面重渲染。

---

## 二、方案对比

| 维度 | 方案 A: useEditable Hook | 方案 B: Vite 插件自动注入 |
|------|------------------------|--------------------------|
| 原理 | 组件手动调用 `{...bind(path)}` | AST 分析，构建时注入 |
| ShopX-UI 源码改动 | 需加 `useEditable()` + `{...bind(path)}` | **零** |
| 路径准确性 | 100%，显式声明 | ~90%，复杂模式可能漏 |
| 实现复杂度 | 低，纯运行时 | 中，需维护 AST 遍历插件 |
| 灵活度 | 可精确控制哪些元素可编辑 | 自动推断，可能多/漏 |
| 解构/动态 key/条件路径 | 天然支持 | 需降级方案 A |

### 2.1 推荐策略

**方案 A + B 共存**：插件覆盖 80% 的 `config.xxx.map(item => item.yyy)` 常见模式，剩余 20% 复杂情况手动 `bind()`。

---

## 三、路径系统

### 3.1 路径格式

统一使用点号 + 方括号，lodash 原生支持：

```
header.navigation.items[0].children[2].label
```

### 3.2 取值与赋值

使用 lodash `get` / `set` + `cloneDeep`（保证 React 不可变更新）：

```ts
import get from 'lodash/get'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'

function getValueByPath(obj: any, path: string): any {
  return get(obj, path)
}

function setValueByPath(obj: any, path: string, value: any): any {
  const copy = cloneDeep(obj)
  set(copy, path, value)
  return copy
}
```

---

## 四、架构总览

```
                          ┌──────────────────────────┐
                          │    JsonConfigProvider      │
                          │    config / updateConfig   │
                          │    mode: preview | edit    │
                          │    editingTarget           │
                          └──────────┬───────────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
       ┌────────┴────────┐  ┌───────┴───────┐  ┌────────┴────────┐
       │ ConfigScope      │  │ ConfigScope   │  │ ConfigScope     │
       │ prefix="header"  │  │ prefix="hero" │  │ prefix="footer" │
       └────────┬────────┘  └───────┬───────┘  └────────┬────────┘
                │                    │                    │
       Plugin injects:      Plugin injects:      Plugin injects:
       __editable(          __editable(          __editable(
         `items[0].label`     `title`              `columns[0].links[1].label`
       )                    )                    )
                │                    │                    │
                └────────────────────┼────────────────────┘
                                     │
                    运行时 ConfigScope 拼接前缀：
                    header.items[0].label
                    hero.title
                    footer.columns[0].links[1].label
                                     │
                                     ▼
                          lodash get/set 操作全局 config
```

### 4.1 关键设计：路径两层拼接

插件注入的路径是**相对于组件 config prop** 的（如 `items[0].label`）。运行时通过 `ConfigScope` 拼上顶层 key（如 `header.`），得到完整路径 `header.items[0].label`。这样插件无需知道页面结构，组件也无需知道自己在大 JSON 中的位置。

### 4.2 Context 设计

| Context | 提供者 | 消费者 | 作用 |
|---------|--------|--------|------|
| `JsonConfigContext` | `JsonConfigProvider` | `__editable`, `InlineEditor`, `useJsonConfig` | 全局 config + updateConfig + mode |
| `EditablePrefixContext` | `ConfigScope` | `__editable`, `useEditable` | 当前组件区块的路径前缀 |

`ConfigScope` 支持嵌套：
```tsx
<ConfigScope prefix="header">
  <ConfigScope prefix="navigation">
    {/* 前缀为 header.navigation */}
  </ConfigScope>
</ConfigScope>
```

---

## 五、方案 A：useEditable Hook

### 5.1 API

```ts
function useEditable(): {
  bind:  (path: string, options?: BindOptions) => BindProps
  isEditing: boolean
}

interface BindOptions {
  type?: 'text' | 'color' | 'select' | 'image'
  label?: string
}

interface BindProps {
  'data-editable-path': string
  onClick:  (e: MouseEvent) => void
  className: string
  title?:   string
}
```

### 5.2 组件用法

```tsx
import { useEditable } from 'shopx-preview'

function Header({ config, data }) {
  const { bind } = useEditable()

  return (
    <nav>
      {config.navigation.items.map((item, i) => (
        <div key={i}>
          <span {...bind(`items[${i}].label`)}>
            {item.label}
          </span>
          {item.children?.map((child, j) => (
            <span {...bind(`items[${i}].children[${j}].label`)}>
              {child.label}
            </span>
          ))}
        </div>
      ))}
    </nav>
  )
}
```

### 5.3 bind 行为

- **preview 模式**：返回空对象 `{}`，零开销
- **edit 模式**：返回 `{ 'data-editable-path', onClick, className }`，元素出现蓝色虚线边框，点击弹出编辑器

### 5.4 改动量

- 每个组件：加 1 行 `const { bind } = useEditable()`
- 每个可编辑元素：加 `{...bind(path)}` 展开

---

## 六、方案 B：Vite 插件自动注入

### 6.1 原理

构建时 AST 转换，自动检测 JSX 中引用的 `config.*` 或 `item.*`（在 `config.*.map` 回调内），推断完整 JSON 路径，注入 `__editable(path)` 调用。

### 6.2 编译前后对比

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
import { __editable } from '@shopx/editable'

function Header({ config, data }) {
  return (
    <nav>
      {config.navigation.items.map((item, i) => (
        <div key={i}>
          <span {...__editable(`items[${i}].label`)}>
            {item.label}
          </span>
          {item.children?.map((child, j) => (
            <span {...__editable(`items[${i}].children[${j}].label`)}>
              {child.label}
            </span>
          ))}
        </div>
      ))}
    </nav>
  )
}
```

### 6.3 AST 分析流程

#### 步骤 1：检测 `.map()` 调用

```
config.navigation.items.map((item, i) => ...)
       ↓
提取属性链（去掉 .map）：config.navigation.items → ['navigation', 'items']
提取回调参数：item（元素）、i（索引）
记录 scope：{ varName: 'item', indexVar: 'i', arrayPath: ['navigation', 'items'] }
```

#### 步骤 2：检测 JSX 中的变量引用

```
<span>{item.label}</span>
         ↓
检查 'item' 是否在 scope chain 中 → 是（scope 0）
解析完整路径：scope.arrayPath + [idx(scope.indexVar)] + ['label']
               ['navigation', 'items', idx('i'), 'label']
```

#### 步骤 3：生成模板字面量并注入

```
['navigation', 'items', idx('i'), 'label']
         ↓ segmentsToTemplateLiteral
`navigation.items[${i}].label`
         ↓ 注入到 JSX 元素
<span {...__editable(`navigation.items[${i}].label`)}>{item.label}</span>
```

#### 步骤 4：添加 import

```
import { __editable } from '@shopx/editable'
```

### 6.4 嵌套 map 的 scope chain

```tsx
config.navigation.items.map((item, i) =>       // scope 0
  item.children.map((child, j) => (            // scope 1
    <span>{child.label}</span>                  // → items[${i}].children[${j}].label
  ))
)
```

每个 scope 的 `arrayPath` 包含外层索引：

| Scope | varName | indexVar | arrayPath |
|-------|---------|----------|-----------|
| 0 | `item` | `i` | `['navigation', 'items']` |
| 1 | `child` | `j` | `['navigation', 'items', idx('i'), 'children']` |

**核心逻辑：** 当 scope 1 的根变量 `child` 被解析时，`resolveRoot` 返回 scope 0 的 arrayPath + scope 0 的 index，再拼接 scope 1 自身的属性链。

### 6.5 插件能处理的情况

```
config.title                                → __editable("title")
config.logo.src                             → __editable("logo.src")
config.nav.items[0].label                   → __editable("nav.items[0].label")
config.nav.items.map((item, i) => item.label)                 → items[${i}].label
config.nav.items.map((item, i) =>
  item.children.map((child, j) => child.label)                → items[${i}].children[${j}].label
)
```

### 6.6 插件限制（需降级方案 A）

```tsx
// ❌ 解构别名
const { items } = config.navigation
items.map(item => <span>{item.label}</span>)

// ❌ 条件路径
const label = showAlt ? item.altLabel : item.label

// ❌ 动态 key
item[fieldName]

// ❌ 跨函数边界
const nav = config.navigation
function renderItem(item) { return <span>{item.label}</span> }

// ❌ 非 map 的数组访问
config.navigation.items.filter(item => item.active).map(...)
```

### 6.7 插件文件结构

```ts
export default function shopxEditable(options?: {
  importSource?: string     // __editable 导入源，默认 '@shopx/editable'
  configParamName?: string  // config prop 名称，默认 'config'
}): Plugin
```

### 6.8 依赖

```
@babel/parser   — 解析 TSX/JSX 为 AST
@babel/traverse — AST 遍历 + 节点操作
@babel/types    — AST 节点构造
@babel/generator — AST 生成代码
```

---

## 七、运行时设计

### 7.1 `__editable` 函数

```ts
export function __editable(path: string, options?: BindOptions): BindProps {
  const ctx     = useContext(JsonConfigContext)    // 始终调用
  const prefix  = useEditablePrefix()               // 始终调用
  const fullPath = prefix ? `${prefix}.${path}` : path
  const isEditing = ctx?.mode === 'edit'

  // preview 模式：返回空 props
  // edit 模式：返回 data-editable-path + onClick + className

  return {
    'data-editable-path': isEditing ? fullPath : '',
    className: isEditing ? 'shopx-editable' : '',
    onClick: isEditing
      ? (e) => {
          e.preventDefault()       // 阻止 <a> 跳转等原生行为
          e.stopPropagation()      // 阻止事件冒泡
          ctx!.startEditing({ path: fullPath, type: ..., rect })
        }
      : () => {},
  }
}
```

**关键约束：** `useContext` 和 `useEditablePrefix` 必须在每次渲染时调用，不能条件跳过。因为 `__editable` 在组件的 render 函数中被调用，React 将其视为该组件的 hook 调用链的一部分。跳过调用会改变 hook 数量，违反 React 规则。

### 7.2 InlineEditor

浮动编辑器，定位在点击元素旁边：

- 读取当前值：`getValueByPath(config, editingTarget.path)`
- 用户修改后保存：`updateConfig(path, newValue)` → `setValueByPath(prev, path, value)` → 全局 config 更新
- 所有消费 `JsonConfigContext` 的组件重渲染（包括 `PageRenderer`）
- 组件从 context 读取新 config → 页面实时反映修改

支持 editor 类型：
- `text`：文本输入框，Enter 保存，Escape 取消
- `color`：原生颜色选择器，选择即保存

### 7.3 编辑模式样式

```css
.shopx-editable {
  outline: 2px dashed rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
  cursor: pointer;
  transition: outline-color 150ms ease;
}

.shopx-editable:hover {
  outline-color: rgba(59, 130, 246, 1);
  outline-style: solid;
}
```

### 7.4 URL 路由控制

生产环境中，编辑功能只应在特定 URL 下启用。通过 URL 自动控制 mode，而不是手动切换 state。

#### 7.4.1 核心机制

`JsonConfigProvider` 初始化 mode 时检测 URL：

```ts
function resolveDefaultMode(
  defaultMode?: 'preview' | 'edit',
): 'preview' | 'edit' {
  if (defaultMode) return defaultMode
  if (typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/preview')) {
    return 'edit'
  }
  return 'preview'
}
```

| URL | mode | DOM 表现 |
|-----|------|----------|
| `/` | `preview` | 干净，无任何编辑属性 |
| `/shop` | `preview` | 干净 |
| `/preview` | `edit` | 元素有 `data-editable-path`、虚线边框 |
| `/preview/shop` | `edit` | 同上 |

#### 7.4.2 属性完全隐藏

preview 模式下 `__editable` 返回不含任何属性的对象，React 不会渲染到 DOM：

```ts
function noop(): BindProps {
  return { onClick: () => {} }
}

export function __editable(path: string, options?: BindOptions): BindProps {
  const ctx = useContext(JsonConfigContext)
  const prefix = useEditablePrefix()
  const isEditing = ctx?.mode === 'edit'

  if (!isEditing) return noop()

  const fullPath = prefix ? `${prefix}.${path}` : path
  // 只在编辑模式下才设置 data-editable-path 和 className
  return {
    'data-editable-path': fullPath,
    className: 'shopx-editable',
    ...
  }
}
```

因为 `noop()` 返回的对象中没有 `data-editable-path` 和 `className` key，展开后 React 不会添加任何 DOM 属性。正常用户查看页面源码时看不到任何编辑系统痕迹。

#### 7.4.3 与路由库集成

React Router 示例：

```ts
import { useLocation } from 'react-router-dom'

function resolveDefaultMode(): 'preview' | 'edit' {
  // 在 hook 内无法调用 useLocation，改用硬编码判断
  return window.location.pathname.startsWith('/preview') ? 'edit' : 'preview'
}
```

或通过 `defaultMode` prop 显式传入：

```tsx
function App() {
  const location = useLocation()
  const isPreview = location.pathname.startsWith('/preview')

  return (
    <JsonConfigProvider
      initialConfig={pageConfig}
      defaultMode={isPreview ? 'edit' : 'preview'}
    >
      ...
    </JsonConfigProvider>
  )
}
```

---

## 八、页面组装示例

```tsx
import { JsonConfigProvider, ConfigScope, InlineEditor, useJsonConfig } from './editable'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductGrid from './components/ProductGrid'
import Footer from './components/Footer'

function PageRenderer() {
  const { config } = useJsonConfig()
  const cfg = config as typeof pageConfig

  return (
    <>
      <ConfigScope prefix="header">
        <Header config={cfg.header} data={dataBundle.header} />
      </ConfigScope>
      <ConfigScope prefix="hero">
        <Hero config={cfg.hero} data={dataBundle.hero} />
      </ConfigScope>
      <ConfigScope prefix="products">
        <ProductGrid config={cfg.products} data={dataBundle.products} />
      </ConfigScope>
      <ConfigScope prefix="footer">
        <Footer config={cfg.footer} data={dataBundle.footer} />
      </ConfigScope>
    </>
  )
}

export default function App() {
  return (
    <JsonConfigProvider initialConfig={pageConfig} defaultMode="edit">
      <PageRenderer />
      <InlineEditor />
    </JsonConfigProvider>
  )
}
```

---

## 九、数据流完整链路

```
用户点击页面上的 "Women"
        │
        ▼
__editable onClick 触发
  e.preventDefault() + e.stopPropagation()
  startEditing({ path: "header.navigation.items[0].children[0].label", rect })
        │
        ▼
JsonConfigContext 更新 editingTarget
        │
        ▼
InlineEditor 渲染 — 浮动在点击位置
  getValueByPath(config, "header.navigation.items[0].children[0].label") → "Women"
        │
        ▼
用户修改为 "Womenswear" 并按 Enter
  updateConfig("header.navigation.items[0].children[0].label", "Womenswear")
        │
        ▼
setValueByPath 执行：
  cloneDeep(config)
  lodash.set(copy, "header.navigation.items[0].children[0].label", "Womenswear")
  return copy
        │
        ▼
JsonConfigContext 的 config 状态更新
        │
        ▼
所有 useContext(JsonConfigContext) 的组件重渲染
  PageRenderer 获得新 config
  Header 收到新 config.header
  <span>Women</span> → <span>Womenswear</span>
```

---

## 十、移植检查清单

1. [ ] `npm install lodash @types/lodash`
2. [ ] `npm install -D @babel/parser @babel/traverse @babel/types @babel/generator`
3. [ ] 复制 `editable/` 目录（path.ts, context.tsx, runtime.ts, InlineEditor.tsx, index.ts）
4. [ ] 复制 `vite-plugin-shopx-editable.ts` 到项目根目录
5. [ ] `vite.config.ts` 添加插件 + `@shopx/editable` alias
6. [ ] 添加 `.shopx-editable` CSS 样式
7. [ ] 在 ShopX-Preview 中创建 `PageRenderer`，用 `ConfigScope` 包裹每个组件区块
8. [ ] 用 `JsonConfigProvider` 包裹整个应用
9. [ ] 放置 `<InlineEditor />` 在 Provider 内部
10. [ ] 验证：编辑模式 → 点击元素 → 弹出编辑器 → 修改 → JSON 更新 → 页面刷新

### Vite 配置参考

```ts
import shopxEditable from './vite-plugin-shopx-editable'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    shopxEditable({
      importSource: '@shopx/editable',
      configParamName: 'config',
    }),
  ],
  resolve: {
    alias: {
      '@shopx/editable': path.resolve(__dirname, 'src/shopxComponent/editable/runtime'),
    },
  },
})
```
