import { JsonConfigProvider, useJsonConfig, ConfigScope, InlineEditor } from "./editable";
import DemoHeader from "./DemoHeader";
import DemoHero from "./DemoHero";
import DemoProductGrid from "./DemoProductGrid";
import DemoFooter from "./DemoFooter";

const pageConfig = {
  header: {
    title: "ShopX",
    subtitle: "AI-driven e-commerce",
    navigation: {
      items: [
        {
          label: "Shop",
          href: "/shop",
          description: "Browse products",
          children: [
            { label: "Women", href: "/shop/women" },
            { label: "Men", href: "/shop/men" },
            { label: "Kids", href: "/shop/kids" },
          ],
        },
        {
          label: "About",
          href: "/about",
          children: [
            { label: "Team", href: "/about/team" },
            { label: "Careers", href: "/about/careers" },
          ],
        },
        { label: "Contact", href: "/contact" },
      ],
    },
    style: { backgroundColor: "#ffffff", textColor: "#1e293b" },
  },

  hero: {
    title: "Discover Your Style",
    subtitle: "Curated collections that define modern living. Shop the latest trends with AI-powered recommendations.",
    cta: { label: "Shop Now", href: "/shop" },
    backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
    style: { textColor: "#ffffff", overlayColor: "rgba(0,0,0,0.4)" },
  },

  products: {
    title: "Trending Products",
    products: [
      { image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", title: "Wireless Headphones", price: "$79.99", badge: "Sale" },
      { image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", title: "Minimalist Watch", price: "$129.99" },
      { image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", title: "Running Shoes", price: "$99.99", badge: "New" },
      { image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", title: "Canvas Backpack", price: "$54.99" },
    ],
    style: { backgroundColor: "#f8fafc", textColor: "#1e293b", cardBackground: "#ffffff" },
  },

  footer: {
    brand: { name: "ShopX", description: "AI-powered e-commerce platform delivering personalized shopping experiences." },
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All Products", href: "/shop" },
          { label: "New Arrivals", href: "/new" },
          { label: "Sale", href: "/sale" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Press", href: "/press" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", href: "/help" },
          { label: "Shipping", href: "/shipping" },
          { label: "Returns", href: "/returns" },
        ],
      },
    ],
    social: [
      { label: "Twitter", href: "#", icon: "twitter" },
      { label: "Instagram", href: "#", icon: "instagram" },
      { label: "Facebook", href: "#", icon: "facebook" },
    ],
    copyright: "© 2026 ShopX. All rights reserved.",
    style: { backgroundColor: "#1e293b", textColor: "#f1f5f9", mutedColor: "#94a3b8" },
  },
};

const sampleData = { user: { name: "Jane Doe" }, cartCount: 3 };

function PageRenderer() {
  const { config } = useJsonConfig();
  const cfg = config as typeof pageConfig;

  return (
    <>
      <ConfigScope prefix="header">
        <DemoHeader config={cfg.header} data={sampleData} />
      </ConfigScope>
      <ConfigScope prefix="hero">
        <DemoHero config={cfg.hero} />
      </ConfigScope>
      <ConfigScope prefix="products">
        <DemoProductGrid config={cfg.products} />
      </ConfigScope>
      <ConfigScope prefix="footer">
        <DemoFooter config={cfg.footer} />
      </ConfigScope>
    </>
  );
}

export default function EditableDemo() {
  return (
    <JsonConfigProvider initialConfig={pageConfig} defaultMode="edit">
      <PageRenderer />
      <InlineEditor />
      <ConfigPreview />
    </JsonConfigProvider>
  );
}

function ConfigPreview() {
  const { config } = useJsonConfig();

  return (
    <div
      className="fixed top-4 right-4 z-[9999] w-[360px] max-h-[calc(100vh-32px)] overflow-auto rounded-xl shadow-2xl border border-white/10"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-semibold text-white">JSON Config</span>
        <span className="text-[10px] text-white/40">live preview</span>
      </div>
      <pre className="p-4 text-xs font-mono text-green-400 whitespace-pre-wrap">
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  );
}
