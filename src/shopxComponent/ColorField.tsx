interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <label className="text-xs font-medium w-24 flex-shrink-0" style={{ color: '#64748b' }}>
        {label}
      </label>
      <input
        type="color"
        aria-label={`${label} color picker`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border-0 p-0 flex-shrink-0"
      />
      <input
        type="text"
        aria-label={`${label} hex`}
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
