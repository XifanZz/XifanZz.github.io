import type { TierDefinition } from './types'

export const LEGACY_STORAGE_KEY = 'anime-tier-list:v1'
export const STORAGE_KEY = 'anime-tier-list:v2'
export const STATE_VERSION = 1
export const WORKSPACE_VERSION = 2

export const TIERS: TierDefinition[] = [
  { id: 'epic', label: '夯', color: '#ff5b54' },
  { id: 'top', label: '顶级', color: '#ff963d' },
  { id: 'elite', label: '人上人', color: '#f4c84b' },
  { id: 'npc', label: 'NPC', color: '#79c88c' },
  { id: 'bad', label: '拉完了', color: '#679edb' },
  { id: 'indifferent', label: '无关心', color: '#9a8cc4' },
]
