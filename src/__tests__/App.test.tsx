import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the component demos', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Button 组件演示' })).toBeInTheDocument()
  })
})
