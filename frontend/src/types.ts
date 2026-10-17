// frontend/src/types.ts

export type Cell = {
  id: number
  bt: number   // 0=正常, 1=銀框, 2=金框
  w: number    // 橫跨 reel 數
  l: number    // 縱跨 row 數
  s: number    // 狀態（status），預設 0
}

export type Grid = Cell[][]  // Grid[reelIndex][rowIndex]

export type Config = {
  favoriteIds: number[]
  lastLayout: string
  themeId: string
}

export type UpdateInfo = {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  releaseUrl: string
}

export type UpdatePhase = 'available' | 'updating' | 'success' | 'error' | 'up-to-date' | 'check-failed'

export type CursorInfo = {
  reelIndex: number
  rowIndex: number
  cell: Cell
} | null
