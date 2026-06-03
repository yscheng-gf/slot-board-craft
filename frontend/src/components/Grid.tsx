// frontend/src/components/Grid.tsx
import { useCallback } from 'react'
import type { Grid as GridType, CursorInfo } from '../types'
import { Cell, CELL_W, CELL_H, GAP } from './Cell'

type Props = {
  grid: GridType
  layout: number[]
  isHighlighted: (reel: number, row: number) => boolean
  selectedCell: CursorInfo
  onMouseDown: (reel: number, row: number) => void
  onMouseEnter: (reel: number, row: number) => void
  onMouseUp: () => void
}

export function Grid({
  grid,
  layout,
  isHighlighted,
  selectedCell,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}: Props) {
  const maxRows = Math.max(...layout)
  const containerWidth = layout.length * (CELL_W + GAP) - GAP
  const containerHeight = maxRows * (CELL_H + GAP) - GAP

  const isSelected = useCallback(
    (reel: number, row: number) =>
      selectedCell?.reelIndex === reel && selectedCell?.rowIndex === row,
    [selectedCell]
  )

  return (
    <div
      style={{ position: 'relative', width: containerWidth, height: containerHeight }}
      onMouseLeave={onMouseUp}
    >
      {/* Layer 1: hit targets */}
      {layout.map((rows, reelIdx) =>
        Array.from({ length: rows }, (_, rowIdx) => (
          <div
            key={`hit-${reelIdx}-${rowIdx}`}
            style={{
              position: 'absolute',
              left: reelIdx * (CELL_W + GAP),
              top: rowIdx * (CELL_H + GAP),
              width: CELL_W,
              height: CELL_H,
              zIndex: 1,
              background: isHighlighted(reelIdx, rowIdx) ? '#1d4ed8' : '#111827',
              borderRadius: 4,
              border: '2px solid #374151',
            }}
            onMouseDown={(e) => { e.preventDefault(); onMouseDown(reelIdx, rowIdx) }}
            onMouseEnter={() => onMouseEnter(reelIdx, rowIdx)}
            onMouseUp={onMouseUp}
          />
        ))
      )}

      {/* Layer 2: visible cells */}
      {grid.map((reel, reelIdx) =>
        reel.map((cell, rowIdx) =>
          cell.id !== 0 ? (
            <Cell
              key={`cell-${reelIdx}-${rowIdx}`}
              id={cell.id}
              bt={cell.bt}
              w={cell.w}
              l={cell.l}
              reelIndex={reelIdx}
              rowIndex={rowIdx}
              isHighlighted={isHighlighted(reelIdx, rowIdx)}
              isSelected={isSelected(reelIdx, rowIdx)}
              onMouseDown={onMouseDown}
              onMouseEnter={onMouseEnter}
              onMouseUp={onMouseUp}
            />
          ) : null
        )
      )}
    </div>
  )
}
