import { Sparkles, Wand2, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react'
import type { Suggestion, AiStrategy, InlineAiEditorProps } from './types'
import { useAiEditor } from './useAiEditor'

const strategies: AiStrategy[] = ['Balanced', 'Professional', 'Concise']

function StrategyTag({
  label,
  active,
  onClick,
}: {
  label: AiStrategy
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium
        transition-all duration-200 cursor-pointer select-none
        ${active
          ? 'bg-[var(--accent)] text-white shadow-sm'
          : 'bg-[var(--code-bg)] text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'
        }
      `}
    >
      {label}
    </button>
  )
}

function SuggestionCard({
  suggestion,
  index,
  onApply,
}: {
  suggestion: Suggestion
  index: number
  onApply: (s: Suggestion) => void
}) {
  const labels = ['Candidate A', 'Candidate B', 'Candidate C']
  return (
    <div
      className="
        group relative p-3.5 rounded-lg border border-[var(--border)]
        bg-[var(--bg)] transition-all duration-200
        hover:border-[var(--accent-border)] hover:shadow-[var(--shadow)]
      "
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-[var(--accent)] tracking-wide uppercase">
          {labels[index] ?? suggestion.label}
        </span>
        <span className="text-[10px] text-[var(--text)] opacity-50">
          {suggestion.text.length} chars
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--text-h)] mb-3 line-clamp-4">
        {suggestion.text}
      </p>
      <div className="flex justify-end">
        <button
          onClick={() => onApply(suggestion)}
          className="
            inline-flex items-center gap-1 px-3 py-1.5 rounded-md
            text-xs font-medium text-white bg-[var(--accent)]
            hover:opacity-90 active:scale-[0.97]
            transition-all duration-150 cursor-pointer
          "
        >
          <Check size={12} />
          采用
        </button>
      </div>
    </div>
  )
}

function GeneratingState() {
  const steps = ['Thinking...', 'Rewriting...', 'Creating alternatives...']
  return (
    <div className="py-6 flex flex-col items-center gap-3">
      <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
      <span className="text-sm text-[var(--text)]">Generating suggestions...</span>
      <div className="flex flex-col gap-1.5 mt-1">
        {steps.map((step, i) => (
          <span
            key={step}
            className="text-xs text-[var(--text)] opacity-50 flex items-center gap-2"
            style={{ animationDelay: `${i * 400}ms` }}
          >
            <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-60" />
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-5 flex flex-col items-center gap-3">
      <AlertCircle size={20} className="text-red-500" />
      <span className="text-sm text-red-500">{message}</span>
      <button
        onClick={onRetry}
        className="
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
          text-xs font-medium text-[var(--text)] bg-[var(--code-bg)]
          hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]
          transition-all duration-150 cursor-pointer
        "
      >
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  )
}

function SavingState() {
  return (
    <div className="py-4 flex items-center justify-center gap-2 text-sm text-[var(--text)]">
      <Loader2 size={14} className="animate-spin" />
      Saving...
    </div>
  )
}

export default function InlineAiEditor({ value, onSave, onGenerate, onClose }: InlineAiEditorProps) {
  const {
    editorRef,
    text,
    setText,
    prompt,
    setPrompt,
    strategy,
    setStrategy,
    state,
    suggestions,
    error,
    handleGenerate,
    handleApply,
    handleRetry,
  } = useAiEditor({ value, onSave, onGenerate, onClose })

  const canGenerate = prompt.trim().length > 0 && state !== 'generating'

  return (
    <div
      ref={editorRef}
      className="
        mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]
        shadow-[var(--shadow)] overflow-hidden
        transition-all duration-300 ease-out
        ai-editor-enter
      "
      style={{ maxWidth: '560px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--code-bg)]/30">
        <div className="flex items-center gap-1.5">
          <Wand2 size={14} className="text-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--text-h)]">Edit with AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          {strategies.map((s) => (
            <StrategyTag
              key={s}
              label={s}
              active={strategy === s}
              onClick={() => setStrategy(s)}
            />
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="px-4 pt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="
            w-full resize-none bg-transparent text-[15px] leading-relaxed
            text-[var(--text-h)] placeholder:text-[var(--text)]/40
            outline-none border-none p-0
          "
          placeholder="Start writing or select a suggestion..."
          disabled={state === 'saving'}
        />
      </div>

      {/* AI Prompt Input */}
      {state !== 'generated' && state !== 'saving' && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mt-2">
            <Sparkles size={14} className="text-[var(--accent)] shrink-0" />
            <span className="text-xs text-[var(--text)]">Describe changes</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canGenerate) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
              maxLength={100}
              placeholder="More professional, shorter, friendlier..."
              className="
                flex-1 min-w-0 px-3 py-2 rounded-lg text-sm
                bg-[var(--code-bg)] text-[var(--text-h)]
                border border-[var(--border)]
                placeholder:text-[var(--text)]/40
                outline-none
                focus:border-[var(--accent-border)] focus:ring-1 focus:ring-[var(--accent-border)]
                transition-all duration-200
              "
            />
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`
                shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                text-sm font-medium transition-all duration-200 cursor-pointer
                ${canGenerate
                  ? 'bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.97] shadow-sm'
                  : 'bg-[var(--code-bg)] text-[var(--text)]/40 cursor-not-allowed'
                }
              `}
            >
              {state === 'generating' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  AI...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Optimize
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Generated Suggestions */}
      {state === 'generated' && suggestions.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-h)]">Suggestions</span>
            <button
              onClick={handleGenerate}
              className="
                inline-flex items-center gap-1 text-[11px] text-[var(--accent)]
                hover:underline cursor-pointer transition-all duration-150
              "
            >
              <RefreshCw size={11} />
              Regenerate
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {suggestions.map((suggestion, i) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                index={i}
                onApply={handleApply}
              />
            ))}
          </div>
        </div>
      )}

      {/* Generating State */}
      {state === 'generating' && <GeneratingState />}

      {/* Error State */}
      {state === 'error' && error && (
        <ErrorState message={error} onRetry={handleRetry} />
      )}

      {/* Saving State */}
      {state === 'saving' && <SavingState />}

      {/* Footer hint */}
      {state === 'editing' && (
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--code-bg)]/20">
          <span className="text-[10px] text-[var(--text)]/50">
            Click outside to save · Enter to generate
          </span>
        </div>
      )}
    </div>
  )
}
