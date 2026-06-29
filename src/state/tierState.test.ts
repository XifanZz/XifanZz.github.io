import { describe, expect, it } from 'vitest'
import { createInitialState, mergeCatalog, moveAnime, restoreState } from './tierState'

const ids = ['a', 'b', 'c', 'd']

describe('tier state', () => {
  it('starts with every anime unassigned', () => {
    const state = createInitialState(ids)
    expect(state.containers.unassigned).toEqual(ids)
    expect(state.containers.epic).toEqual([])
  })

  it('moves anime across containers without duplication', () => {
    let state = createInitialState(ids)
    state = moveAnime(state, 'b', 'epic')
    state = moveAnime(state, 'b', 'top')

    expect(state.containers.epic).toEqual([])
    expect(state.containers.top).toEqual(['b'])
    expect(Object.values(state.containers).flat().filter((id) => id === 'b')).toHaveLength(1)
  })

  it('reorders within a tier', () => {
    let state = createInitialState(ids)
    state = moveAnime(state, 'a', 'elite')
    state = moveAnime(state, 'b', 'elite')
    state = moveAnime(state, 'c', 'elite')
    state = moveAnime(state, 'a', 'elite', 2)

    expect(state.containers.elite).toEqual(['b', 'c', 'a'])
  })

  it('moves anime back to unassigned', () => {
    let state = moveAnime(createInitialState(ids), 'a', 'bad')
    state = moveAnime(state, 'a', 'unassigned', 1)
    expect(state.containers.bad).toEqual([])
    expect(state.containers.unassigned).toEqual(['b', 'a', 'c', 'd'])
  })

  it('drops unknown and duplicate ids and appends new catalog entries', () => {
    const state = mergeCatalog({
      containers: {
        epic: ['a', 'a', 'removed'],
        top: ['b'],
        unassigned: ['b', 'c'],
      },
    }, ids)

    expect(state.containers.epic).toEqual(['a'])
    expect(state.containers.top).toEqual(['b'])
    expect(state.containers.unassigned).toEqual(['c', 'd'])
  })

  it('recovers from corrupt saved data', () => {
    expect(restoreState('{broken', ids)).toEqual(createInitialState(ids))
  })
})
