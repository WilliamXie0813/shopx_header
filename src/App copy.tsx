import NavigationMenu, { type MenuItem } from "./components/NavigationMenu";
import { ShoppingCart, User } from "lucide-react";

const menuItems: MenuItem[] = [
	{ label: "首页", href: "/" },
	{
		label: "数码家电",
		children: [
			{
				label: "手机通讯",
				children: [
					{ label: "智能手机", href: "/phone" },
					{ label: "拍照手机", href: "/camera-phone" },
					{ label: "游戏手机", href: "/gaming-phone" },
				],
			},
			{
				label: "电脑办公",
				children: [
					{ label: "笔记本电脑", href: "/laptop" },
					{ label: "平板电脑", href: "/tablet" },
					{ label: "显示器", href: "/monitor" },
				],
			},
			{
				label: "影音娱乐",
				children: [
					{ label: "无线耳机", href: "/earphone" },
					{ label: "智能音箱", href: "/speaker" },
					{ label: "投影仪", href: "/projector" },
				],
			},
		],
	},
	{
		label: "服饰时尚",
		children: [
			{
				label: "男装",
				children: [
					{ label: "T恤", href: "/men/tshirt" },
					{ label: "衬衫", href: "/men/shirt" },
					{ label: "夹克", href: "/men/jacket" },
				],
			},
			{
				label: "女装",
				children: [
					{ label: "连衣裙", href: "/women/dress" },
					{ label: "半身裙", href: "/women/skirt" },
					{ label: "针织衫", href: "/women/sweater" },
				],
			},
			{
				label: "运动户外",
				children: [
					{ label: "运动鞋", href: "/sneakers" },
					{ label: "跑步装备", href: "/running" },
					{ label: "户外背包", href: "/backpack" },
				],
			},
		],
	},
	{
		label: "生活家居",
		children: [
			{ label: "家具", href: "/furniture" },
			{ label: "厨具", href: "/kitchen" },
			{ label: "家纺", href: "/textile" },
			{ label: "收纳整理", href: "/storage" },
		],
	},
	{ label: "限时特惠", href: "/sale" },
];

function App() {
	return (
		<div className="w-full min-h-screen bg-gray-50">
			<header className="w-full bg-white border-b border-gray-100">
				<div className="mx-auto grid max-w-5xl grid-cols-[auto_1fr_auto] items-center px-6 py-4 gap-4">
					{/* Left: Logo */}
					<a
						href="/"
						className="text-lg font-bold tracking-tight text-gray-900 hover:text-rose-600 transition-colors"
					>
						MyShop
					</a>

					{/* Center: Navigation */}
					<div className="flex justify-center">
						<NavigationMenu items={menuItems} activeHref="/" />
					</div>

					{/* Right: Actions */}
					<div className="flex items-center justify-end gap-3">
						<a
							href="/cart"
							className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
						>
							<ShoppingCart size={18} strokeWidth={1.5} />
						</a>
						<a
							href="/account"
							className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
						>
							<User size={18} strokeWidth={1.5} />
						</a>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 py-16">
				<div className="mx-auto max-w-2xl text-center">
					<h1 className="text-4xl font-bold tracking-tight text-gray-900">
						Navigation Menu
					</h1>
					<p className="mt-4 text-base text-gray-500 leading-relaxed">
						悬停菜单项展开下拉面板，子分类多时自动切换为多列布局。
						在移动端可点击右上角按钮体验侧边抽屉菜单。
					</p>
				</div>
			</main>
		</div>
	);
}

export default App;
