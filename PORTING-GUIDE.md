# ShopX JSON Config 可编辑系统 — 移植指南

## 概述

该系统允许在 ShopX-Preview 中点击页面元素直接编辑，修改实时反映到全局 JSON Config。核心分为两部分：

- **方案 A：useEditable Hook** — 组件手动调用 `{...bind(path)}`，路径显式声明
- **方案 B：Vite 插件自动注入** — 构建时 AST 转换，组件源码零编辑代码

本文档基于方案 B 的完整实现，两者可共存。

---

## 一、架构总览

```
                        ┌──────────────────────────┐
                        │    JsonConfigProvider      │
                        │    config / updateConfig   │
                        │    mode: preview | edit    │
                        └──────────┬───────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────┴────────┐  ┌───────┴───────┐  ┌────────┴────────┐
     │ ConfigScope      │  │ ConfigScope   │  │ ConfigScope     │
     │ prefix="header"  │  │ prefix="hero" │  │ prefix="footer" │
     │                  │  │               │  │                 │
     │ <DemoHeader />   │  │ <DemoHero />  │  │ <DemoFooter />  │
     └─────────────────┘  └──────────────┘  └─────────────────┘
              │                    │                    │
     Plugin injects:      Plugin injects:      Plugin injects:
     __editable(          __editable(          __editable(
       `items[0].label`     `title`              `columns[0].links[1].label`
     )                    )                    )
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                        Runtime prepends prefix:
                        header.items[0].label
                        hero.title
                        footer.columns[0].links[1].label
                                   │
                                   ▼
                        lodash get/set 操作全局 config
```

**关键设计决策：** 插件生成的路��相对于组件的 `config` prop，运行时通过 `ConfigScope` 前缀拼接完整路径。这样插件无需知道页面结构，组件也无需知道自己在全局配置中的位置。

---

## 二、需要移植的文件

### 2.1 运行时（必须）

以下文件放入目标项目的 `src/shopxComponent/editable/`（或任意目录）：

```
editable/
├── index.ts          # 公共 API 导出
├── path.ts           # lodash get/set 封装
├── context.tsx       # JsonConfigProvider + ConfigScope
├── runtime.ts        # __editable + useEditable
└── InlineEditor.tsx  # 点击弹出的浮动编辑器
```

#### path.ts

```ts
import get from 'lodash/get'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'

export function getValueByPath(obj: any, path: string): any {
  return get(obj, path)
}

export function setValueByPath(obj: any, path: string, value: any): any {
  const copy = cloneDeep(obj)
  set(copy, path, value)
  return copy
}
```

依赖：`npm install lodash @types/lodash`

#### context.tsx

核心有两个 Context：

| Context | 用途 |
|---------|------|
| `JsonConfigContext` | 存储全局 config、updateConfig、mode、editingTarget |
| `EditablePrefixContext` | 路径前缀，由 ConfigScope 设置，__editable 读取 |

```tsx
// JsonConfigProvider — 全局唯一，包裹整个应用
<JsonConfigProvider initialConfig={pageConfig} defaultMode="edit">
  {children}
</JsonConfigProvider>

// ConfigScope — 每个组件区块一个，声明路径前缀
<ConfigScope prefix="header">
  <DemoHeader config={cfg.header} />
</ConfigScope>
```

ConfigScope 支持嵌套：
```tsx
<ConfigScope prefix="header">
  <ConfigScope prefix="navigation">
    {/* 此处前缀为 header.navigation */}
  </ConfigScope>
</ConfigScope>
```

#### runtime.ts

导出两个函数：

| 函数 | 用途 |
|------|------|
| `__editable(path)` | 插件注入调用，返回 `{ 'data-editable-path', onClick, className }` |
| `useEditable()` | 方案 A 手动调用，返回 `{ bind, isEditing }` |

`__editable` 的路径拼接逻辑：
```
插件传入: "navigation.items[${i}].label"
ConfigScope前缀: "header"
完整路径: "header.navigation.items[${i}].label"
```

编辑模式下返回的 props：
- `data-editable-path` — 完整路径
- `onClick` — `preventDefault() + stopPropagation()` 阻止原元素行为 + 启动编辑
- `className: 'shopx-editable'` — 蓝色虚线边框样式

#### InlineEditor.tsx

浮动编辑弹窗，定位在点击元素旁边。支持 text 和 color 两种类型。Enter 保存，Escape 取消。

### 2.2 Vite 插件（方案 B 必须）

文件：`vite-plugin-shopx-editable.ts`（项目根目录）

**工作原理：**

```
源码                              编译产物
─────────────────────────────────────────────────────
<span>{item.label}</span>    →    <span {...__editable(
                                    `navigation.items[${i}].label`
                                  )}>{item.label}</span>
```

**AST 分析流程：**

1. 找到 `config.xxx.map((item, i) => ...)` 调用
2. 提取属性链（去掉 `.map`）：`config.navigation.items` → `['navigation', 'items']`
3. 记录 scope：`{ varName: 'item', indexVar: 'i', arrayPath: ['navigation', 'items'] }`
4. 在回调体内，找到 `{item.label}` 这种 JSX 表达式
5. 解析完整路径：`['navigation', 'items', idx('i'), 'label']`
6. 生成模板字面量：`` `navigation.items[${i}].label` ``
7. 注入 `{...__editable(...)}` 到 JSX 元素上
8. 文件顶部添加 `import { __editable } from '@shopx/editable'`

