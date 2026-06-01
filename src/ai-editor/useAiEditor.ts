import { useState, useCallback, useRef, useEffect } from 'react'
import type { EditorState, Suggestion, AiStrategy, InlineAiEditorProps } from './types'

export function useAiEditor({ value, onSave, onGenerate, onClose }: InlineAiEditorProps) {
  const [text, setText] = useState(value)
  const [prompt, setPrompt] = useState('')
  const [strategy, setStrategy] = useState<AiStrategy>('Balanced')
  const [state, setState] = useState<EditorState>('editing')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setText(value)
  }, [value])

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        if (state !== 'saving') {
          setState('saving')
          onSave(text)
          setTimeout(() => {
            onClose()
          }, 500)
        }
      }
    },
    [state, text, onSave, onClose]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  // Escape key to save and close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state !== 'saving') {
        setState('saving')
        onSave(text)
        setTimeout(() => {
          onClose()
        }, 500)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state, text, onSave, onClose])

  const handleGenerate = useCallback(async () => {
    setState('generating')
    setError(null)
    try {
      const results = await onGenerate(prompt.trim(), strategy)
      setSuggestions(results)
      setState('generated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      setState('error')
    }
  }, [prompt, strategy, onGenerate])

  const handleApply = useCallback((suggestion: Suggestion) => {
    setText(suggestion.text)
    setSuggestions([])
    setState('editing')
  }, [])

  const handleRetry = useCallback(() => {
    setState('editing')
    setError(null)
  }, [])

  const handleSave = useCallback(() => {
    if (state === 'saving') return
    setState('saving')
    onSave(text)
    setTimeout(() => {
      onClose()
    }, 500)
  }, [state, text, onSave, onClose])

  return {
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
    handleSave,
  }
}
