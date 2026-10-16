// frontend/src/constants/borderTypes.ts

export type BorderTier = {
  id: number
  color: string
  glow?: string
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const BASE_COLORS = [
  '#4b5563', // 0 灰
  '#9ca3af', // 1 銀
  '#f59e0b', // 2 金
  '#f97316', // 3 橘
  '#eab308', // 4 黃
  '#ef4444', // 5 紅
  '#10b981', // 6 綠
  '#3b82f6', // 7 藍
  '#a855f7', // 8 紫
  '#ec4899', // 9 桃紅
]

// bt 超過預設色盤時，用黃金角旋轉 hue 產生新顏色，確保跟鄰近 tier 視覺可區分
function hueFor(bt: number): number {
  return (bt * 137.508) % 360
}

function colorFor(bt: number): string {
  return bt < BASE_COLORS.length ? BASE_COLORS[bt] : `hsl(${hueFor(bt).toFixed(1)}, 70%, 55%)`
}

function glowColorFor(bt: number, alpha: number): string {
  return bt < BASE_COLORS.length
    ? hexToRgba(BASE_COLORS[bt], alpha)
    : `hsla(${hueFor(bt).toFixed(1)}, 70%, 55%, ${alpha})`
}

const MAX_GLOW_BLUR = 24 // bt 可無上限，但模糊半徑要封頂，否則大數字的 glow 會蓋過鄰近格子讓畫面糊掉

// bt 0,1 無 glow；bt >= 2 起 glow 強度隨 bt 遞增，確保數字越大視覺越明顯
function glowFor(bt: number): string | undefined {
  if (bt < 2) return undefined
  const blur = Math.min(4 + (bt - 2) * 2, MAX_GLOW_BLUR)
  const alpha = Math.min(0.5 + (bt - 2) * 0.03, 1)
  return `0 0 ${blur}px ${glowColorFor(bt, alpha)}`
}

export function getBorderTier(bt: number): BorderTier {
  const safeBt = Math.max(0, Math.trunc(bt))
  return { id: safeBt, color: colorFor(safeBt), glow: glowFor(safeBt) }
}

// 預設色盤（Toolbar 常用選項用），不代表合法值的上限
export const BORDER_TIERS: BorderTier[] = BASE_COLORS.map((_, id) => getBorderTier(id))
