import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { ANIME_BY_ID, CATALOG_YEARS } from '../data/anime'
import type { AnimeId } from '../types'
import { AnimeCard } from './AnimeCard'

interface UnassignedLibraryProps {
  animeIds: AnimeId[]
  highlighted: boolean
  libraryName: string
}

export function UnassignedLibrary({ animeIds, highlighted, libraryName }: UnassignedLibraryProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'unassigned' })

  return (
    <section
      ref={setNodeRef}
      className={`library-panel${highlighted || isOver ? ' library-panel--over' : ''}`}
      aria-labelledby="library-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE LIBRARY</span>
          <h2 id="library-title">未评级番剧 <small>· {libraryName}</small></h2>
          <p>拖动海报到上方，也可以从档位中拖回这里。</p>
        </div>
        <strong className="library-count" data-testid="unassigned-count">{animeIds.length}</strong>
      </div>

      <SortableContext items={animeIds} strategy={rectSortingStrategy}>
        <div className="year-groups">
          {CATALOG_YEARS.map((year) => {
            const yearIds = animeIds.filter((id) => ANIME_BY_ID.get(id)?.year === year)
            if (yearIds.length === 0) return null
            return (
              <section className="year-group" key={year}>
                <div className="year-heading">
                  <h3>{year}</h3>
                  <span>{yearIds.length} 部</span>
                </div>
                <div className="library-grid">
                  {yearIds.map((id) => {
                    const anime = ANIME_BY_ID.get(id)
                    return anime ? (
                      <AnimeCard key={id} anime={anime} containerId="unassigned" variant="library" />
                    ) : null
                  })}
                </div>
              </section>
            )
          })}
          {animeIds.length === 0 && (
            <div className="library-empty">
              <span>✓</span>
              <h3>全部排完了</h3>
              <p>很好，现在该为你们的品味负责了。</p>
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  )
}
