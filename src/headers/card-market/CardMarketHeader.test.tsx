import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CardMarketHeader from './CardMarketHeader'

describe('CardMarketHeader', () => {
  const defaultProps = {
    logo: <span>CardMarket</span>,
    menuItems: [
      {
        label: 'PTCG',
        href: '/ptcg',
        icon: <svg data-testid="ptcg-icon" />,
      },
      {
        label: 'MTG',
        href: '/mtg',
        icon: <svg data-testid="mtg-icon" />,
      },
      {
        label: 'YGO',
        href: '/ygo',
        icon: <svg data-testid="ygo-icon" />,
      },
    ],
  }

  it('renders logo and game category nav', () => {
    render(<CardMarketHeader {...defaultProps} />)

    expect(screen.getByText('CardMarket')).toBeInTheDocument()
    expect(screen.getByText('PTCG')).toBeInTheDocument()
    expect(screen.getByText('MTG')).toBeInTheDocument()
    expect(screen.getByText('YGO')).toBeInTheDocument()
  })

  it('shows search input', () => {
    render(<CardMarketHeader {...defaultProps} />)

    expect(screen.getByPlaceholderText('Search cards, sets, sellers...')).toBeInTheDocument()
  })

  it('renders user avatar if provided', () => {
    render(<CardMarketHeader {...defaultProps} userAvatar="https://example.com/avatar.png" />)

    expect(screen.getByAltText('User avatar')).toBeInTheDocument()
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', 'https://example.com/avatar.png')
  })
})
