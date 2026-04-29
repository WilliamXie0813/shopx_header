import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeDevToolPanel from '../ThemeDevToolPanel'
import ThemeDevToolProvider from '../ThemeDevToolProvider'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

describe('ThemeDevToolPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders panel when toggled open', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    expect(screen.getByText(/theme devtool/i)).toBeInTheDocument()
    expect(screen.getByText('Colors')).toBeInTheDocument()
  })

  it('closes when close button is clicked', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)

    expect(screen.queryByText(/theme devtool/i)).not.toBeInTheDocument()
  })

  it('shows platform-aware shortcut hint', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    const isMac = navigator.platform.toLowerCase().includes('mac')
    const expectedHint = isMac ? '⌘⇧T' : 'Ctrl+Shift+T'
    expect(screen.getByText(expectedHint)).toBeInTheDocument()
  })

  it('defaults initialOpen to false and does not show panel', () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel />
      </ThemeDevToolProvider>
    )

    expect(screen.queryByText(/theme devtool/i)).not.toBeInTheDocument()
  })

  it('exports theme as JSON when export JSON is clicked', async () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    const exportBtn = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportBtn)

    const jsonOption = screen.getByRole('button', { name: /json/i })
    fireEvent.click(jsonOption)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    const writtenText = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(() => JSON.parse(writtenText)).not.toThrow()
  })

  it('exports theme as TypeScript when export TS is clicked', async () => {
    render(
      <ThemeDevToolProvider>
        <ThemeDevToolPanel initialOpen />
      </ThemeDevToolProvider>
    )

    const exportBtn = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportBtn)

    const tsOption = screen.getByRole('button', { name: /typescript/i })
    fireEvent.click(tsOption)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    const writtenText = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(writtenText).toContain('colors:')
    expect(writtenText).toContain('typography:')
  })
})
