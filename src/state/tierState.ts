import { CONTAINER_IDS, type AnimeId, type ContainerId, type TierState } from '../types'
import { STATE_VERSION } from '../constants'

const emptyContainers = (): TierState['containers'] => ({
  epic: [],
  top: [],
  elite: [],
  npc: [],
  bad: [],
  indifferent: [],
  unassigned: [],
})

export function createInitialState(animeIds: AnimeId[]): TierState {
  return {
    version: STATE_VERSION,
    containers: { ...emptyContainers(), unassigned: [...animeIds] },
  }
}

export function findContainer(state: TierState, animeId: AnimeId): ContainerId | null {
  return CONTAINER_IDS.find((id) => state.containers[id].includes(animeId)) ?? null
}

export function moveAnime(
  state: TierState,
  animeId: AnimeId,
  targetContainer: ContainerId,
  targetIndex?: number,
): TierState {
  const sourceContainer = findContainer(state, animeId)
  if (!sourceContainer) return state

  const containers = Object.fromEntries(
    CONTAINER_IDS.map((id) => [id, state.containers[id].filter((id) => id !== animeId)]),
  ) as TierState['containers']

  const destination = containers[targetContainer]
  const safeIndex = Math.max(0, Math.min(targetIndex ?? destination.length, destination.length))
  destination.splice(safeIndex, 0, animeId)

  return { version: STATE_VERSION, containers }
}

export function mergeCatalog(candidate: unknown, animeIds: AnimeId[]): TierState {
  const validIds = new Set(animeIds)
  const seen = new Set<AnimeId>()
  const containers = emptyContainers()

  if (candidate && typeof candidate === 'object' && 'containers' in candidate) {
    const rawContainers = (candidate as { containers?: unknown }).containers
    if (rawContainers && typeof rawContainers === 'object') {
      for (const containerId of CONTAINER_IDS) {
        const raw = (rawContainers as Record<string, unknown>)[containerId]
        if (!Array.isArray(raw)) continue
        for (const id of raw) {
          if (typeof id === 'string' && validIds.has(id) && !seen.has(id)) {
            containers[containerId].push(id)
            seen.add(id)
          }
        }
      }
    }
  }

  for (const id of animeIds) {
    if (!seen.has(id)) containers.unassigned.push(id)
  }

  return { version: STATE_VERSION, containers }
}

export function restoreState(serialized: string | null, animeIds: AnimeId[]): TierState {
  if (!serialized) return createInitialState(animeIds)
  try {
    return mergeCatalog(JSON.parse(serialized) as unknown, animeIds)
  } catch {
    return createInitialState(animeIds)
  }
}
