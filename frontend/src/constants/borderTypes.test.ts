// frontend/src/constants/borderTypes.test.ts
import { describe, it, expect } from 'vitest'
import { BORDER_TIERS, getBorderTier } from './borderTypes'

function glowAlpha(glow: string | undefined): number {
  const m = glow?.match(/rgba?\([^)]*,\s*([\d.]+)\)/)
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

  it('超出範圍的 bt 值 fallback 回 tier 0', () => {
    expect(getBorderTier(99)).toEqual(BORDER_TIERS[0])
    expect(getBorderTier(-1)).toEqual(BORDER_TIERS[0])
  })
})
