// frontend/src/types.ts

export type Cell = {
  id: number
  bt: number   // 0=正常, 1=銀框, 2=金框
  w: number    // 橫跨 reel 數
  l: number    // 縱跨 row 數
}

export type Grid = Cell[][]  // Grid[reelIndex][rowIndex]

export type Config = {
  favoriteIds: number[]
  lastLayout: string
}

export type CursorInfo = {
  reelIndex: number
  rowIndex: number
  cell: Cell
} | null
