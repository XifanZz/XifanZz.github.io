export const TIER_IDS = ['epic', 'top', 'elite', 'npc', 'bad', 'indifferent'] as const
export const CONTAINER_IDS = [...TIER_IDS, 'unassigned'] as const
export const LIBRARY_IDS = ['shared', 'year2025'] as const

export type TierId = (typeof TIER_IDS)[number]
export type ContainerId = (typeof CONTAINER_IDS)[number]
export type AnimeId = string
export type LibraryId = (typeof LIBRARY_IDS)[number]

export interface Anime {
  id: AnimeId
  title: string
  year: number
  bangumiSubjectId: number
  poster: string
  sourceUrl: string
}

export interface TierDefinition {
  id: TierId
  label: string
  kicker: string
  color: string
}

export interface TierState {
  version: number
  containers: Record<ContainerId, AnimeId[]>
}

export interface AnimeLibrary {
  id: LibraryId
  label: string
  description: string
  animeIds: AnimeId[]
}

export interface WorkspaceState {
  version: number
  activeLibraryId: LibraryId
  rankings: Record<LibraryId, TierState>
}
