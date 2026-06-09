import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Polyfill ResizeObserver for Radix UI / shadcn Tooltip in tests
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.assign(globalThis, { ResizeObserver: ResizeObserverMock })

// Mock navigator.clipboard for copyable tests
const mockWriteText = vi.fn().mockResolvedValue(undefined)

function setupClipboardMock() {
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  })
}

setupClipboardMock()

// Restore our mock after each test (user-event may replace it with its own stub)
afterEach(() => {
  setupClipboardMock()
})
