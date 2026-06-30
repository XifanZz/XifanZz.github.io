import catalog from './anime.json'
import type { Anime, AnimeLibrary } from '../types'

export const ANIME = catalog as Anime[]
export const ANIME_IDS = ANIME.map((anime) => anime.id)
export const ANIME_BY_ID = new Map(ANIME.map((anime) => [anime.id, anime]))
export const CATALOG_YEARS = [...new Set(ANIME.map((anime) => anime.year))].sort((a, b) => a - b)

export const LIBRARIES: AnimeLibrary[] = [
  {
    id: 'shared',
    label: '共同看过的番',
    description: '完整片单 · 2008—2026',
    animeIds: ANIME_IDS,
  },
  {
    id: 'year2025',
    label: '2025新番',
    description: '年度片单 · 仅含 2025',
    animeIds: ANIME.filter((anime) => anime.year === 2025).map((anime) => anime.id),
  },
]

export const LIBRARY_BY_ID = new Map(LIBRARIES.map((library) => [library.id, library]))
