// frontend/src/components/Grid.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Grid as GridType, CursorInfo } from '../types'
import { Cell, CELL_W, CELL_H, GAP } from './Cell'
import { getThemeIcon, resolveGridIcons } from '../themes/themes'
import type { SymbolTheme } from '../themes/types'

type Props = {
  grid: GridType
  layout: number[]
  theme: SymbolTheme
  isHighlighted: (reel: number, row: number) => boolean
  selectedCell: CursorInfo
  hoveredCell: { reelIndex: number; rowIndex: number } | null
  onMouseDown: (reel: number, row: number) => void
  onMouseEnter: (reel: number, row: number) => void
  onMouseUp: () => void
  onHoverLeave: () => void
}

export function Grid({
  grid,
  layout,
  theme,
  isHighlighted,
  selectedCell,
  hoveredCell,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onHoverLeave,
}: Props) {
  const maxRows = Math.max(...layout)
  const containerWidth = layout.length * (CELL_W + GAP) - GAP
  const containerHeight = maxRows * (CELL_H + GAP) - GAP
  // 動態池分配要「鎖定」：id 一旦分配到圖示就不會因為盤面上其他格子變動而被換掉
  // （否則重新掃描整個盤面時，新符號可能排到更前面，搶走舊符號原本的圖示）。
  const [dynamicIcons, setDynamicIcons] = useState<Record<number, string>>({})
  const prevThemeId = useRef(theme.id)
  useEffect(() => {
    setDynamicIcons((prev) => {
      const base = prevThemeId.current === theme.id ? prev : {}
      prevThemeId.current = theme.id
      return resolveGridIcons(theme, grid, base)
    })
  }, [theme, grid])

  const isSelected = useCallback(
    (reel: number, row: number) =>
      selectedCell?.reelIndex === reel && selectedCell?.rowIndex === row,
    [selectedCell]
  )

  const isHovered = useCallback(
    (reel: number, row: number) =>
      hoveredCell?.reelIndex === reel && hoveredCell?.rowIndex === row,
    [hoveredCell]
  )

  return (
    <div
      style={{ position: 'relative', width: containerWidth, height: containerHeight }}
      onMouseLeave={() => { onMouseUp(); onHoverLeave() }}
    >
      {/* Layer 1: hit targets */}
      {layout.map((rows, reelIdx) => {
        const topOffset = ((maxRows - rows) * (CELL_H + GAP)) / 2
        return Array.from({ length: rows }, (_, rowIdx) => (
          <div
            key={`hit-${reelIdx}-${rowIdx}`}
            style={{
              position: 'absolute',
              left: reelIdx * (CELL_W + GAP),
              top: topOffset + rowIdx * (CELL_H + GAP),
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
      })}

      {/* Layer 2: visible cells */}
      {grid.map((reel, reelIdx) => {
        const topOffset = ((maxRows - reel.length) * (CELL_H + GAP)) / 2
        return reel.map((cell, rowIdx) =>
          cell.id !== 0 ? (
            <Cell
              key={`cell-${reelIdx}-${rowIdx}`}
              id={cell.id}
              bt={cell.bt}
              w={cell.w}
              l={cell.l}
              s={cell.s}
              iconUrl={getThemeIcon(theme, cell.id, dynamicIcons)}
              pixelArt={theme.pixelArt}
              reelIndex={reelIdx}
              rowIndex={rowIdx}
              topOffset={topOffset}
              isHighlighted={isHighlighted(reelIdx, rowIdx)}
              isHovered={isHovered(reelIdx, rowIdx)}
              isSelected={isSelected(reelIdx, rowIdx)}
              onMouseDown={onMouseDown}
              onMouseEnter={onMouseEnter}
              onMouseUp={onMouseUp}
            />
          ) : null
        )
      })}
    </div>
  )
}
