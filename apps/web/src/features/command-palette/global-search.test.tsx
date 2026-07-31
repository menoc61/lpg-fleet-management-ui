import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GlobalSearch } from './global-search'
import { useGlobalSearchStore } from './global-search-store'
import { useRoleStore } from '@/store/role-store'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

beforeEach(() => {
  useGlobalSearchStore.setState({ open: false })
  mockNavigate.mockClear()
})

describe('GlobalSearch', () => {
  it('does not render command dialog when closed', () => {
    const { container } = render(<GlobalSearch />)
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('renders command dialog when open', () => {
    useGlobalSearchStore.getState().setOpen(true)
    render(<GlobalSearch />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('has a search input with placeholder', () => {
    useGlobalSearchStore.getState().setOpen(true)
    render(<GlobalSearch />)
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
  })

  it('contains a Camions group with truck results', () => {
    useGlobalSearchStore.getState().setOpen(true)
    render(<GlobalSearch />)
    expect(screen.getByText(/CG/i)).toBeInTheDocument()
  })

  it('navigates to truck detail on truck selection', () => {
    useGlobalSearchStore.getState().setOpen(true)
    render(<GlobalSearch />)
    const firstTruck = screen.getByRole('option', { name: /CG/i })
    fireEvent.click(firstTruck)
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: expect.stringMatching(/\/trucks\//) })
    )
    expect(useGlobalSearchStore.getState().open).toBe(false)
  })

  it('responds to Ctrl+K by opening', () => {
    render(<GlobalSearch />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(useGlobalSearchStore.getState().open).toBe(true)
  })
})