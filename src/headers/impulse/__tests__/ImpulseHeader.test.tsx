import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ImpulseHeader from '../ImpulseHeader'

describe('ImpulseHeader', () => {
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

  it('renders promo banner and main header', () => {
    render(<ImpulseHeader {...defaultProps} />)

    expect(screen.getByTestId('promo-banner')).toBeInTheDocument()
    expect(screen.getByTestId('main-header')).toBeInTheDocument()
    expect(screen.getByText('⚡ LIMITED TIME: 50% OFF EVERYTHING — ENDS IN 02:14:33')).toBeInTheDocument()
  })

  it('shows navigation items', () => {
    render(<ImpulseHeader {...defaultProps} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })

  it('renders logo', () => {
    render(<ImpulseHeader {...defaultProps} />)

    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })
})
