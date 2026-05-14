interface FooterLink {
  label: string
  href: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

interface SocialLink {
  label: string
  href: string
  icon: string
}

interface FooterConfig {
  brand: { name: string; description: string }
  columns: FooterColumn[]
  social: SocialLink[]
  copyright: string
  style: { backgroundColor: string; textColor: string; mutedColor: string }
}

export default function DemoFooter({ config }: { config: FooterConfig }) {
  return (
    <footer className="py-12 px-6" style={{ backgroundColor: config.style.backgroundColor }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold mb-3" style={{ color: config.style.textColor }}>
            {config.brand.name}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: config.style.mutedColor }}>
            {config.brand.description}
          </p>
        </div>

        {/* Link columns */}
        {config.columns.map((col, i) => (
          <div key={i}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: config.style.textColor }}>
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((link, j) => (
                <li key={j}>
                  <a
                    href={link.href}
                    className="text-sm hover:underline"
                    style={{ color: config.style.mutedColor }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
           style={{ borderColor: config.style.mutedColor }}>
        <p className="text-xs" style={{ color: config.style.mutedColor }}>
          {config.copyright}
        </p>
        <div className="flex items-center gap-4">
          {config.social.map((s, i) => (
            <a
              key={i}
              href={s.href}
              className="text-xs hover:underline"
              style={{ color: config.style.mutedColor }}
              aria-label={s.label}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
