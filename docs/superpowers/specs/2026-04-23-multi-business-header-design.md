# 多业务电商 Header 设计方案

## 1. 整体架构策略

### 1.1 关键约束
- **外部颜色传入**：只有 Header 的 `background` 和 `font color` 由外部传入，其余视觉层次由组件内部派生
- **完全独立项目**：5 个 Header 分别用于 5 个独立电商项目，无代码复用要求
- **功能一致性**：每个 Header 必须包含 Logo、导航菜单、购物车、用户账户入口，搜索为可选项

### 1.2 组件契约
```typescript
interface HeaderProps {
  logo: ReactNode;
  menuItems: MenuItem[];
  headerBg?: string;        // 外部传入：Header 背景色
  headerText?: string;      // 外部传入：Header 字体色
  onSearch?: (query: string) => void;
  cartCount?: number;
  userAvatar?: string;
}

interface MenuItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  description?: string;
  children?: MenuItem[];
}
```

### 1.3 内部颜色派生策略
| 内部元素 | 推导规则 |
|---------|---------|
| 下拉面板背景 | `headerBg` + 亮度微调（+5% 或 -5%） |
| Hover 背景 | `headerText` @ 5-10% 透明度 |
| Active 指示器 | 每个业务有自己的强调色（内部定义） |
| 分割线/边框 | `headerText` @ 10-15% 透明度 |

### 1.4 项目结构
```
src/headers/
├── types.ts              # 共享类型定义
├── utils.ts              # 颜色推导工具
├── essential/
│   ├── EssentialHeader.tsx
│   └── essential.theme.ts  # 无强调色，仅基础派生
├── fashion/
│   ├── FashionHeader.tsx
│   └── fashion.theme.ts  # 内部强调色 + 派生函数
├── collection/
│   ├── CollectionHeader.tsx
│   └── collection.theme.ts
├── luxe-vault/
│   ├── LuxeVaultHeader.tsx
│   └── luxe-vault.theme.ts
├── impulse/
│   ├── ImpulseHeader.tsx
│   └── impulse.theme.ts
└── card-market/
    ├── CardMarketHeader.tsx
    └── card-market.theme.ts
```

### 1.5 标准化执行流程
每个业务按以下 7 步执行：
1. `/shape` — 生成设计简报
2. `/impeccable teach` — 写入业务设计上下文
3. **核心指令组合** — 生成差异化 Header
4. `/polish` — 细节打磨
5. `/audit` — 无障碍 + 性能检查
6. `/adapt` — 移动端适配验证

---

## 2. Essential

### 2.1 业务定位
日用品/工具类/办公用品电商平台，用户是效率导向的理性消费者，不需要情感化设计，只追求快速找到商品、完成购买。

### 2.2 设计简报
- **视觉关键词**：功能、无装饰、高效、透明、中性
- **排版**：系统默认字体（-apple-system, Segoe UI），标准字号（14px/16px），无字距调整
- **色彩**：纯白背景 `#ffffff`，深灰文字 `#1f2937`，无强调色，所有状态用透明度区分
- **动效**：**零动画**，所有交互即时响应（transition-duration: 0ms）
- **布局**：严格的三栏网格（Logo | 导航 | 操作区），导航项等距排列，搜索框内嵌于导航区域

### 2.3 与 Collection 的区别
| 维度 | Collection | Essential |
|------|-----------|-----------|
| 目标 | 美学表达 | 功能效率 |
| 字体 | 衬线体 Logo + 精致排版 | 系统字体，无装饰 |
| 动效 | 克制的淡入 | **零动画** |
| 装饰 | 留白是设计元素 | 留白是功能性间隔 |
| 氛围 | 编辑感、品味 | 工具感、效率 |

### 2.4 指令执行流程
```
Step 1: /shape
"为日用品电商设计一个零装饰的功能性 Header，
要求：系统字体、无动画、无强调色、纯白背景、极致高效"

Step 2: /impeccable teach
写入 essential.md：功能优先设计规范、零装饰原则

Step 3: /distill
"剥离到绝对最小：Logo、4个导航项、搜索框、购物车、账户。
 去掉：下拉面板图片、hover背景色、active指示器、任何装饰线"

Step 4: /typeset
"使用系统字体栈（-apple-system, Segoe UI, Roboto），
 字号 14px，字重 400，行高 1.5，无字距调整"

Step 5: /quieter
"消除所有视觉噪音：无圆角、无阴影、无边框、无渐变。
 hover 状态仅用文字颜色加深（gray-500 → gray-900）"

Step 6: /layout
"严格三栏等宽网格：Logo 左对齐，导航居中（等距排列），
 操作区右对齐。搜索框 200px 宽度，与导航项同高"

Step 7: /polish + /audit
"确保每个元素的尺寸都是 4px 的倍数，
 检查 Tab 键导航顺序，确认零动画不影响无障碍"
```

---

## 3. Fashion（时尚潮流）

### 3.1 业务定位
快时尚电商平台，主打潮流单品、季节性新品、设计师联名。用户是 18-30 岁的 Z 世代，追求个性表达和社交货币。

