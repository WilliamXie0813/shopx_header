import { useState } from "react";
import { ThemeProvider } from "./theme/ThemeContext";
import { defaultTheme, type ThemeTokens } from "./theme/types";
import type { HeaderConfig } from "./types/header";
import {
	CenteredHeader,
	FloatingHeader,
	LuxeValutHeader,
	MegaHeader,
	MarketplaceHeader,
	StickyCompactHeader,
} from "./headers";

const demoNavigation = [
	{ label: "Home", href: "/" },
	{
		label: "Shop",
		href: "/shop",
		description: "Browse our products",
		children: [
			{ label: "New Arrivals", href: "/new", description: "Latest collection" },
			{
				label: "Best Sellers",
				href: "/bestsellers",
				description: "Customer favorites",
			},
			{ label: "Sale", href: "/sale", description: "Up to 50% off" },
		],
	},
	{
		label: "Collections",
		href: "/collections",
		description: "Curated for you",
		children: [
			{ label: "Spring", href: "/spring", description: "Light & airy styles" },
			{ label: "Summer", href: "/summer", description: "Warm weather picks" },
			{ label: "Fall", href: "/fall", description: "Cozy seasonal tones" },
			{
				label: "Winter",
				href: "/winter",
				description: "Cold weather essentials",
			},
		],
	},
	{ label: "About", href: "/about" },
	{ label: "Contact", href: "/contact" },
];

const darkTheme: ThemeTokens = {
	...defaultTheme,
	colors: {
		...defaultTheme.colors,
		background: "#0a0a0a",
		surface: "#141414",
		text: "#f5f3ef",
		textSecondary: "#888888",
		textInverse: "#f5f3ef",
		primary: "#c9a96e",
		border: "#2a2a2a",
	},
};

const variants = [
	{
		id: "centered",
		label: "Centered",
		theme: defaultTheme,
		render: (config: HeaderConfig) => <CenteredHeader config={config} />,
	},
	{
		id: "floating",
		label: "Floating",
		theme: defaultTheme,
		render: (config: HeaderConfig) => <FloatingHeader config={config} />,
	},
	{
		id: "luxe",
		label: "LuxeVault",
		theme: darkTheme,
		render: (config: HeaderConfig) => <LuxeValutHeader config={config} />,
	},
	{
		id: "mega",
		label: "Mega",
		theme: defaultTheme,
		render: (config: HeaderConfig) => <MegaHeader config={config} />,
	},
	{
		id: "marketplace",
		label: "Marketplace",
		theme: defaultTheme,
		render: (config: HeaderConfig) => <MarketplaceHeader config={config} />,
	},
	{
		id: "sticky",
		label: "Sticky",
		theme: defaultTheme,
		render: (config: HeaderConfig) => <StickyCompactHeader config={config} />,
	},
];

function makeConfig(variant: string, showSearch: boolean): HeaderConfig {
	return {
		type: "header",
		variant,
		showSearch,
		navigation: demoNavigation,
	};
}

export default function Playground() {
	const [selectedVariant, setSelectedVariant] = useState("centered");

	const variant = variants.find((v) => v.id === selectedVariant) || variants[0];
	const config = makeConfig(variant.id, true);

	return (
		<div className="h-full flex flex-col">
			<div
				className="flex-none px-6 py-3 flex items-center gap-2 border-b"
				style={{ borderColor: "#e2e8f0" }}
			>
				<span
					className="text-[10px] font-bold uppercase tracking-wider mr-2"
					style={{ color: "#94a3b8" }}
				>
					Variant
				</span>
				{variants.map((v) => (
					<button
						key={v.id}
						onClick={() => setSelectedVariant(v.id)}
						className="px-3 py-1 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
						style={{
							backgroundColor: selectedVariant === v.id ? "#0f172a" : "#f1f5f9",
							color: selectedVariant === v.id ? "#ffffff" : "#64748b",
						}}
					>
						{v.label}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-y-auto">
				<div className="p-6">
					<ThemeProvider theme={variant.theme}>
						{variant.render(config)}
					</ThemeProvider>
				</div>
				<div className="px-6 pb-6">
					<SkeletonGrid
						bg={variant.theme.colors.background}
						surface={variant.theme.colors.surface}
					/>
				</div>
			</div>
		</div>
	);
}

function SkeletonGrid({ bg, surface }: { bg: string; surface: string }) {
	const isDark = bg === "#0a0a0a" || bg === "#000000";
	const surfaceLight = isDark ? "#222222" : "#f8fafc";

	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-3 flex-[2]">
				<div
					className="flex-[3] rounded-2xl"
					style={{ backgroundColor: surface }}
				/>
				<div className="flex-[2] flex flex-col gap-3">
					<div
						className="flex-1 rounded-2xl"
						style={{ backgroundColor: surface }}
					/>
					<div
						className="h-16 rounded-xl"
						style={{ backgroundColor: surfaceLight }}
					/>
				</div>
			</div>
			<div className="flex gap-3 flex-1">
				<div
					className="flex-1 rounded-xl"
					style={{ backgroundColor: surface }}
				/>
				<div
					className="flex-1 rounded-xl"
					style={{ backgroundColor: surfaceLight }}
				/>
				<div className="flex-1 flex flex-col gap-2">
					<div
						className="h-8 rounded-lg"
						style={{ backgroundColor: surface }}
					/>
					<div
						className="flex-1 rounded-xl"
						style={{ backgroundColor: surface }}
					/>
				</div>
			</div>
			<div className="h-12 rounded-xl" style={{ backgroundColor: surface }} />
		</div>
	);
}
