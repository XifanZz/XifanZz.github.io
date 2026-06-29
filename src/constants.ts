import type { TierDefinition } from './types'

export const LEGACY_STORAGE_KEY = 'anime-tier-list:v1'
export const STORAGE_KEY = 'anime-tier-list:v2'
export const STATE_VERSION = 1
export const WORKSPACE_VERSION = 2

export const TIERS: TierDefinition[] = [
  { id: 'epic', label: '夯', kicker: '毫无疑问', color: '#ff5b54' },
  { id: 'top', label: '顶级', kicker: '强得离谱', color: '#ff963d' },
  { id: 'elite', label: '人上人', kicker: '值得一看', color: '#f4c84b' },
  { id: 'npc', label: 'NPC', kicker: '中规中矩', color: '#79c88c' },
  { id: 'bad', label: '拉完了', kicker: '难绷', color: '#679edb' },
  { id: 'indifferent', label: '无关心', kicker: '没有感觉', color: '#9a8cc4' },
]
