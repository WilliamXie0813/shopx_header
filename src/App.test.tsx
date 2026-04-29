import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./shopxComponent/Demo', () => ({
  default: () => <div data-testid="demo">Demo Content</div>,
}))

describe('App', () => {
  it('renders Demo component', () => {
    render(<App />)
    expect(screen.getByTestId('demo')).toBeInTheDocument()
  })
})
