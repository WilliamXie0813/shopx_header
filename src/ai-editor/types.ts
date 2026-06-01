export type EditorState =
  | 'idle'
  | 'editing'
  | 'generating'
  | 'generated'
  | 'saving'
  | 'error'

export interface Suggestion {
  id: string
  label: string
  text: string
}

export type AiStrategy = 'Balanced' | 'Professional' | 'Concise'

export interface InlineAiEditorProps {
  value: string
  onSave: (text: string) => void
  onGenerate: (prompt: string, strategy: AiStrategy) => Promise<Suggestion[]>
  onClose: () => void
}

export interface EditableParagraphProps {
  id: string
  value: string
  active: boolean
  onOpen: (id: string) => void
  onSave: (id: string, text: string) => void
  onClose: (id: string) => void
  onGenerate: (prompt: string, strategy: AiStrategy) => Promise<Suggestion[]>
}
