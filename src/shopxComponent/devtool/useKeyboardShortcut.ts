import { useEffect } from 'react'

interface UseKeyboardShortcutOptions {
  onToggle: () => void
  onClose: () => void
}

export default function useKeyboardShortcut({ onToggle, onClose }: UseKeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      const isToggle = e.key === 'T' && e.shiftKey && !e.altKey &&
        ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey))

      if (isToggle) {
        e.preventDefault()
        onToggle()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggle, onClose])
}
