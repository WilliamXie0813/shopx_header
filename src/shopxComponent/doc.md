# 背景

ShopX 是基于 AI 生成 JSON Schema 配置的快速建站项目。

# 技术配置

1. React 18 + tailwindcss

# 组件接口定义

以 Header 组件为例，只接手2个参数 config & data，config 负责基础的Header功能定义，data负责传递页面数据【暂定】。

Config 的简单定义如下：
type: "header" - 渲染的组件类型
variant: 'bold' - 组件的变体，不同的变体有不同的UI风格和布局功能。
showSearch: boolean - 是否展示搜索框。
navigation: {
label: string;
href: string;
description: string;
children: navigation item;
} - Header Navigation Menu, 最多只支持一层二级菜单

data: 暂时还没有确定，先用 any 表示

值得注意的是 组件的样式也是由 AI 生成token对应的样式传进来的，目前打算使用React Context 放到全局的 ThemeContext 中获取，以下是一些Header可能用到的token

类别 可用于 Header 的 token 典型用途
颜色 primary, background, surface, text, textSecondary, textInverse, border Header 背景、导航文字、分隔线、主按钮、反白文字、下拉面板
状态色 error, success, warning 顶部通知条、状态 badge、告警/成功提示
字体族 typography.fontFamily.heading, typography.fontFamily.body 品牌名/logo、导航、辅助文案
字号 typography.fontSizes.xs ~ typography.fontSizes.6xl utility text、导航、品牌名、促销文案
间距 spacing.xs ~ spacing.3xl Header 高度、左右 padding、导航 gap、icon 间距
圆角 borderRadius.none, sm, md, lg, xl, full 搜索框、按钮、badge、下拉菜单

# 需求

请你根据以上条件，生成以下风格的Header组件
CenteredHeader
FloatingHeader
LuxeValutHeader
MegaHeader
MarketplaceHeader
StickyCompactHeader

以上一切代码放入 D:\project\AI\AICoWork\my-vite\src\shopxComponent 文件夹下