### 3.2 设计简报
- **视觉关键词**：大胆、前卫、高饱和、动态、不对称
- **排版**：粗体大写标题，紧凑字距，强对比
- **色彩**：高饱和撞色（荧光粉 × 电光蓝），深色 Header 背景突出商品
- **动效**：菜单展开有弹性过渡，Hover 时有磁吸效果
- **布局**：Logo 居中或左偏，导航项间距宽大，购物车 icon 带脉冲动画

### 3.3 指令执行流程
```
Step 1: /shape
"为快时尚电商设计一个大胆前卫的 Header，目标用户是 Z 世代，
要求：高饱和撞色、动态磁吸交互、深色背景突出商品图"

Step 2: /impeccable teach
写入 fashion.md：品牌调性、色彩系统、动效规范

Step 3: /bolder + /colorize（并行）
/bolder: "放大视觉冲击力，导航项使用大写字母，增加字重"
/colorize: "使用荧光粉 #FF0080 和电光蓝 #00D9FF 作为强调色"

Step 4: /animate
"添加弹性展开动画，购物车 icon 脉冲提示，导航项磁吸 hover 效果"

Step 5: /layout
"导航项间距 32px，Logo 左偏，右侧操作区紧凑排列"

Step 6: /polish
"打磨细节：圆角一致性、过渡曲线、焦点状态"

Step 7: /audit + /adapt
检查无障碍和移动端适配
```

---

## 4. Collection（策展精选）

### 4.1 业务定位
精品买手店/策展型电商，精选小众品牌和独立设计师作品。用户是 25-40 岁的高知群体，注重品质而非数量。

### 4.2 设计简报
- **视觉关键词**：克制、留白、呼吸感、编辑感
- **排版**：优雅衬线体 Logo，无衬线导航，大量留白
- **色彩**：纯白背景，炭黑文字，单一点缀色（勃艮第红或深绿）
- **动效**：极克制的淡入，无弹性，线性缓动
- **布局**：居中对齐的导航，两侧对称，下拉面板如杂志目录般展开

### 4.3 指令执行流程
```
Step 1: /shape
"为策展型精品电商设计极简 Header，参考《Kinfolk》杂志排版，
要求：大量留白、衬线体、编辑感、下拉面板如目录"

Step 2: /impeccable teach
写入 collection.md：编辑排版规范、色彩克制原则

Step 3: /distill + /typeset（并行）
/distill: "剥离一切非必要元素，只保留 Logo、导航、两个操作 icon"
/typeset: "Logo 使用 Cormorant Garamond，导航使用 Instrument Sans，
          建立清晰的 14px/12px 两级字号"

Step 4: /quieter
"降低视觉噪音：去掉边框线，用留白分割区域，
  hover 状态仅用透明度变化，无背景色变化"

Step 5: /layout
"居中对齐导航，两侧各留 40% 空间，下拉面板三栏等宽"

Step 6: /polish
"微调：字母间距 +0.02em，行高 1.4，确保每个像素都经得起推敲"

Step 7: /audit + /adapt
检查对比度和移动端折叠逻辑
```

---

## 5. Luxe Vault（奢侈品珍藏）

### 5.1 业务定位
高端奢侈品电商平台，销售限量包袋、珠宝、腕表。用户是高净值人群，追求稀缺性和专属感。

### 5.2 设计简报
- **视觉关键词**：克制、精致、暗调、金属质感、永恒
- **排版**：极细字重（font-weight: 300）的大写字母间距导航，Logo 使用定制 Monogram 风格
- **色彩**：深炭黑背景 `#0a0a0a`，香槟金点缀 `#c9a96e`，文字用暖白色 `#f5f3ef`
- **动效**：缓慢、优雅，菜单展开如帷幕拉升，Hover 时有微妙的金色下划线延展
- **布局**：极简对称，导航项极少（仅 3-4 个），搜索隐藏为 icon，下拉面板全宽沉浸式

### 5.3 指令执行流程
```
Step 1: /shape
"为奢侈品电商平台设计极致克制的 Header，
要求：深炭黑背景、香槟金点缀、极细字重、全宽下拉帷幕"

Step 2: /impeccable teach
写入 luxe-vault.md：奢侈品视觉规范、金色使用法则

Step 3: /typeset + /quieter（并行）
/typeset: "导航使用大写字母，letter-spacing: 0.15em，font-weight: 300，
          字号 11px，营造精致感"
/quieter: "去除所有多余的视觉元素：无圆角、无阴影、无渐变"

Step 4: /layout
"三栏对称布局：Logo 中上，导航居中，操作区右上。
 下拉面板全宽，背景为深炭黑 + 金色细分割线"

Step 5: /polish
"打磨：金色线条 hover 时从左到右延展（width transition），
 购物车 badge 改为金色小圆点（无数字）"

Step 6: /audit + /adapt
检查对比度（金色在深色背景上需 ≥ 4.5:1），移动端改为全屏菜单
```

---

## 6. Impulse（冲动消费）

### 6.1 业务定位
限时闪购/快消电商平台，主打低价爆款、限时折扣、社交裂变。用户是价格敏感型消费者，决策时间短。