**嵌套 map 处理：**
```tsx
config.navigation.items.map((item, i) =>       // scope 0
  item.children.map((child, j) => (            // scope 1
    <span>{child.label}</span>                  // → navigation.items[${i}].children[${j}].label
  ))
)
```

每个 scope 记录：
- `varName` — 回调元素参数名
- `indexVar` — 回调索引参数名
- `arrayPath` — 数组的完整路径段（含外层索引）

**插件限制（需降级方案 A 的情况）：**
- 解构别名：`const { items } = config.navigation`
- 条件路径：`const label = show ? item.a : item.b`
- 动态 key：`item[fieldName]`
- 跨函数边界：`renderItem(item)` 在另一个函数中

### 2.3 样式

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

---

## 三、Vite 配置

```ts
// vite.config.ts
import shopxEditable from './vite-plugin-shopx-editable'

export default defineConfig({
  plugins: [
    react(),
    shopxEditable({
      importSource: '@shopx/editable',   // __editable 的导入源
      configParamName: 'config',          // 组件 config prop 的名称
    }),
  ],
  resolve: {
    alias: {
      '@shopx/editable': path.resolve(__dirname, 'src/shopxComponent/editable/runtime'),
    },
  },
})
```

---

## 四、使用方式

### 4.1 页面组装（ShopX-Preview 的工作）

```tsx
import { JsonConfigProvider, ConfigScope, InlineEditor, useJsonConfig } from './editable'

function PageRenderer() {
  const { config } = useJsonConfig()
  const cfg = config as typeof pageConfig

  return (
    <>
      <ConfigScope prefix="header">
        <HeaderComponent config={cfg.header} data={dataBundle.header} />
      </ConfigScope>
      <ConfigScope prefix="hero">
        <HeroComponent config={cfg.hero} data={dataBundle.hero} />
      </ConfigScope>
      <ConfigScope prefix="products">
        <ProductGridComponent config={cfg.products} data={dataBundle.products} />
      </ConfigScope>
      <ConfigScope prefix="footer">
        <FooterComponent config={cfg.footer} data={dataBundle.footer} />
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

### 4.2 ShopX-UI 组件（无需编辑代码）

```tsx
// 开发者看到的源码 — 零编辑逻辑
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

构建后自动注入 `__editable` 调用。开发者无需导入、无需调用、无需感知。

### 4.3 方案 A 补充（插件覆盖不了的场景）

```tsx
import { useEditable } from '@shopx/editable'

function Header({ config, data }) {
  const { bind } = useEditable()

  // 复杂解构 → 手动 bind
  const { items } = config.navigation
  return items.map((item, i) => (
    <span {...bind(`navigation.items[${i}].label`)}>{item.label}</span>
  ))
}
```

方案 A 和 B 可共存——插件处理 80% 常见模式，手动 `bind()` 覆盖剩余 20%。

---

## 五、关键技术点

### 5.1 路径格式

```
header.navigation.items[0].children[2].label
```

lodash 的 `get`/`set` 原生支持此格式，无需自定义解析。

### 5.2 不可变更新

lodash `set` 是 mutable 的，用于 React 时必须先 `cloneDeep`：

```ts
function setValueByPath(obj, path, value) {
  const copy = cloneDeep(obj)
  set(copy, path, value)
  return copy  // 新对象，React 能检测变化
}
```

### 5.3 Hook 调用规则

`__editable` 必须在每次渲染时调用 `useContext`，不能条件调用。正确模式：

```ts
export function __editable(path: string) {
  const ctx = useContext(JsonConfigContext)         // ✅ 始终调用
  const prefix = useEditablePrefix()                 // ✅ 始终调用
  const isEditing = ctx?.mode === 'edit'
  // 根据 isEditing 返回不同的 props（但不能跳过 hook 调用）
}
```

### 5.4 编辑模式屏蔽组件事件

编辑模式下 `__editable` 返回的 `onClick` 调用 `preventDefault() + stopPropagation()`，阻止 `<a>` 跳转、下拉展开等组件原生行为。

---

## 六、移植检查清单

1. [ ] 安装 lodash：`npm install lodash @types/lodash`
2. [ ] 复制 `editable/` 目录到目标项目
3. [ ] 复制 `vite-plugin-shopx-editable.ts` 到目标项目根目录
4. [ ] 安装 babel 依赖：`npm install -D @babel/parser @babel/traverse @babel/types @babel/generator`
5. [ ] 配置 `vite.config.ts`：添加插件 + `@shopx/editable` alias
6. [ ] 添加 `.shopx-editable` CSS 样式
7. [ ] 在 ShopX-Preview 中创建 `PageRenderer`，用 `ConfigScope` 包裹每个组件区块
8. [ ] 用 `JsonConfigProvider` 包裹整个应用，传入完整 JSON Config
9. [ ] 放置 `<InlineEditor />` 在 Provider 内部
10. [ ] 验证：编辑模式下点击元素 → 弹出编辑器 → 修改 → JSON Config 更新 → 页面重渲染
