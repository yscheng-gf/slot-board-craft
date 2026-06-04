// frontend/src/hooks/useGrid.ts
import { useState, useCallback } from 'react'
import type { Grid, Cell } from '../types'

function makeCell(id = 92): Cell {
  return { id, bt: 0, w: 1, l: 1 }
}

function buildGrid(layout: number[]): Grid {
  return layout.map((rows) => Array.from({ length: rows }, () => makeCell()))
}

export function useGrid(initialLayout: number[] = [3, 4, 5, 5, 4, 3]) {
  const [layout, setLayout] = useState(initialLayout)
  const [grid, setGrid] = useState<Grid>(() => buildGrid(initialLayout))

  const rebuildGrid = useCallback((newLayout: number[]) => {
    setLayout(newLayout)
    setGrid(buildGrid(newLayout))
  }, [])

  const placeSymbol = useCallback(
    (reelStart: number, rowStart: number, w: number, l: number, id: number, bt: number) => {
      setGrid((prev) => {
        const numReels = prev.length
        // 截斷超出邊界的 w
        const safeW = Math.min(w, numReels - reelStart)
        // 截斷超出邊界的 l
        const safeL = Math.min(l, (prev[reelStart]?.length ?? 0) - rowStart)

        const next: Grid = prev.map((reel) => reel.map((cell) => ({ ...cell })))

        // 附屬格設為 id=0
        for (let dx = 0; dx < safeW; dx++) {
          for (let dy = 0; dy < safeL; dy++) {
            if (dx === 0 && dy === 0) continue
            if (next[reelStart + dx]?.[rowStart + dy] !== undefined) {
              next[reelStart + dx][rowStart + dy] = makeCell(0)
            }
          }
        }

        // 主格
        next[reelStart][rowStart] = { id, bt, w: safeW, l: safeL }
        return next
      })
    },
    []
  )

  const randomizeBoard = useCallback((favoriteIds: number[]) => {
    const validIds = favoriteIds.filter((id) => id !== 0)
    if (validIds.length === 0) return
    setGrid((prev) =>
      prev.map((reel) =>
        reel.map(() => ({
          id: validIds[Math.floor(Math.random() * validIds.length)],
          bt: 0,
          w: 1,
          l: 1,
        }))
      )
    )
  }, [])

  return { layout, grid, rebuildGrid, placeSymbol, randomizeBoard }
}
