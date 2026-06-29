import { useState, type CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Anime, ContainerId } from '../types'

interface AnimeCardProps {
  anime: Anime
  containerId: ContainerId
  variant: 'tier' | 'library'
}

interface CardArtworkProps {
  anime: Anime
  eager?: boolean
}

export function CardArtwork({ anime, eager = false }: CardArtworkProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="card-artwork">
      {failed ? (
        <div className="poster-fallback" aria-label={`${anime.title} 海报加载失败`}>
          <span>{anime.title.slice(0, 4)}</span>
        </div>
      ) : (
        <img
          src={anime.poster}
          alt={`${anime.title}海报`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
      <span className="card-year">{anime.year}</span>
    </div>
  )
}

export function AnimeCard({ anime, containerId, variant }: AnimeCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: anime.id,
    data: { containerId },
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`anime-card anime-card--${variant}`}
      data-testid={`anime-card-${anime.id}`}
      title={`拖拽《${anime.title}》进行评级`}
      {...attributes}
      {...listeners}
    >
      <CardArtwork anime={anime} />
      <p>{anime.title}</p>
    </article>
  )
}

export function AnimeCardPreview({ anime }: { anime: Anime }) {
  return (
    <article className="anime-card anime-card--preview">
      <CardArtwork anime={anime} eager />
      <p>{anime.title}</p>
    </article>
  )
}
