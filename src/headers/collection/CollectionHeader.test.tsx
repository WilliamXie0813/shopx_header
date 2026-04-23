import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CollectionHeader from './CollectionHeader'

describe('CollectionHeader', () => {
  const defaultProps = {
    logo: <span data-testid="logo">Atelier</span>,
    menuItems: [
      { label: 'Journal', href: '/journal' },
      { label: 'Collections', href: '/collections' },
      {
        label: 'Shop',
        href: '/shop',
        children: [
          { label: 'New Arrivals', href: '/shop/new' },
          { label: 'Editions', href: '/shop/editions' },
          { label: 'Objects', href: '/shop/objects' },
        ],
      },
    ],
  }

  it('renders logo and navigation items', () => {
    render(<CollectionHeader {...defaultProps} />)

    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByText('Journal')).toBeInTheDocument()
    expect(screen.getByText('Collections')).toBeInTheDocument()
    expect(screen.getByText('Shop')).toBeInTheDocument()
  })

  it('logo uses serif font family', () => {
    const { container } = render(<CollectionHeader {...defaultProps} />)

    const logoLink = container.querySelector('a[href="/"]')
    expect(logoLink).toHaveStyle({ fontFamily: "'Cormorant Garamond', Georgia, serif" })
  })

  it('dropdown is not visible initially', () => {
    render(<CollectionHeader {...defaultProps} />)

    expect(screen.queryByText('New Arrivals')).not.toBeInTheDocument()
    expect(screen.queryByText('Editions')).not.toBeInTheDocument()
    expect(screen.queryByText('Objects')).not.toBeInTheDocument()
  })
})
