import ColorField from './ColorField'
import type { ThemeTokens } from './theme/types'
import type { HeaderConfig } from './types/header'

interface TokenEditorProps {
  theme: ThemeTokens
  config: HeaderConfig
  onThemeChange: (path: string, value: string) => void
  onConfigChange: (path: string, value: boolean) => void
  onReset: () => void
}

const colorKeys: { key: keyof ThemeTokens['colors']; label: string }[] = [
  { key: 'primary', label: 'primary' },
  { key: 'background', label: 'background' },
  { key: 'surface', label: 'surface' },
  { key: 'text', label: 'text' },
  { key: 'textSecondary', label: 'textSecondary' },
  { key: 'textInverse', label: 'textInverse' },
  { key: 'border', label: 'border' },
]

export default function TokenEditor({
  theme,
  config,
  onThemeChange,
  onConfigChange,
  onReset,
}: TokenEditorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Colors */}
        <section>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: '#64748b' }}
          >
            Colors
          </h3>
          <div className="space-y-0.5">
            {colorKeys.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={theme.colors[key]}
                onChange={(value) => onThemeChange(`colors.${key}`, value)}
              />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: '#64748b' }}
          >
            Typography
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="font-heading"
                className="text-xs font-medium block mb-1"
                style={{ color: '#64748b' }}
              >
                Heading Font
              </label>
              <input
                id="font-heading"
                type="text"
                value={theme.typography.fontFamily.heading}
                onChange={(e) =>
                  onThemeChange('typography.fontFamily.heading', e.target.value)
                }
                className="w-full text-xs px-2 py-1.5 rounded border font-mono"
                style={{
                  backgroundColor: '#f8fafc',
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                }}
              />
            </div>
            <div>
              <label
                htmlFor="font-body"
                className="text-xs font-medium block mb-1"
                style={{ color: '#64748b' }}
              >
                Body Font
              </label>
              <input
                id="font-body"
                type="text"
                value={theme.typography.fontFamily.body}
                onChange={(e) =>
                  onThemeChange('typography.fontFamily.body', e.target.value)
                }
                className="w-full text-xs px-2 py-1.5 rounded border font-mono"
                style={{
                  backgroundColor: '#f8fafc',
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                }}
              />
            </div>
          </div>
        </section>

        {/* Config */}
        <section>
          <h3
            className="text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: '#64748b' }}
          >
            Config
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              aria-label="Show search"
              checked={config.showSearch}
              onChange={(e) => onConfigChange('showSearch', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs" style={{ color: '#1e293b' }}>
              Show search
            </span>
          </label>
        </section>
      </div>

      {/* Reset button */}
      <div className="flex-none px-4 py-3 border-t" style={{ borderColor: '#e2e8f0' }}>
        <button
          onClick={onReset}
          className="w-full text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
          }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  )
}
