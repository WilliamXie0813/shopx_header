import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FashionHeader from '../FashionHeader'

describe('FashionHeader', () => {
  const defaultProps = {
    logo: <span data-testid="logo">VOGUE</span>,
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '/shop' },
      {
        label: 'Collections',
        href: '/collections',
        children: [
          { label: 'Spring', href: '/spring' },
          { label: 'Summer', href: '/summer' },
          { label: 'Fall', href: '/fall' },
          { label: 'Winter', href: '/winter' },
        ],
      },
    ],
  }

  it('renders logo and bold uppercase nav', () => {
    render(<FashionHeader {...defaultProps} />)

    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('Collections')).toBeInTheDocument()
  })

  it('applies dark background when specified', () => {
    const { container } = render(
      <FashionHeader
        {...defaultProps}
        headerBg="#0a0a0a"
        headerText="#ffffff"
      />
    )

    const header = container.querySelector('header')
    expect(header).toHaveStyle({ backgroundColor: '#0a0a0a' })
    expect(header).toHaveStyle({ color: '#ffffff' })
  })
})
