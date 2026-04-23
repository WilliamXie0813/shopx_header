import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EssentialHeader from './EssentialHeader'

describe('EssentialHeader', () => {
  const defaultProps = {
    logo: <span data-testid="logo">Logo</span>,
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      {
        label: 'Services',
        href: '/services',
        children: [
          { label: 'Consulting', href: '/consulting' },
          { label: 'Support', href: '/support' },
        ],
      },
    ],
  }

  it('renders logo and navigation items', () => {
    render(<EssentialHeader {...defaultProps} />)

    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  it('applies custom headerBg and headerText via inline styles', () => {
    const { container } = render(
      <EssentialHeader
        {...defaultProps}
        headerBg="#111827"
        headerText="#f9fafb"
      />
    )

    const header = container.querySelector('header')
    expect(header).toHaveStyle({ backgroundColor: '#111827' })
    expect(header).toHaveStyle({ color: '#f9fafb' })
  })

  it('shows dropdown when hovering over item with children', () => {
    render(<EssentialHeader {...defaultProps} />)

    const servicesLink = screen.getByText('Services')
    expect(servicesLink).toBeInTheDocument()

    // Dropdown should not be visible initially
    expect(screen.queryByText('Consulting')).not.toBeInTheDocument()

    // Hover over Services to show dropdown
    fireEvent.mouseEnter(servicesLink.closest('li')!)

    expect(screen.getByText('Consulting')).toBeInTheDocument()
    expect(screen.getByText('Support')).toBeInTheDocument()
  })

  it('shows search input when onSearch is provided', () => {
    const onSearch = vi.fn()
    render(<EssentialHeader {...defaultProps} onSearch={onSearch} />)

    const input = screen.getByPlaceholderText('Search')
    expect(input).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'query' } })
    expect(onSearch).toHaveBeenCalledWith('query')
  })

  it('shows cart count when provided', () => {
    render(<EssentialHeader {...defaultProps} cartCount={3} />)

    expect(screen.getByText('Cart (3)')).toBeInTheDocument()
  })

  it('shows user avatar when provided', () => {
    render(
      <EssentialHeader {...defaultProps} userAvatar="https://example.com/avatar.png" />
    )

    const img = screen.getByAltText('Account')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png')
  })
})
