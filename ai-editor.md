# AI Assisted Inline Editor 设计方案

## 产品定位

这不是传统 CMS 的编辑器，而是一种：

> **AI Assisted Inline Editing（AI 辅助原地编辑）**

用户始终围绕原文工作，AI 作为随时可调用的改写助手存在。

设计目标参考：

- ChatGPT Canvas
- Claude Rewrite
- Claude Artifacts
- Notion AI
- Cursor Ask AI
- Linear AI

核心理念：

> 原文 → 提需求 → AI 给候选 → 一键采用 → 人工微调 → 自动保存

---

# 功能需求

## 基础能力

### 多实例文本块

页面上存在多个独立文本段落：

```text
项目标题

这是第一段文本内容...

这是第二段文本内容...

这是第三段文本内容...
```

---

### 单实例编辑器

同一时间仅允许一个编辑器处于打开状态。

行为规则：

- 点击段落 A → 打开编辑器 A
- 点击段落 B → 自动关闭编辑器 A
- 打开编辑器 B

---

### 自动保存

当用户点击编辑器外部区域时：

1. 自动保存当前内容
2. 更新页面文本
3. 收起编辑器

---

# 交互流程

```text
点击段落
    ↓
展开 Inline Editor
    ↓
手动编辑
    ↓
（可选）
输入优化需求
    ↓
AI生成候选
    ↓
选择候选
    ↓
继续手动修改
    ↓
点击外部
    ↓
自动保存并关闭
```

---

# 默认状态

页面保持极简。

仅在 Hover 时显示编辑入口。

```text
┌────────────────────┐
│ 第一段文本内容...   │ ✏️
└────────────────────┘
```

---

# 展开状态

点击段落后展开 AI 编辑卡片。

```text
原段落

┌──────────────────────────────────────────┐
│                                          │
│ textarea                                 │
│                                          │
└──────────────────────────────────────────┘

✨ 想怎么优化？

┌────────────────────────────────────┐
│ 更专业一点                         │
└────────────────────────────────────┘

[ AI 优化 ]
```

---

# 编辑器结构

从上到下：

## 1. Textarea

用途：

- 显示当前文本
- 支持直接修改

特点：

- 默认填充原始内容
- 始终可编辑

---

## 2. AI需求输入框

用途：

向 AI 描述希望的优化方向。

示例：

```text
更专业一点
```

```text
缩短到100字以内
```

```text
语气更友好
```

约束：

- 单行输入
- 最大100字符
- 可为空

---

## 3. AI优化按钮

```text
[ AI 优化 ]
```

点击后：

调用父组件提供的 AI 回调。

编辑器本身只负责 UI。

---

# AI生成状态

生成过程中展示状态反馈。

示例：

```text
Generating suggestions...

◉ Thinking...
◉ Rewriting...
◉ Creating alternatives...
```

或简化版：

```text
⏳ 正在生成候选...
```

---

# 候选区域设计

采用纵向卡片布局。

避免：

- Select
- Dropdown
- Tabs

采用：

- Draft Card
- Suggestion Card

形式。

---

## 区域结构

```text
Suggestions

                     [重新生成]
```

---

## 候选卡片

```text
┌─────────────────────────────────────┐
│ Candidate A                         │
│                                     │
│ 这里是一整段优化后的文本内容...      │
│                                     │
│                           [采用]    │
└─────────────────────────────────────┘
```

共展示：

- Candidate A
- Candidate B
- Candidate C

共 3 个完整候选。

---

# AI策略标签

增强 AI 感。

示例：

```text
[Balanced]
```

```text
[Professional]
```

```text
[Concise]
```

对应：

| 标签         | 含义     |
| ------------ | -------- |
| Balanced     | 平衡表达 |
| Professional | 更专业   |
| Concise      | 更精简   |

即使后端未真正实现差异策略，也能增强用户感知。

---

# 候选选择逻辑

点击：

```text
[采用]
```

后：

1. 替换 Textarea 内容
2. 编辑器保持打开
3. 用户继续修改

示例：

```text
✓ Candidate applied
```

```text
┌──────────────────────────────┐
│ 新内容已经进入编辑区         │
└──────────────────────────────┘
```

---

# 自动保存体验

用户点击编辑器外部：

```text
mousedown outside
```

状态反馈：

```text
Saving...
```

随后：

```text
Saved
```

编辑器关闭。

页面更新：

```text
这是优化后的文本内容...
```

---

# 推荐视觉布局

```text
┌────────────────────────────────────┐
│ Edit with AI                       │
├────────────────────────────────────┤
│                                    │
│ textarea                           │
│                                    │
├────────────────────────────────────┤
│ ✨ Describe changes                │
│                                    │
│ [input.........................]   │
│                                    │
│                [Optimize]          │
├────────────────────────────────────┤
│ Suggestions                        │
│                                    │
│ Candidate 1                        │
│ Candidate 2                        │
│ Candidate 3                        │
└────────────────────────────────────┘
```

视觉目标：

- 简洁
- AI First
- 无工具栏
- 无复杂编辑器概念
- 强调“草稿建议”

---

# React 组件结构

## 页面层

```tsx
<Page>
	<EditableParagraph />
	<EditableParagraph />
	<EditableParagraph />
</Page>
```

---

## 段落组件

```tsx
<EditableParagraph
  value={text}
  active={activeId === id}
  onOpen()
  onSave()
  onGenerate()
/>
```

---

## 编辑器组件

```tsx
<InlineAiEditor>
	<Textarea />

	<PromptInput />

	<GenerateButton />

	<SuggestionList>
		<SuggestionCard />
		<SuggestionCard />
		<SuggestionCard />
	</SuggestionList>
</InlineAiEditor>
```

---

# 推荐状态机

避免多个布尔状态。

推荐：

```ts
type EditorState =
	| "idle"
	| "editing"
	| "generating"
	| "generated"
	| "saving"
	| "error";
```

状态流转：

```text
idle
  ↓

editing
  ↓

generating
  ↓

generated
  ↓

saving
  ↓

idle
```

异常：

```text
generating
     ↓
    error
     ↓
  retry
```

---

# 最终体验目标

用户感知应为：

> 我正在编辑内容，而 AI 在旁边不断给我提供可直接采用的草稿建议。

而不是：

> 我打开了一个复杂编辑器，然后使用各种工具修改文本。

因此产品应更接近：

**Inline AI Draft Editor**

而非传统 Rich Text Editor。
