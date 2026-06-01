import { useState } from 'react'
import { Pencil } from 'lucide-react'
import InlineAiEditor from './InlineAiEditor'
import type { EditableParagraphProps } from './types'

export default function EditableParagraph({
  id,
  value,
  active,
  onOpen,
  onSave,
  onClose,
  onGenerate,
}: EditableParagraphProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleSave = (text: string) => {
    onSave(id, text)
  }

  const handleClose = () => {
    onClose(id)
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Text display */}
      <div
        onClick={() => onOpen(id)}
        className={`
          relative px-1 py-0.5 -mx-1 rounded-md cursor-text
          transition-all duration-200
          ${active
            ? 'bg-[var(--accent-bg)]'
            : 'hover:bg-[var(--code-bg)]/60'
          }
        `}
      >
        <p className="text-[var(--text-h)] leading-relaxed">{value}</p>

        {/* Edit icon - visible on hover when not active */}
        {!active && isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpen(id)
            }}
            className="
              absolute -right-8 top-1/2 -translate-y-1/2
              flex items-center justify-center
              w-7 h-7 rounded-md
              bg-[var(--bg)] border border-[var(--border)]
              text-[var(--text)] hover:text-[var(--accent)]
              hover:border-[var(--accent-border)]
              shadow-sm
              transition-all duration-150 cursor-pointer
            "
            aria-label="Edit with AI"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {/* Inline AI Editor */}
      {active && (
        <InlineAiEditor
          value={value}
          onSave={handleSave}
          onGenerate={onGenerate}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
