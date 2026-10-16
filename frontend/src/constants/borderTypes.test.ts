// frontend/src/constants/borderTypes.test.ts
import { describe, it, expect } from 'vitest'
import { BORDER_TIERS, getBorderTier } from './borderTypes'

function glowAlpha(glow: string | undefined): number {
  // glow 顏色可能是 rgba(...) 或 hsla(...)，取括號內最後一個參數（alpha）
  const m = glow?.match(/\(([^)]*)\)/)
  if (!m) return 0
  const parts = m[1].split(',')
  return parseFloat(parts[parts.length - 1])
}

function glowBlur(glow: string | undefined): number {
  // glow 格式為 `0 0 <blur>px <color>`，取出 blur 數值
  const m = glow?.match(/^0 0 ([\d.]+)px/)
  return m ? parseFloat(m[1]) : 0
}

describe('BORDER_TIERS', () => {
  it('共有 10 個等級，id 為 0~9', () => {
    expect(BORDER_TIERS.map((t) => t.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})

describe('getBorderTier', () => {
  it('bt=0 回傳灰色、無 glow（沿用現有 Normal）', () => {
    const tier = getBorderTier(0)
    expect(tier.color).toBe('#4b5563')
    expect(tier.glow).toBeUndefined()
  })

  it('bt=1 回傳銀色、無 glow（沿用現有 Silver）', () => {
    const tier = getBorderTier(1)
    expect(tier.color).toBe('#9ca3af')
    expect(tier.glow).toBeUndefined()
  })

  it('bt=2 回傳金色、有 glow（沿用現有 Gold）', () => {
    const tier = getBorderTier(2)
    expect(tier.color).toBe('#f59e0b')
    expect(tier.glow).toBeDefined()
  })

  it('bt 越大 glow 強度（透明度）越強，不會出現數字變大反而變弱的情況', () => {
    const alphas = [2, 3, 4, 5, 6, 7, 8, 9].map((bt) => glowAlpha(getBorderTier(bt).glow))
    for (let i = 1; i < alphas.length; i++) {
      expect(alphas[i]).toBeGreaterThan(alphas[i - 1])
    }
  })

  it('bt 超過預設色盤（0~9）時仍回傳該 bt 專屬的顏色與 glow，不再 fallback 回 tier 0', () => {
    const tier = getBorderTier(15)
    expect(tier.id).toBe(15)
    expect(tier.color).toBeDefined()
    expect(tier.color).not.toBe(BORDER_TIERS[0].color)
    expect(tier.glow).toBeDefined()
  })

  it('bt 無上限，glow 強度持續隨 bt 遞增（不會在超過 9 後打回原形）', () => {
    const alphas = [9, 15, 30, 100].map((bt) => glowAlpha(getBorderTier(bt).glow))
    for (let i = 1; i < alphas.length; i++) {
      expect(alphas[i]).toBeGreaterThanOrEqual(alphas[i - 1])
    }
  })

  it('負數 bt 視為 0（不合法輸入，安全退回 Normal）', () => {
    expect(getBorderTier(-1)).toEqual(getBorderTier(0))
  })

  it('glow 模糊半徑有上限，bt 很大時不會讓畫面糊成一片', () => {
    expect(glowBlur(getBorderTier(100).glow)).toBeLessThanOrEqual(24)
    expect(glowBlur(getBorderTier(10000).glow)).toBeLessThanOrEqual(24)
  })
})
