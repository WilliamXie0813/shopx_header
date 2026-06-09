import { describe, it, expect, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Title, Text, Paragraph, Link } from '@/components/ui/typography'

const mockWriteText = navigator.clipboard.writeText as ReturnType<typeof vi.fn>

describe('Title', () => {
  it('renders h1 by default', () => {
    render(<Title>Hello World</Title>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Hello World')
  })

  it('renders h1-h5 based on level prop', () => {
    for (let level = 1; level <= 5; level++) {
      const { rerender } = render(<Title level={level as 1 | 2 | 3 | 4 | 5}>Title</Title>)
      expect(screen.getByRole('heading', { level })).toBeInTheDocument()
      rerender(<></>)
    }
  })

  it('applies correct size classes for level 1', () => {
    render(<Title level={1}>Title</Title>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-5xl', 'font-medium')
  })

  it('merges custom className', () => {
    render(<Title className="custom-class">Title</Title>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('custom-class')
  })
})

describe('Text', () => {
  it('renders children', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies danger type class', () => {
    render(<Text type="danger">Danger</Text>)
    expect(screen.getByText('Danger')).toHaveClass('text-red-500')
  })

  it('applies success type class', () => {
    render(<Text type="success">Success</Text>)
    expect(screen.getByText('Success')).toHaveClass('text-green-600')
  })

  it('applies warning type class', () => {
    render(<Text type="warning">Warning</Text>)
    expect(screen.getByText('Warning')).toHaveClass('text-amber-500')
  })

  it('applies secondary type class', () => {
    render(<Text type="secondary">Secondary</Text>)
    expect(screen.getByText('Secondary')).toHaveClass('text-muted-foreground')
  })

  it('applies muted type class', () => {
    render(<Text type="muted">Muted</Text>)
    expect(screen.getByText('Muted')).toHaveClass('text-gray-400')
  })

  it('renders mark with highlight background', () => {
    render(<Text mark>Marked</Text>)
    const mark = screen.getByText('Marked')
    expect(mark.tagName).toBe('MARK')
    expect(mark).toHaveClass('bg-yellow-200/50', 'px-1', 'rounded')
  })

  it('renders code with mono font', () => {
    render(<Text code>Code</Text>)
    const code = screen.getByText('Code')
    expect(code.tagName).toBe('CODE')
    expect(code).toHaveClass('font-mono', 'text-sm', 'bg-muted', 'rounded')
  })

  it('renders keyboard style', () => {
    render(<Text keyboard>Kbd</Text>)
    const kbd = screen.getByText('Kbd')
    expect(kbd.tagName).toBe('KBD')
    expect(kbd).toHaveClass('font-mono', 'text-xs', 'border', 'rounded', 'shadow-sm')
  })

  it('renders underline', () => {
    render(<Text underline>Underlined</Text>)
    expect(screen.getByText('Underlined').tagName).toBe('U')
  })

  it('renders delete', () => {
    render(<Text delete>Deleted</Text>)
    expect(screen.getByText('Deleted').tagName).toBe('DEL')
  })

  it('renders strong', () => {
    render(<Text strong>Bold</Text>)
    expect(screen.getByText('Bold').tagName).toBe('STRONG')
  })

  it('renders italic', () => {
    render(<Text italic>Italic</Text>)
    expect(screen.getByText('Italic').tagName).toBe('EM')
  })

  it('merges custom className', () => {
    render(<Text className="custom-class">Text</Text>)
    expect(screen.getByText('Text')).toHaveClass('custom-class')
  })
})

describe('Copyable', () => {
  beforeEach(() => {
    mockWriteText.mockClear()
  })

  it('copies text when copy button clicked', async () => {
    render(<Text copyable>Hello</Text>)

    const copyButton = screen.getByLabelText('复制')
    await userEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('Hello')
  })

  it('copies custom text from config', async () => {
    render(<Text copyable={{ text: 'Custom' }}>Hello</Text>)

    const copyButton = screen.getByLabelText('复制')
    await userEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('Custom')
  })

  it('calls onCopy callback after copy', async () => {
    const onCopy = vi.fn()
    render(<Text copyable={{ onCopy }}>Hello</Text>)

    const copyButton = screen.getByLabelText('复制')
    await userEvent.click(copyButton)

    await vi.waitFor(() => expect(onCopy).toHaveBeenCalled())
  })
})

describe('Editable', () => {
  it('enters edit mode when edit button clicked', async () => {
    const user = userEvent.setup()
    render(<Text editable>Hello</Text>)

    const editButton = screen.getByLabelText('编辑')
    await user.click(editButton)

    expect(screen.getByRole('textbox')).toHaveValue('Hello')
  })

  it('saves on Enter key', async () => {
    const user = userEvent.setup()
    const onEnd = vi.fn()
    render(<Text editable={{ onEnd }}>Hello</Text>)

    await user.click(screen.getByLabelText('编辑'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'World')
    await user.keyboard('{Enter}')

    expect(screen.getByText('World')).toBeInTheDocument()
    expect(onEnd).toHaveBeenCalled()
  })

  it('cancels on Escape key', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<Text editable={{ onCancel }}>Hello</Text>)

    await user.click(screen.getByLabelText('编辑'))
    const input = screen.getByRole('textbox')
    await user.type(input, 'World')
    await user.keyboard('{Escape}')

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Text editable={{ onChange }}>Hello</Text>)

    await user.click(screen.getByLabelText('编辑'))
    await user.type(screen.getByRole('textbox'), 'W')

    expect(onChange).toHaveBeenLastCalledWith('HelloW')
  })

  it('calls onStart when entering edit mode', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<Text editable={{ onStart }}>Hello</Text>)

    await user.click(screen.getByLabelText('编辑'))
    expect(onStart).toHaveBeenCalled()
  })
})

