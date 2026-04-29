# Theme DevTool 设计文档

## 背景

项目中的 `ThemeContext` 提供了一套 `ThemeTokens`，包含 colors、typography、spacing、borderRadius 等设计 token。开发阶段需要一种快速调试方式：不进入 Playground 模式、不改代码，就能实时修改 token 并观察组件样式变化。

## 目标

实现一个全局浮动面板形式的开发工具（DevTool），支持：
- 快捷键唤起，不依赖进入 Playground 模式
- 编辑 ThemeTokens 的全部字段
- 导出修改后的 theme（JSON / TypeScript 代码）
- 不修改 `ThemeContext` 的核心接口（保持只读）

## 非目标

- 不持久化到 localStorage（刷新页面即重置）
- 不做浏览器扩展
- 不修改消费 `useTheme()` 的组件代码

## 架构设计

采用"Overlay Provider"方案：在 App 外层包裹 `ThemeDevToolProvider`，内部管理 `overrides` state，计算 `mergedTheme` 后通过 `ThemeContext.Provider` 注入。

```
App
  └─ ThemeDevToolProvider
      ├─ ThemeContext.Provider value={mergedTheme}
      │   └─ children (Demo / Playground / 页面)
      │       └─ 组件 useTheme() → 拿到 mergedTheme
      └─ ThemeDevToolPanel (fixed 定位浮动面板)
          └─ TokenEditor
              └─ 用户修改 → setOverride(path, value)
                  → overrides 更新 → mergedTheme 重新计算
                  → ThemeContext.Provider value 更新
                  → 所有 useTheme() 的组件重新渲染
```

### 文件改动

**修改：**
- `src/shopxComponent/theme/ThemeContext.tsx`
  - 导出 `ThemeContext`：`export const ThemeContext = createContext<ThemeTokens>(defaultTheme)`
  - 现有 `ThemeProvider` 和 `useTheme` 保持不变
- `src/App.tsx`
  - 用 `<ThemeDevToolProvider>` 包裹应用内容

**新增：**
- `src/shopxComponent/devtool/ThemeDevToolProvider.tsx`
  - 维护 `overrides: Partial<ThemeTokens>` state
  - 提供 `setOverride(path: string, value: string)`、`resetOverrides()` 方法
  - 渲染 `<ThemeContext.Provider value={mergedTheme}>`
  - 在 children 后渲染 `<ThemeDevToolPanel />`
- `src/shopxComponent/devtool/ThemeDevToolPanel.tsx`
  - 浮动面板 UI（fixed 定位）
  - 监听全局键盘事件
  - 根据 `isOpen` state 控制显示/隐藏
- `src/shopxComponent/devtool/TokenEditor.tsx`
  - 增强版 token 编辑器，支持全部 ThemeTokens 字段
  - 分组折叠 UI
- `src/shopxComponent/devtool/useKeyboardShortcut.ts`
  - 封装快捷键监听逻辑

## TokenEditor 增强

在现有 colors + fontFamily 基础上，扩展支持全部 `ThemeTokens` 字段：

| 分组 | 字段 | 控件 |
|---|---|---|
| **Colors** | primary, background, surface, text, textSecondary, textInverse, border | `ColorField`（取色器 + hex input） |
| **Typography / Font** | fontFamily.heading, fontFamily.body | text input |
| **Typography / Sizes** | fontSizes.xs ~ 6xl | text input（值如 `0.75rem`），右侧显示实时预览字号 |
| **Spacing** | xs, sm, md, lg, xl, 2xl, 3xl | text input（值如 `1rem`） |
| **Border Radius** | none, sm, md, lg, xl, full | text input（值如 `0.5rem`） |

每个分组带可折叠标题栏，默认 Colors 展开，其他收起。

## 面板 UI 与交互

- **唤起方式**：全局快捷键切换显示/隐藏
- **关闭方式**：再次按快捷键，或按 Escape，或点击标题栏的 ×
- **位置**：fixed 定位，默认右下角（`right: 16px, bottom: 16px`），不跟随滚动
- **尺寸**：宽 320px，max-height 90vh，内部可滚动
- **视觉风格**：半透明深色背景（`rgba(15,23,42,0.9)`）+ `backdrop-blur`，细边框，和现有 Playground TokenEditor 风格一致但更紧凑
- **标题栏**：显示 "Theme DevTool" + 关闭按钮 + 当前平台对应的快捷键提示（如 ⌘⇧T 或 Ctrl+Shift+T）
- **底部工具栏**：固定在面板底部
  - 「Reset to Default」— 清空 overrides，恢复 defaultTheme
  - 「Export Theme」— 点击弹出格式选择菜单

### 快捷键

- **切换显示/隐藏**：`Ctrl+Shift+T`（Windows/Linux）/ `Cmd+Shift+T`（Mac）
- **关闭**：`Escape`
- **平台适配**：通过 `navigator.platform` 检测平台，在面板标题栏显示对应的快捷键提示符号（Mac 显示 ⌘⇧T，Windows 显示 Ctrl+Shift+T）

## 导出功能

点击「Export Theme」后弹出小菜单，提供两种格式：

- **JSON**：当前 `mergedTheme` 的完整 JSON 字符串，可直接复制。
- **TypeScript**：格式化为可直接粘贴到 `ThemeContext.tsx` 里替换 `defaultTheme` 的代码片段。

不持久化到 localStorage，刷新页面即重置。

## 已知限制

`Demo.tsx` 的 carousel 模式内部使用了 `<ThemeProvider theme={slide.theme}>`，这会覆盖外层 `ThemeDevToolProvider` 注入的 `mergedTheme`。因此 devtool 在 carousel 模式下对内层 header 组件不生效。

在 Playground 模式、独立使用组件时完全正常。

## 安全与边界

- DevTool 面板仅在开发环境渲染，通过 `import.meta.env.DEV` 控制
- 快捷键监听在 `useEffect` 中注册，组件卸载时清理
- 浮动面板使用高 `z-index` 但不应遮挡调试需求的内容
