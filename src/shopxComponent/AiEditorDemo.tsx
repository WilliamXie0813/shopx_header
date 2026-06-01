import { useState, useCallback } from 'react'
import { EditableParagraph } from '../ai-editor'
import type { Suggestion, AiStrategy } from '../ai-editor'

const initialParagraphs = [
  {
    id: 'title',
    text: 'Project Proposal: AI-Powered Content Assistant',
  },
  {
    id: 'intro',
    text: 'We are building an intelligent content editing platform that helps writers and marketers create compelling copy faster. By combining large language models with an intuitive inline editing experience, users can iterate on their ideas without leaving their workflow.',
  },
  {
    id: 'features',
    text: 'The platform offers real-time suggestions, tone adjustment, length optimization, and multilingual support. Writers can select from multiple AI-generated alternatives and apply the one that best fits their voice.',
  },
  {
    id: 'outro',
    text: 'Our goal is to make AI assistance feel like a natural extension of the writing process — not a replacement for human creativity. Every suggestion is a starting point, and the final decision always rests with the author.',
  },
]

// Simulated AI generation with delays
async function mockGenerate(prompt: string, strategy: AiStrategy): Promise<Suggestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 1800))

  const strategyModifiers: Record<AiStrategy, string> = {
    Balanced: 'balanced and clear',
    Professional: 'formal and polished',
    Concise: 'short and direct',
  }

  const baseTexts = [
    `Here's a ${strategyModifiers[strategy]} version that addresses your request: "${prompt}". The revised text maintains the original intent while improving clarity and flow for the target audience.`,
    `Reworked with a ${strategyModifiers[strategy]} approach based on "${prompt}". This alternative emphasizes the key points more effectively and removes any unnecessary complexity from the original draft.`,
    `A ${strategyModifiers[strategy]} rewrite responding to "${prompt}". This version restructures the content for better readability while preserving all essential information and maintaining the original tone where appropriate.`,
  ]

  return baseTexts.map((text, i) => ({
    id: `suggestion-${Date.now()}-${i}`,
    label: `Candidate ${String.fromCharCode(65 + i)}`,
    text,
  }))
}

export default function AiEditorDemo() {
  const [paragraphs, setParagraphs] = useState(initialParagraphs)
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleOpen = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const handleSave = useCallback((id: string, text: string) => {
    setParagraphs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, text } : p))
    )
  }, [])

  const handleClose = useCallback((_id: string) => {
    setActiveId(null)
  }, [])

  const handleGenerate = useCallback(
    async (prompt: string, strategy: AiStrategy): Promise<Suggestion[]> => {
      return mockGenerate(prompt, strategy)
    },
    []
  )

  return (
    <div className="min-h-screen bg-[var(--bg)] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-medium text-[var(--text-h)] mb-3">
            AI Inline Editor
          </h1>
          <p className="text-[var(--text)] text-base max-w-lg mx-auto">
            Hover over any paragraph to edit. Click the pencil icon or the text
            itself to open the AI-powered inline editor.
          </p>
        </div>

        {/* Paragraphs */}
        <div className="flex flex-col gap-8">
          {paragraphs.map((p, i) => (
            <div key={p.id}>
              {i === 0 ? (
                <h2 className="text-2xl font-medium text-[var(--text-h)] mb-2">
                  <EditableParagraph
                    id={p.id}
                    value={p.text}
                    active={activeId === p.id}
                    onOpen={handleOpen}
                    onSave={handleSave}
                    onClose={handleClose}
                    onGenerate={handleGenerate}
                  />
                </h2>
              ) : (
                <EditableParagraph
                  id={p.id}
                  value={p.text}
                  active={activeId === p.id}
                  onOpen={handleOpen}
                  onSave={handleSave}
                  onClose={handleClose}
                  onGenerate={handleGenerate}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-16 pt-6 border-t border-[var(--border)] text-center">
          <p className="text-sm text-[var(--text)]/60">
            Click outside the editor to auto-save. Only one editor can be open
            at a time.
          </p>
        </div>
      </div>
    </div>
  )
}