describe('Ellipsis', () => {
  it('applies line-clamp-1 by default', () => {
    render(<Text ellipsis>Long text</Text>)
    expect(screen.getByText('Long text')).toHaveClass('line-clamp-1')
  })

  it('applies custom rows', () => {
    render(<Text ellipsis={{ rows: 3 }}>Long text</Text>)
    expect(screen.getByText('Long text')).toHaveClass('line-clamp-3')
  })

  it('shows expand button when expandable', async () => {
    const user = userEvent.setup()
    render(<Text ellipsis={{ expandable: true }}>Long text</Text>)

    const expandButton = screen.getByText('展开')
    await user.click(expandButton)

    expect(screen.getByText('收起')).toBeInTheDocument()
  })

  it('calls onExpand callback', async () => {
    const user = userEvent.setup()
    const onExpand = vi.fn()
    render(<Text ellipsis={{ expandable: true, onExpand }}>Long text</Text>)

    await user.click(screen.getByText('展开'))
    expect(onExpand).toHaveBeenCalled()
  })
})

describe('Paragraph', () => {
  beforeEach(() => {
    mockWriteText.mockClear()
    cleanup()
  })

  it('renders p tag', () => {
    const { container } = render(<Paragraph>Content</Paragraph>)
    expect(container.querySelector('p')).toHaveTextContent('Content')
  })

  it('applies paragraph spacing', () => {
    const { container } = render(<Paragraph>Content</Paragraph>)
    expect(container.querySelector('p')).toHaveClass('leading-relaxed', 'mb-4')
  })

  it('applies type color', () => {
    render(<Paragraph type="danger">Danger</Paragraph>)
    expect(screen.getByText('Danger')).toHaveClass('text-red-500')
  })

  it('supports copyable', async () => {
    render(<Paragraph copyable>Hello</Paragraph>)

    const copyButton = screen.getByLabelText('复制')
    await userEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('Hello')
  })

  it('supports editable', async () => {
    const user = userEvent.setup()
    render(<Paragraph editable>Hello</Paragraph>)

    await user.click(screen.getByLabelText('编辑'))
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
  })
})

describe('Link', () => {
  beforeEach(() => {
    mockWriteText.mockClear()
    cleanup()
  })

  it('renders a tag with href', () => {
    render(<Link href="https://example.com">Click</Link>)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })

  it('applies link styling', () => {
    render(<Link href="https://example.com">Click</Link>)
    expect(screen.getByRole('link')).toHaveClass('text-primary', 'hover:underline')
  })

  it('supports target prop', () => {
    render(<Link href="https://example.com" target="_blank">Click</Link>)
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
  })

  it('supports copyable', async () => {
    render(<Link href="https://example.com" copyable>Click</Link>)

    const copyButton = screen.getByLabelText('复制')
    await userEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('Click')
  })
})
