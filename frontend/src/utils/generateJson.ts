import type { Grid } from '../types'

type SymbolOut = {
  id: number
  bt?: number
  l: number
  w: number
  i: number
}

export function generateJson(grid: Grid): string {
  let idxCounter = 0
  const reelData = grid.map((reel) =>
    reel.map((cell): SymbolOut | null => {
      const i = idxCounter++
      if (cell.id === 0) return null
      return {
        id: cell.id,
        ...(cell.bt !== 0 && { bt: cell.bt }),
        l: cell.l,
        w: cell.w,
        i,
      }
    })
  )
  return JSON.stringify({ main_game: [reelData] })
}
