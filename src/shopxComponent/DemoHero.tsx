interface HeroConfig {
  title: string
  subtitle: string
  cta: { label: string; href: string }
  backgroundImage: string
  style: { textColor: string; overlayColor: string }
}

export default function DemoHero({ config }: { config: HeroConfig }) {
  return (
    <section
      className="relative w-full h-[400px] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${config.backgroundImage})` }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: config.style.overlayColor }} />
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl font-bold mb-4" style={{ color: config.style.textColor }}>
          {config.title}
        </h1>
        <p className="text-lg mb-8 max-w-xl mx-auto opacity-90" style={{ color: config.style.textColor }}>
          {config.subtitle}
        </p>
        <a
          href={config.cta.href}
          className="inline-block px-8 py-3 rounded-lg font-semibold text-lg transition-transform hover:scale-105"
          style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
        >
          {config.cta.label}
        </a>
      </div>
    </section>
  )
}
