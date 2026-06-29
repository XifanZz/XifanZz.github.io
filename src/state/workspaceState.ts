import { LIBRARIES } from '../data/anime'
import { LIBRARY_IDS, type LibraryId, type WorkspaceState } from '../types'
import { WORKSPACE_VERSION } from '../constants'
import { createInitialState, mergeCatalog, restoreState } from './tierState'

export function createWorkspaceState(legacySerialized: string | null = null): WorkspaceState {
  const rankings = Object.fromEntries(
    LIBRARIES.map((library) => [
      library.id,
      library.id === 'shared'
        ? restoreState(legacySerialized, library.animeIds)
        : createInitialState(library.animeIds),
    ]),
  ) as WorkspaceState['rankings']

  return {
    version: WORKSPACE_VERSION,
    activeLibraryId: 'shared',
    rankings,
  }
}

function isLibraryId(value: unknown): value is LibraryId {
  return typeof value === 'string' && (LIBRARY_IDS as readonly string[]).includes(value)
}

export function restoreWorkspace(
  serialized: string | null,
  legacySerialized: string | null = null,
): WorkspaceState {
  if (!serialized) return createWorkspaceState(legacySerialized)

  try {
    const candidate = JSON.parse(serialized) as {
      activeLibraryId?: unknown
      rankings?: Record<string, unknown>
    }
    const base = createWorkspaceState(legacySerialized)
    const rankings = { ...base.rankings }

    for (const library of LIBRARIES) {
      rankings[library.id] = mergeCatalog(candidate.rankings?.[library.id], library.animeIds)
    }

    return {
      version: WORKSPACE_VERSION,
      activeLibraryId: isLibraryId(candidate.activeLibraryId) ? candidate.activeLibraryId : 'shared',
      rankings,
    }
  } catch {
    return createWorkspaceState(legacySerialized)
  }
}
