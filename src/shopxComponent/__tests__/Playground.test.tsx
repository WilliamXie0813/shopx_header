import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Playground from '../Playground'

vi.mock('../headers', () => ({
  CenteredHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">CenteredHeader-{config.variant}</div>
  ),
  FloatingHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">FloatingHeader-{config.variant}</div>
  ),
  LuxeValutHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">LuxeValutHeader-{config.variant}</div>
  ),
  MegaHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">MegaHeader-{config.variant}</div>
  ),
  MarketplaceHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">MarketplaceHeader-{config.variant}</div>
  ),
  StickyCompactHeader: ({ config }: { config: { variant: string } }) => (
    <div data-testid="header">StickyCompactHeader-{config.variant}</div>
  ),
}))

describe('Playground', () => {
  it('renders all variant buttons', () => {
    render(<Playground />)

    expect(screen.getByRole('button', { name: 'Centered' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Floating' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'LuxeVault' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mega' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marketplace' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sticky' })).toBeInTheDocument()
  })

  it('shows CenteredHeader by default', () => {
    render(<Playground />)

    expect(screen.getByTestId('header')).toHaveTextContent('CenteredHeader')
  })

  it('switches header variant when button is clicked', () => {
    render(<Playground />)

    const floatingBtn = screen.getByRole('button', { name: 'Floating' })
    fireEvent.click(floatingBtn)

    expect(screen.getByTestId('header')).toHaveTextContent('FloatingHeader')
  })
})
