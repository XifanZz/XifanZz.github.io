import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { LEGACY_STORAGE_KEY, STORAGE_KEY, TIERS } from './constants'

describe('App', () => {
  beforeEach(() => localStorage.clear())

  it('renders all six tiers and 49 unassigned anime', () => {
    render(<App />)

    for (const tier of TIERS) {
      expect(within(screen.getByTestId(`tier-${tier.id}`)).getByText(tier.label)).toBeInTheDocument()
    }
    expect(screen.getByTestId('unassigned-count')).toHaveTextContent('49')
    expect(screen.getAllByTestId(/^anime-card-/)).toHaveLength(49)
    expect(screen.getByRole('tab', { name: /共同看过的番/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to the 16-title 2025 library', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: /2025新番/ }))

    expect(screen.getByTestId('unassigned-count')).toHaveTextContent('16')
    expect(screen.getAllByTestId(/^anime-card-/)).toHaveLength(16)
    expect(screen.getByRole('tab', { name: /2025新番/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('2025', { selector: '.year-heading h3' })).toBeInTheDocument()
    expect(screen.queryByText('2024', { selector: '.year-heading h3' })).not.toBeInTheDocument()
  })

  it('asks for confirmation before reset', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /重置排行/ }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认重置' })).toBeInTheDocument()
  })

  it('restores a saved ranking', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 2,
      activeLibraryId: 'shared',
      rankings: {
        shared: { containers: { epic: ['bgm-1014'], unassigned: [] } },
        year2025: { containers: {} },
      },
    }))
    render(<App />)

    expect(within(screen.getByTestId('tier-epic')).getByText('魔法禁书目录')).toBeInTheDocument()
    expect(screen.getByTestId('unassigned-count')).toHaveTextContent('48')
  })

  it('migrates the previous single-library save into the shared library', () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
      version: 1,
      containers: { top: ['bgm-1014'], unassigned: [] },
    }))
    render(<App />)

    expect(within(screen.getByTestId('tier-top')).getByText('魔法禁书目录')).toBeInTheDocument()
  })
})
