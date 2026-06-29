import { useEffect, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { toPng } from 'html-to-image'
import { ANIME_BY_ID, LIBRARIES, LIBRARY_BY_ID } from './data/anime'
import { CONTAINER_IDS, TIER_IDS, type AnimeId, type ContainerId, type LibraryId, type TierState } from './types'
import { LEGACY_STORAGE_KEY, STORAGE_KEY, TIERS } from './constants'
import { createInitialState, findContainer, moveAnime } from './state/tierState'
import { restoreWorkspace } from './state/workspaceState'
import { AnimeCardPreview } from './components/AnimeCard'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ExportBoard } from './components/ExportBoard'
import { TierRow } from './components/TierRow'
import { UnassignedLibrary } from './components/UnassignedLibrary'
import './styles.css'

function isContainerId(id: string): id is ContainerId {
  return (CONTAINER_IDS as readonly string[]).includes(id)
}

function destinationFor(state: ReturnType<typeof createInitialState>, overId: string): ContainerId | null {
  return isContainerId(overId) ? overId : findContainer(state, overId)
}

export default function App() {
  const [workspace, setWorkspace] = useState(() => restoreWorkspace(
    localStorage.getItem(STORAGE_KEY),
    localStorage.getItem(LEGACY_STORAGE_KEY),
  ))
  const [activeId, setActiveId] = useState<AnimeId | null>(null)
  const [overContainer, setOverContainer] = useState<ContainerId | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState('')
  const exportRef = useRef<HTMLDivElement>(null)
  const lastOverContainerRef = useRef<ContainerId | null>(null)
  const dragSourceContainerRef = useRef<ContainerId | null>(null)
  const lastExternalContainerRef = useRef<ContainerId | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
  }, [workspace])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const activeLibrary = LIBRARY_BY_ID.get(workspace.activeLibraryId) ?? LIBRARIES[0]
  const state = workspace.rankings[activeLibrary.id]
  const assignedCount = useMemo(
    () => TIER_IDS.reduce((count, tierId) => count + state.containers[tierId].length, 0),
    [state],
  )
  const activeAnime = activeId ? ANIME_BY_ID.get(activeId) : undefined

  function setState(updater: TierState | ((current: TierState) => TierState)) {
    setWorkspace((current) => {
      const libraryId = current.activeLibraryId
      const currentRanking = current.rankings[libraryId]
      const nextRanking = typeof updater === 'function' ? updater(currentRanking) : updater
      return {
        ...current,
        rankings: { ...current.rankings, [libraryId]: nextRanking },
      }
    })
  }

  function selectLibrary(libraryId: LibraryId) {
    if (libraryId === workspace.activeLibraryId) return
    finishDrag()
    setWorkspace((current) => ({ ...current, activeLibraryId: libraryId }))
    setNotice(`已切换到“${LIBRARY_BY_ID.get(libraryId)?.label ?? ''}”`)
  }

  function handleDragStart(event: DragStartEvent) {
    const animeId = String(event.active.id)
    dragSourceContainerRef.current = findContainer(state, animeId)
    lastExternalContainerRef.current = null
    setActiveId(animeId)
  }

  function handleDragOver(event: DragOverEvent) {
    if (!event.over) return setOverContainer(null)
    const destination = destinationFor(state, String(event.over.id))
    lastOverContainerRef.current = destination
    if (destination && destination !== dragSourceContainerRef.current) {
      lastExternalContainerRef.current = destination
    }
    setOverContainer(destination)
  }

  function finishDrag() {
    setActiveId(null)
    setOverContainer(null)
    lastOverContainerRef.current = null
    dragSourceContainerRef.current = null
    lastExternalContainerRef.current = null
  }

  function handleDragEnd(event: DragEndEvent) {
    const animeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null
    const rememberedTarget = lastOverContainerRef.current
    const externalTarget = lastExternalContainerRef.current
    if (overId || rememberedTarget || externalTarget) {
      setState((current) => {
        const exactTarget = overId ? destinationFor(current, overId) : null
        const targetContainer = overId === animeId && externalTarget
          ? externalTarget
          : exactTarget ?? rememberedTarget
        if (!targetContainer) return current
        const targetIndex = !overId || overId === targetContainer
          ? current.containers[targetContainer].length
          : current.containers[targetContainer].indexOf(overId)
        return moveAnime(current, animeId, targetContainer, targetIndex < 0 ? undefined : targetIndex)
      })
    }
    finishDrag()
  }

  async function exportImage() {
    if (!exportRef.current || exporting) return
    setExporting(true)
    try {
      await document.fonts?.ready
      const images = Array.from(exportRef.current.querySelectorAll('img'))
      await Promise.all(images.map((img) => img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          })))
      const dataUrl = await toPng(exportRef.current, {
        backgroundColor: '#f5f1e8',
        cacheBust: true,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `${activeLibrary.label}-tier-list.png`
      link.href = dataUrl
      link.click()
      setNotice('排行长图已生成')
    } catch (error) {
      console.error(error)
      setNotice('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }

  function resetRanking() {
    setState(createInitialState(activeLibrary.animeIds))
    setConfirmReset(false)
    setNotice('已恢复初始状态')
  }

  return (
    <>
      <div className="page-shell">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="回到页面顶部">
            <span className="brand-mark"><i /><i /><i /></span>
            <span><strong>番剧排排坐</strong><small>ANIME TIER LIST</small></span>
          </a>
          <span className="autosave"><i /> 自动保存已开启</span>
        </header>

        <main id="top">
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">RANK WHAT WE WATCHED</span>
              <h1>从<span>夯</span>到<span>拉</span><br />排个明白。</h1>
              <p>把共同看过的番拖进你心里的位置。档内也能排序，刷新页面不会丢。</p>
            </div>
            <div className="hero-stats" aria-label="排行进度">
              <div><strong>{assignedCount}</strong><span>已评级</span></div>
              <b>/</b>
              <div><strong>{activeLibrary.animeIds.length}</strong><span>{activeLibrary.label}</span></div>
            </div>
          </section>

          <section className="ranking-panel" aria-labelledby="ranking-title">
            <div className="library-switcher">
              <div>
                <span className="eyebrow">CHOOSE A LIBRARY</span>
                <h2>选择要评级的番剧库</h2>
              </div>
              <div className="library-tabs" role="tablist" aria-label="选择番剧库">
                {LIBRARIES.map((library) => (
                  <button
                    key={library.id}
                    type="button"
                    role="tab"
                    aria-selected={activeLibrary.id === library.id}
                    className={`library-tab${activeLibrary.id === library.id ? ' library-tab--active' : ''}`}
                    onClick={() => selectLibrary(library.id)}
                  >
                    <span>
                      <strong>{library.label}</strong>
                      <small>{library.description}</small>
                    </span>
                    <b>{library.animeIds.length}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className="panel-toolbar">
              <div>
                <span className="eyebrow">YOUR RANKING</span>
                <h2 id="ranking-title">我的番剧排行</h2>
              </div>
              <div className="toolbar-actions">
                <button className="button button--quiet" onClick={() => setConfirmReset(true)}>
                  <span aria-hidden="true">↺</span> 重置排行
                </button>
                <button className="button button--primary" onClick={exportImage} disabled={exporting}>
                  <span aria-hidden="true">⇩</span> {exporting ? '正在生成…' : '保存长图'}
                </button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={finishDrag}
            >
              <div className="tier-board">
                {TIERS.map((tier) => (
                  <TierRow
                    key={tier.id}
                    tier={tier}
                    animeIds={state.containers[tier.id]}
                    highlighted={overContainer === tier.id}
                  />
                ))}
              </div>

              <UnassignedLibrary
                animeIds={state.containers.unassigned}
                highlighted={overContainer === 'unassigned'}
                libraryName={activeLibrary.label}
              />

              <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
                {activeAnime ? <AnimeCardPreview anime={activeAnime} /> : null}
              </DragOverlay>
            </DndContext>
          </section>
        </main>

        <footer className="site-footer">
          <p>Made for spirited debates and suspiciously serious rankings.</p>
          <p>
            海报资料来源：<a href="https://bgm.tv/" target="_blank" rel="noreferrer">Bangumi 番组计划</a>
          </p>
        </footer>
      </div>

      <ExportBoard ref={exportRef} state={state} libraryName={activeLibrary.label} />
      <ConfirmDialog
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={resetRanking}
      />
      <div className={`toast${notice ? ' toast--visible' : ''}`} role="status">{notice}</div>
    </>
  )
}
