// frontend/src/themes/themes.ts
import type { SymbolTheme } from './types'
import type { Grid } from '../types'
import { PIXEL_THEME } from './pixel'
import { CLASSIC_THEME } from './classic'
import { DRAGONBALL_THEME } from './dragonball'

export const DEFAULT_THEME: SymbolTheme = {
  id: 'default',
  name: '色塊（預設）',
  icons: {},
}

export const THEMES: SymbolTheme[] = [DEFAULT_THEME, PIXEL_THEME, CLASSIC_THEME, DRAGONBALL_THEME]

export function getThemeById(id: string): SymbolTheme {
  return THEMES.find((t) => t.id === id) ?? DEFAULT_THEME
}

export function getThemeIcon(
  theme: SymbolTheme,
  symbolId: number,
  dynamicIcons?: Record<number, string>
): string | undefined {
  const exact = theme.icons[symbolId]
  if (exact) return exact
  const dynamic = dynamicIcons?.[symbolId]
  if (dynamic) return dynamic
  const family = theme.families?.find(({ range }) => symbolId >= range[0] && symbolId <= range[1])
  return family?.icon
}

// 依盤面出現順序（reel 由左到右、row 由上到下，跟 generateJson 的匯出順序一致），
// 把 dynamicPool 的圖示「先搶先贏」分配給還沒有專屬圖示的 id；池子用完就不再分配，
// 交由呼叫端（getThemeIcon）退回 families 的通用 fallback。
//
// previouslyAssigned：之前已經分配過的 id -> 圖示對照。已經分配過的 id 永遠保留原本的圖示，
// 不會因為盤面上新增/搬動其他符號、改變了掃描順序而被重新分配（避免既有符號的圖示被換掉）。
// 只有「目前還沒出現在 previouslyAssigned 裡」的 id，才會依掃描順序排隊拿剩下的池子圖示。
export function resolveGridIcons(
  theme: SymbolTheme,
  grid: Grid,
  previouslyAssigned: Record<number, string> = {}
): Record<number, string> {
  const assigned: Record<number, string> = { ...previouslyAssigned }
  const pool = theme.dynamicPool
  if (!pool) return assigned

  let poolIndex = Object.keys(assigned).length
  if (poolIndex >= pool.icons.length) return assigned

  for (const reel of grid) {
    for (const cell of reel) {
      const id = cell.id
      if (id === 0) continue
      if (theme.icons[id] !== undefined) continue
      if (id < pool.range[0] || id > pool.range[1]) continue
      if (assigned[id] !== undefined) continue
      if (poolIndex >= pool.icons.length) continue
      assigned[id] = pool.icons[poolIndex]
      poolIndex++
    }
  }
  return assigned
}
