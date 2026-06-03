import { useState, useCallback } from 'react'

type DragState = {
  startReel: number
  startRow: number
  currentReel: number
  currentRow: number
}

export type DragResult = {
  reelStart: number
  rowStart: number
  w: number
  l: number
}

export function useDrag() {
  const [drag, setDrag] = useState<DragState | null>(null)

  const startDrag = useCallback((reel: number, row: number) => {
    setDrag({ startReel: reel, startRow: row, currentReel: reel, currentRow: row })
  }, [])

  const updateDrag = useCallback((reel: number, row: number) => {
    setDrag((prev) => (prev ? { ...prev, currentReel: reel, currentRow: row } : null))
  }, [])

  const endDrag = useCallback((): DragResult | null => {
    if (!drag) return null
    const reelStart = Math.min(drag.startReel, drag.currentReel)
    const rowStart = Math.min(drag.startRow, drag.currentRow)
    const w = Math.abs(drag.currentReel - drag.startReel) + 1
    const l = Math.abs(drag.currentRow - drag.startRow) + 1
    setDrag(null)
    return { reelStart, rowStart, w, l }
  }, [drag])

  const isHighlighted = useCallback(
    (reel: number, row: number): boolean => {
      if (!drag) return false
      const minReel = Math.min(drag.startReel, drag.currentReel)
      const maxReel = Math.max(drag.startReel, drag.currentReel)
      const minRow = Math.min(drag.startRow, drag.currentRow)
      const maxRow = Math.max(drag.startRow, drag.currentRow)
      return reel >= minReel && reel <= maxReel && row >= minRow && row <= maxRow
    },
    [drag]
  )

  const isDragging = drag !== null

  return { isDragging, startDrag, updateDrag, endDrag, isHighlighted }
}
