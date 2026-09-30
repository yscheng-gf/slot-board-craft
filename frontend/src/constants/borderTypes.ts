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

const COLORS = [
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

// bt 0,1 無 glow；bt >= 2 起 glow 強度隨 bt 遞增，確保數字越大視覺越明顯
export const BORDER_TIERS: BorderTier[] = COLORS.map((color, id) => {
  if (id < 2) return { id, color }
  const blur = 4 + (id - 2) * 2
  const alpha = 0.5 + (id - 2) * 0.03
  return { id, color, glow: `0 0 ${blur}px ${hexToRgba(color, alpha)}` }
})

export function getBorderTier(bt: number): BorderTier {
  return BORDER_TIERS[bt] ?? BORDER_TIERS[0]
}
