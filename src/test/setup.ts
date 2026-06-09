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
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
})
