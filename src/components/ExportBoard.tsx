import { forwardRef, useState } from 'react'
import { ANIME_BY_ID } from '../data/anime'
import { TIERS } from '../constants'
import type { TierState } from '../types'

function ExportPoster({ id }: { id: string }) {
  const anime = ANIME_BY_ID.get(id)
  const [failed, setFailed] = useState(false)
  if (!anime) return null

  return (
    <article className="export-card">
      {failed ? (
        <div className="export-fallback">{anime.title.slice(0, 5)}</div>
      ) : (
        <img src={anime.poster} alt="" onError={() => setFailed(true)} />
      )}
      <strong>{anime.title}</strong>
      <span>{anime.year}</span>
    </article>
  )
}

export const ExportBoard = forwardRef<HTMLDivElement, { state: TierState; libraryName: string }>(function ExportBoard(
  { state, libraryName },
  ref,
) {
  return (
    <div className="export-stage" aria-hidden="true">
      <div ref={ref} className="export-board">
        <header className="export-header">
          <div>
            <span>ANIME TIER LIST</span>
            <h1>{libraryName} · 从夯到拉</h1>
          </div>
          <b>{libraryName}</b>
        </header>
        <main>
          {TIERS.map((tier) => (
            <section
              className="export-tier"
              key={tier.id}
              style={{ '--tier-color': tier.color } as React.CSSProperties}
            >
              <header>
                <strong>{tier.label}</strong>
                <span>{tier.kicker}</span>
              </header>
              <div className="export-grid">
                {state.containers[tier.id].length > 0 ? (
                  state.containers[tier.id].map((id) => <ExportPoster id={id} key={id} />)
                ) : (
                  <p>暂未放置</p>
                )}
              </div>
            </section>
          ))}
        </main>
        <footer>海报资料来源：Bangumi 番组计划</footer>
      </div>
    </div>
  )
})
