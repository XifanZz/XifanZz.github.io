import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { ANIME_BY_ID } from '../data/anime'
import type { AnimeId, TierDefinition } from '../types'
import { AnimeCard } from './AnimeCard'

interface TierRowProps {
  tier: TierDefinition
  animeIds: AnimeId[]
  highlighted: boolean
}

export function TierRow({ tier, animeIds, highlighted }: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: tier.id })

  return (
    <section
      className={`tier-row${highlighted || isOver ? ' tier-row--over' : ''}`}
      data-testid={`tier-${tier.id}`}
      style={{ '--tier-color': tier.color } as React.CSSProperties}
    >
      <header className="tier-label">
        <strong>{tier.label}</strong>
        <span>{tier.kicker}</span>
        <em>{animeIds.length}</em>
      </header>
      <div ref={setNodeRef} className="tier-dropzone">
        <SortableContext items={animeIds} strategy={rectSortingStrategy}>
          {animeIds.map((id) => {
            const anime = ANIME_BY_ID.get(id)
            return anime ? <AnimeCard key={id} anime={anime} containerId={tier.id} variant="tier" /> : null
          })}
        </SortableContext>
        {animeIds.length === 0 && <p className="drop-placeholder">拖一部番到这里</p>}
      </div>
    </section>
  )
}
