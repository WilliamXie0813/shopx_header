// Demo ShopX-UI Header component.
// The Vite plugin will auto-inject __editable() on JSX elements
// that reference config properties. No manual editing code needed.

interface NavItem {
  label: string
  href: string
  description?: string
  children?: NavItem[]
}

interface HeaderConfig {
  title: string
  subtitle: string
  navigation: {
    items: NavItem[]
  }
  style: {
    backgroundColor: string
    textColor: string
  }
}

interface HeaderData {
  user?: { name: string; avatar?: string }
  cartCount?: number
}

export default function DemoHeader({
  config,
  data,
}: {
  config: HeaderConfig
  data?: HeaderData
}) {
  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: config.style.backgroundColor }}
    >
      {/* Brand area */}
      <div className="flex items-center gap-4">
        <a href="/" className="text-xl font-bold" style={{ color: config.style.textColor }}>
          {config.title}
        </a>
        <span className="text-sm opacity-60" style={{ color: config.style.textColor }}>
          {config.subtitle}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        {config.navigation.items.map((item, i) => (
          <div key={i} className="relative group">
            <a href={item.href} className="text-sm font-medium hover:underline"
               style={{ color: config.style.textColor }}>
              {item.label}
            </a>
            {item.children && item.children.length > 0 && (
              <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg py-2 min-w-[160px] hidden group-hover:block">
                {item.children.map((child, j) => (
                  <a
                    key={j}
                    href={child.href}
                    className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {data?.user && (
          <span className="text-sm" style={{ color: config.style.textColor }}>
            {data.user.name}
          </span>
        )}
      </div>
    </header>
  )
}
