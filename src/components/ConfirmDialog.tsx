import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ open, onCancel, onConfirm }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="dialog-mark">↺</span>
        <h2 id="reset-title">确定重置排行？</h2>
        <p>全部番剧都会回到未评级区，这个操作无法撤销。</p>
        <div className="dialog-actions">
          <button ref={cancelRef} className="button button--quiet" onClick={onCancel}>先不了</button>
          <button className="button button--danger" onClick={onConfirm}>确认重置</button>
        </div>
      </div>
    </div>
  )
}