### 6.2 设计简报
- **视觉关键词**：紧迫感、高能量、促销氛围、鲜明
- **排版**：粗体数字、倒计时 badge、红色警示色
- **色彩**：纯白背景，主色用警示红 `#e53935`，促销标签用亮黄 `#ffd600`
- **动效**：快速、弹跳，Hover 时按钮放大，购物车添加时有 +1 飘字动画
- **布局**：顶部通栏促销条（红色背景 + 白色文字），下方标准 Header，搜索框突出，购物车 badge 显眼

### 6.3 指令执行流程
```
Step 1: /shape
"为限时闪购电商设计高能量 Header，
要求：顶部促销条、红色警示主色、购物车 badge 显眼、紧迫感"

Step 2: /impeccable teach
写入 impulse.md：促销色彩规范、紧迫感设计法则

Step 3: /bolder + /colorize（并行）
/bolder: "放大促销氛围：顶部通栏红色促销条，'限时特惠' 使用大写粗体"
/colorize: "主色用警示红 #e53935，促销标签用亮黄 #ffd600，
          倒计时数字用红色闪烁"

Step 4: /delight
"添加惊喜微交互：购物车添加商品时 +1 数字向上飘入，
  限时特惠标签带轻微抖动动画吸引注意"

Step 5: /animate
"快速过渡：菜单展开 150ms，hover 反馈即时（无延迟）"

Step 6: /layout
"顶部 36px 促销条 + 下方 64px Header，
 搜索框宽度 280px 且带放大镜 icon，购物车带红色数字 badge"

Step 7: /audit + /adapt
检查红色色盲友好性（不只用颜色区分信息），移动端促销条可折叠
```

---

## 7. Card Market（卡牌收藏）

### 7.1 业务定位
TCG（集换式卡牌游戏）交易平台，如宝可梦、万智牌、游戏王。用户是收藏家和玩家，注重社区感和稀有度展示。

### 7.2 设计简报
- **视觉关键词**：游戏感、收藏感、稀有度光泽、社区
- **排版**：像素风或等宽字体元素，稀有度标签（SSR/UR/LR）用渐变边框
- **色彩**：深蓝紫背景 `#1a1a2e`，金色稀有度点缀，卡牌边框用全息渐变
- **动效**：卡牌翻转感、光泽扫过效果、Hover 时轻微 3D 倾斜
- **布局**：搜索框为绝对核心（卡牌编号/名称搜索），导航按游戏分类（PTCG/MTG/YGO），用户头像旁显示交易信誉等级

### 7.3 指令执行流程
```
Step 1: /shape
"为 TCG 卡牌交易平台设计游戏感 Header，
要求：深蓝紫背景、卡牌稀有度光泽、搜索为核心、游戏分类导航"

Step 2: /impeccable teach
写入 card-market.md：TCG 视觉语言、稀有度色彩系统

Step 3: /colorize + /overdrive（并行）
/colorize: "深蓝紫背景 #1a1a2e，金色 #ffd700 用于 SSR 标签，
          全息渐变用于特殊元素边框"
/overdrive: "用户头像边框添加光泽扫过动画（shimmer），
           稀有度标签使用渐变边框 + 微光"

Step 4: /delight
"添加游戏化元素：用户信誉等级用徽章展示（铜/银/金/钻石），
 Hover 导航项时有卡牌轻微浮起效果"

Step 5: /animate
"搜索框聚焦时扩展宽度，下拉面板按游戏分类（PTCG/MTG/YGO），
 每个分类带对应游戏 icon"

Step 6: /layout
"左侧 Logo + 游戏分类导航（带 icon），
 中间超大搜索框（支持卡牌编号搜索），
 右侧用户徽章 + 购物车 + 交易消息"

Step 7: /audit + /adapt
检查动画性能（will-change, GPU 加速），移动端改为底部 Tab 导航
```

---

## 8. 执行优先级建议

| 优先级 | 业务 | 理由 |
|-------|------|------|
| P0 | Essential | 最简基础，先建立零装饰的功能性基准 |
| P1 | Collection | 在 Essential 基础上增加编辑感美学 |
| P2 | Fashion | 与 Collection 形成对比（极繁 vs 极简），验证组件灵活性 |
| P3 | Luxe Vault | 在极简基础上增加暗色模式和精致细节 |
| P4 | Impulse | 增加复杂性（促销条、高能量动效） |
| P5 | Card Market | 技术最复杂（overdrive 动效、游戏化），放在最后 |

---

## 9. 技术注意事项

1. **颜色派生工具**：每个 `theme.ts` 需导出 `deriveColors(headerBg, headerText)` 函数，使用 HSL/OKLCH 色彩空间计算
2. **CSS 变量**：组件内部使用 CSS 变量绑定派生后的颜色，而非 Tailwind 类名硬编码
3. **动画性能**：所有动画使用 `transform` 和 `opacity`，避免触发布局重排
4. **移动端策略**：每个业务独立定义移动端断点行为（抽屉/全屏/底部 Tab）
