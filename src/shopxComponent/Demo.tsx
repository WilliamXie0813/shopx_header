import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Code } from 'lucide-react'
import ReactJson from '@microlink/react-json-view'
import Playground from './Playground'
import { ThemeProvider, useTheme } from './theme/ThemeContext'
import type { ThemeTokens } from './theme/ThemeContext'
import {
  CenteredHeader,
  FloatingHeader,
  LuxeValutHeader,
  MegaHeader,
  MarketplaceHeader,
  StickyCompactHeader,
} from './headers'
import type { HeaderConfig } from './types/header'

const demoNavigation = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    href: '/shop',
    description: 'Browse our products',
    children: [
      { label: 'New Arrivals', href: '/new', description: 'Latest collection' },
      { label: 'Best Sellers', href: '/bestsellers', description: 'Customer favorites' },
      { label: 'Sale', href: '/sale', description: 'Up to 50% off' },
    ],
  },
  {
    label: 'Collections',
    href: '/collections',
    description: 'Curated for you',
    children: [
      { label: 'Spring', href: '/spring', description: 'Light & airy styles' },
      { label: 'Summer', href: '/summer', description: 'Warm weather picks' },
      { label: 'Fall', href: '/fall', description: 'Cozy seasonal tones' },
      { label: 'Winter', href: '/winter', description: 'Cold weather essentials' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const megaNavigation = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/products',
    description: 'Browse all categories',
    children: [
      { label: 'Electronics', href: '/electronics', description: 'Gadgets & devices' },
      { label: 'Fashion', href: '/fashion', description: 'Clothing & accessories' },
      { label: 'Home', href: '/home', description: 'Decor & furniture' },
      { label: 'Sports', href: '/sports', description: 'Gear & equipment' },
    ],
  },
  {
    label: 'Brands',
    href: '/brands',
    description: 'Top partners',
    children: [
      { label: 'Nike', href: '/nike', description: 'Just do it' },
      { label: 'Apple', href: '/apple', description: 'Think different' },
      { label: 'Sony', href: '/sony', description: 'Make believe' },
    ],
  },
  { label: 'Deals', href: '/deals' },
]

function makeDarkTheme(base: ThemeTokens): ThemeTokens {
  return {
    ...base,
    colors: {
      ...base.colors,
      background: '#0a0a0a',
      surface: '#141414',
      text: '#f5f3ef',
      textSecondary: '#888888',
      textInverse: '#f5f3ef',
      primary: '#c9a96e',
      border: '#2a2a2a',
    },
  }
}

function makeConfig(variant: string, showSearch: boolean, navigation: typeof demoNavigation): HeaderConfig {
  return {
    type: 'header',
    variant,
    showSearch,
    navigation,
  }
}

interface Slide {
  id: string
  title: string
  subtitle: string
  bg: string
  nav: typeof demoNavigation
  render: (config: HeaderConfig) => React.ReactNode
}

function ConfigPanel({ config, theme, isDark }: { config: HeaderConfig; theme: ThemeTokens; isDark: boolean }) {
  const [open, setOpen] = useState(false)

  const previewTheme = {
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      surface: theme.colors.surface,
      text: theme.colors.text,
      textSecondary: theme.colors.textSecondary,
      textInverse: theme.colors.textInverse,
      border: theme.colors.border,
    },
    typography: {
      fontFamily: theme.typography.fontFamily,
    },
    borderRadius: {
      md: theme.borderRadius.md,
      lg: theme.borderRadius.lg,
      xl: theme.borderRadius.xl,
      full: theme.borderRadius.full,
    },
  }

  const previewConfig = {
    type: config.type,
    variant: config.variant,
    showSearch: config.showSearch,
    navigation: config.navigation.map((n) => ({
      label: n.label,
      href: n.href,
      ...(n.description ? { description: n.description } : {}),
      ...(n.children ? { children: n.children.map((c) => ({ label: c.label, href: c.href })) } : {}),
    })),
  }

  const jsonTheme = isDark ? 'monokai' : 'rjv-default'

  return (
    <div className="absolute top-4 right-4 z-[60]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          color: isDark ? '#c9a96e' : '#374151',
          border: `1px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}`,
        }}
      >
        <Code size={14} />
        {open ? 'Hide Config' : 'Show Config'}
      </button>

      {open && (
        <div
          className="mt-2 w-[1200px] max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-auto rounded-xl p-5 shadow-2xl text-left"
          style={{
            backgroundColor: isDark ? '#0f0f0f' : '#ffffff',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}`,
          }}
        >
          <div className="mb-4">
            <div
              className="text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: isDark ? '#c9a96e' : '#3b82f6' }}
            >
              config
            </div>
            <div className="rounded-lg overflow-hidden"
              style={{ backgroundColor: isDark ? '#1a1a1a' : '#f8fafc', textAlign: 'left' }}
            >
              <ReactJson
                src={previewConfig}
                name={false}
                collapsed={1}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                theme={jsonTheme}
                style={{ padding: '12px', fontSize: '12px', textAlign: 'left', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
              />
            </div>
          </div>

          <div>
            <div
              className="text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: isDark ? '#c9a96e' : '#3b82f6' }}
            >
              theme tokens
            </div>
            <div className="rounded-lg overflow-hidden"
              style={{ backgroundColor: isDark ? '#1a1a1a' : '#f8fafc' }}
            >
              <ReactJson
                src={previewTheme}
                name={false}
                collapsed={2}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                theme={jsonTheme}
                style={{ padding: '12px', fontSize: '12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const slides: Slide[] = [
  {
    id: 'centered',
    title: 'CenteredHeader',
    subtitle: 'Logo centered, symmetric navigation layout',
    bg: '#ffffff',
    nav: demoNavigation,
    render: (config) => <CenteredHeader config={config} />,
  },
  {
    id: 'floating',
    title: 'FloatingHeader',
    subtitle: 'Floating card with shadow & rounded corners',
    bg: '#f1f5f9',
    nav: demoNavigation,
    render: (config) => <FloatingHeader config={config} />,
  },
  {
    id: 'luxe',
    title: 'LuxeValutHeader',
    subtitle: 'Dark luxury theme with gold accents',
    bg: '#0a0a0a',
    nav: demoNavigation,
    render: (config) => <LuxeValutHeader config={config} />,
  },
  {
    id: 'mega',
    title: 'MegaHeader',
    subtitle: 'Full-width mega dropdown menu',
    bg: '#ffffff',
    nav: megaNavigation,
    render: (config) => <MegaHeader config={config} />,
  },
  {
    id: 'marketplace',
    title: 'MarketplaceHeader',
    subtitle: 'E-commerce style with category pills & big search',
    bg: '#ffffff',
    nav: demoNavigation,
    render: (config) => <MarketplaceHeader config={config} />,
  },
  {
    id: 'sticky',
    title: 'StickyCompactHeader',
    subtitle: 'Fixed sticky header that compacts on scroll',
    bg: '#f8fafc',
    nav: demoNavigation,
    render: (config) => <StickyCompactHeader config={config} />,
  },
]

function SkeletonGrid({ isDark }: { isDark: boolean }) {
  const surface = isDark ? '#1a1a1a' : '#f1f5f9'
  const surfaceLight = isDark ? '#222222' : '#f8fafc'

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Top row: asymmetric split */}
      <div className="flex gap-3 flex-[2]">
        <div className="flex-[3] rounded-2xl" style={{ backgroundColor: surface }} />
        <div className="flex-[2] flex flex-col gap-3">
          <div className="flex-1 rounded-2xl" style={{ backgroundColor: surface }} />
          <div className="h-16 rounded-xl" style={{ backgroundColor: surfaceLight }} />
        </div>
      </div>
      {/* Middle row: 3 columns with different heights */}
      <div className="flex gap-3 flex-1">
        <div className="flex-1 rounded-xl" style={{ backgroundColor: surface }} />
        <div className="flex-1 rounded-xl" style={{ backgroundColor: surfaceLight }} />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-8 rounded-lg" style={{ backgroundColor: surface }} />
          <div className="flex-1 rounded-xl" style={{ backgroundColor: surface }} />
        </div>
      </div>
      {/* Bottom row: wide banner */}
      <div className="h-12 rounded-xl" style={{ backgroundColor: surface }} />
    </div>
  )
}

export default function Demo() {
  const baseTheme = useTheme()
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [mode, setMode] = useState<'carousel' | 'playground'>('carousel')
  const total = slides.length
  const slide = slides[current]
  const isDark = slide.bg === '#0a0a0a'

  const slideTheme = useMemo(
    () => (slide.id === 'luxe' ? makeDarkTheme(baseTheme) : baseTheme),
    [slide, baseTheme]
  )

  const changeSlide = useCallback((next: number) => {
    if (transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setCurrent(next)
      setTransitioning(false)
    }, 180)
  }, [transitioning])

  const goNext = useCallback(() => {
    changeSlide((current + 1) % total)
  }, [changeSlide, current, total])

  const goPrev = useCallback(() => {
    changeSlide((current - 1 + total) % total)
  }, [changeSlide, current, total])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  const config = makeConfig(slide.title, true, slide.nav)

  return (
    <div
      className="h-screen w-screen overflow-hidden relative flex flex-col transition-colors duration-300"
      style={{ backgroundColor: slide.bg }}
    >
      <ConfigPanel config={config} theme={slideTheme} isDark={isDark} />

      {/* Decorative page number */}
      <div
        className="absolute top-0 left-6 text-[10rem] font-bold leading-none select-none pointer-events-none transition-opacity duration-300"
        style={{
          color: isDark ? '#ffffff' : '#000000',
          opacity: isDark ? 0.035 : 0.03,
          fontFamily: baseTheme.typography.fontFamily.heading,
        }}
      >
        {String(current + 1).padStart(2, '0')}
      </div>

      {/* Header */}
      <header className="flex-none px-8 pt-6 pb-3 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: isDark ? '#c9a96e' : '#3b82f6' }}
          >
            {slide.id}
          </span>
          <span style={{ color: isDark ? '#444' : '#d1d5db' }}>/</span>
          <span
            className="text-[10px] tabular-nums"
            style={{ color: isDark ? '#666' : '#9ca3af' }}
          >
            {current + 1} of {total}
          </span>
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            color: isDark ? '#f5f3ef' : '#0f172a',
            fontFamily: baseTheme.typography.fontFamily.heading,
          }}
        >
          {slide.title}
        </h1>
        <p
          className="text-sm mt-0.5 max-w-md leading-relaxed"
          style={{ color: isDark ? '#888' : '#64748b' }}
        >
          {slide.subtitle}
        </p>
        <div className="absolute top-6 right-8">
          <button
            onClick={() => setMode((m) => (m === 'carousel' ? 'playground' : 'carousel'))}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#f1f5f9',
              color: isDark ? '#c9a96e' : '#3b82f6',
              border: `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
            }}
          >
            {mode === 'carousel' ? 'Playground →' : '← Carousel'}
          </button>
        </div>
      </header>

      {mode === 'playground' && (
        <div className="flex-1 min-h-0">
          <Playground />
        </div>
      )}

      {mode === 'carousel' && (
        <>
          {/* Header component demo */}
          <div
            className="flex-none px-8 transition-opacity duration-150"
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            <ThemeProvider theme={slideTheme}>
              {slide.render(config)}
            </ThemeProvider>
          </div>

          {/* Page content skeleton */}
          <div
            className="flex-1 px-8 py-5 min-h-0 transition-opacity duration-150"
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            {slide.id !== 'sticky' && (
              <SkeletonGrid isDark={isDark} />
            )}

            {slide.id === 'sticky' && (
              <div className="h-full overflow-auto">
                <div className="max-w-3xl mx-auto">
                  <p className="text-sm mb-4" style={{ color: isDark ? '#888' : '#6b7280' }}>
                    Scroll down to see the header compact automatically.
                  </p>
                  <div className="space-y-4">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <p key={i} className="text-sm leading-relaxed" style={{ color: isDark ? '#555' : '#d1d5db' }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Bottom navigation */}
        <div className="flex-none px-8 py-4 relative z-10">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={goPrev}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                color: isDark ? '#f5f3ef' : '#374151',
                border: `1px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}`,
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => changeSlide(idx)}
                  className="rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    width: idx === current ? '28px' : '6px',
                    height: '6px',
                    backgroundColor: idx === current
                      ? (isDark ? '#c9a96e' : '#0f172a')
                      : (isDark ? '#333' : '#d1d5db'),
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                color: isDark ? '#f5f3ef' : '#374151',
                border: `1px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}`,
              }}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </>
    )}
    </div>
  )
}
