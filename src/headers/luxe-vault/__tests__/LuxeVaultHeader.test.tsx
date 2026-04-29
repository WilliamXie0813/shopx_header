import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LuxeVaultHeader from '../LuxeVaultHeader'

describe('LuxeVaultHeader', () => {
  const defaultProps = {
    logo: <span data-testid="logo">LUXE VAULT</span>,
    menuItems: [
      { label: 'Collections', href: '/collections' },
      { label: 'Atelier', href: '/atelier' },
      {
        label: 'Maison',
        href: '/maison',
        children: [
          { label: 'Heritage', href: '/heritage', description: 'Timeless traditions' },
          { label: 'Craft', href: '/craft', description: 'Artisanal mastery' },
          { label: 'Journal', href: '/journal', description: 'Stories untold' },
        ],
      },
      { label: 'Contact', href: '/contact' },
    ],
  }

  it('renders logo and thin uppercase nav', () => {
    render(<LuxeVaultHeader {...defaultProps} />)

    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByText('Collections')).toBeInTheDocument()
    expect(screen.getByText('Atelier')).toBeInTheDocument()
    expect(screen.getByText('Maison')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('applies dark background', () => {
    const { container } = render(
      <LuxeVaultHeader
        {...defaultProps}
        headerBg="#0a0a0a"
        headerText="#f5f3ef"
      />
    )

    const header = container.querySelector('header')
    expect(header).toHaveStyle({ backgroundColor: '#0a0a0a' })
    expect(header).toHaveStyle({ color: '#f5f3ef' })
  })

  it('shows dropdown when hovering over item with children', () => {
    render(<LuxeVaultHeader {...defaultProps} />)

    const maisonLink = screen.getByText('Maison')
    expect(maisonLink).toBeInTheDocument()

    // Dropdown should not be visible initially
    expect(screen.queryByText('Heritage')).not.toBeInTheDocument()

    // Hover over Maison to show dropdown
    fireEvent.mouseEnter(maisonLink.closest('div')!)

    expect(screen.getByText('Heritage')).toBeInTheDocument()
    expect(screen.getByText('Craft')).toBeInTheDocument()
    expect(screen.getByText('Journal')).toBeInTheDocument()
  })

  it('opens search overlay when search icon is clicked', () => {
    const onSearch = vi.fn()
    render(<LuxeVaultHeader {...defaultProps} onSearch={onSearch} />)

    const searchBtn = screen.getByTestId('luxe-search-btn')
    fireEvent.click(searchBtn)

    expect(screen.getByTestId('luxe-search-input')).toBeInTheDocument()
  })

  it('shows gold cart dot when cartCount > 0', () => {
    render(<LuxeVaultHeader {...defaultProps} cartCount={2} />)

    expect(screen.getByTestId('luxe-cart-dot')).toBeInTheDocument()
  })
})
