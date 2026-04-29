import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import useKeyboardShortcut from '../useKeyboardShortcut'

describe('useKeyboardShortcut', () => {
  const onToggle = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    onToggle.mockClear()
    onClose.mockClear()
  })

  it('calls onToggle when Ctrl+Shift+T is pressed', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'T',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1)
  })

  it('calls onToggle when Meta+Shift+T is pressed (Mac)', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'T',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1)
  })

  it('does not call onToggle for Ctrl+Meta+Shift+T (mixed modifiers)', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'T',
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)

    expect(onToggle).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('does not call onToggle for plain T key', () => {
    renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    const event = new KeyboardEvent('keydown', {
      key: 'T',
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onToggle).not.toHaveBeenCalled()
  })

  it('does not call handlers after unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcut({ onToggle, onClose }))

    unmount()

    const toggleEvent = new KeyboardEvent('keydown', {
      key: 'T',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    })
    window.dispatchEvent(toggleEvent)

    const closeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    window.dispatchEvent(closeEvent)

    expect(onToggle).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
