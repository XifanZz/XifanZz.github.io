import { describe, expect, it } from 'vitest'
import { createWorkspaceState, restoreWorkspace } from './workspaceState'

describe('workspace state', () => {
  it('creates independent shared and 2025 rankings', () => {
    const workspace = createWorkspaceState()
    expect(workspace.rankings.shared.containers.unassigned).toHaveLength(49)
    expect(workspace.rankings.year2025.containers.unassigned).toHaveLength(16)
    expect(workspace.rankings.year2025.containers.unassigned).toEqual(
      expect.not.arrayContaining(['bgm-1014']),
    )
  })

  it('restores the selected library and sanitizes each catalog independently', () => {
    const workspace = restoreWorkspace(JSON.stringify({
      activeLibraryId: 'year2025',
      rankings: {
        shared: { containers: { epic: ['bgm-1014'] } },
        year2025: { containers: { epic: ['bgm-454684', 'bgm-1014'] } },
      },
    }))

    expect(workspace.activeLibraryId).toBe('year2025')
    expect(workspace.rankings.shared.containers.epic).toEqual(['bgm-1014'])
    expect(workspace.rankings.year2025.containers.epic).toEqual(['bgm-454684'])
  })
})
