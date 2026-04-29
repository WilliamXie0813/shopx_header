import { useState } from 'react'
import ColorField from '../ColorField'
import type { ThemeTokens } from '../theme/ThemeContext'

interface TokenEditorProps {
  theme: ThemeTokens
  onChange: (path: string, value: string) => void
}

const colorKeys: { key: keyof ThemeTokens['colors']; label: string }[] = [
  { key: 'primary', label: 'primary' },
  { key: 'background', label: 'background' },
  { key: 'surface', label: 'surface' },
  { key: 'text', label: 'text' },
  { key: 'textSecondary', label: 'textSecondary' },
  { key: 'textInverse', label: 'textInverse' },
  { key: 'border', label: 'border' },
  { key: 'error', label: 'error' },
  { key: 'success', label: 'success' },
  { key: 'warning', label: 'warning' },
]

const fontSizeKeys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const
const spacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const borderRadiusKeys = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-2"
      >
        <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
          {title}
        </h3>
        <span className="text-xs" style={{ color: '#94a3b8' }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && children}
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <label className="text-xs font-medium w-24 flex-shrink-0" style={{ color: '#64748b' }}>
        {label}
      </label>
      <input
        type="text"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 text-xs px-2 py-1 rounded border font-mono"
        style={{
          backgroundColor: '#f8fafc',
          borderColor: '#e2e8f0',
          color: '#1e293b',
        }}
      />
    </div>
  )
}

export default function TokenEditor({ theme, onChange }: TokenEditorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Colors */}
        <Section title="Colors">
          <div className="space-y-0.5">
            {colorKeys.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={theme.colors[key]}
                onChange={(value) => onChange(`colors.${key}`, value)}
              />
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-3">
            <TextField
              label="Heading Font"
              value={theme.typography.fontFamily.heading}
              onChange={(value) => onChange('typography.fontFamily.heading', value)}
            />
            <TextField
              label="Body Font"
              value={theme.typography.fontFamily.body}
              onChange={(value) => onChange('typography.fontFamily.body', value)}
            />
            <div className="pt-2">
              <div className="text-[10px] font-medium mb-2" style={{ color: '#94a3b8' }}>
                Font Sizes
              </div>
              <div className="space-y-1">
                {fontSizeKeys.map((key) => (
                  <TextField
                    key={key}
                    label={`Font Size ${key}`}
                    value={theme.typography.fontSizes[key]}
                    onChange={(value) => onChange(`typography.fontSizes.${key}`, value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Spacing */}
        <Section title="Spacing">
          <div className="space-y-1">
            {spacingKeys.map((key) => (
              <TextField
                key={key}
                label={`Spacing ${key}`}
                value={theme.spacing[key]}
                onChange={(value) => onChange(`spacing.${key}`, value)}
              />
            ))}
          </div>
        </Section>

        {/* Border Radius */}
        <Section title="Border Radius">
          <div className="space-y-1">
            {borderRadiusKeys.map((key) => (
              <TextField
                key={key}
                label={`Border Radius ${key}`}
                value={theme.borderRadius[key]}
                onChange={(value) => onChange(`borderRadius.${key}`, value)}
              />
            ))}
          </div>
        </Section>
      </div>

    </div>
  )
}
