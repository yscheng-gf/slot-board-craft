// frontend/src/utils/scale.test.ts
import { describe, it, expect } from 'vitest'
import { snapScaleForPixelArt } from './scale'

describe('snapScaleForPixelArt', () => {
  it('把縮放值向下取整到最近的 0.25 倍數，避免盤面超出可用空間', () => {
    expect(snapScaleForPixelArt(0.83)).toBeCloseTo(0.75)
    expect(snapScaleForPixelArt(1.2)).toBeCloseTo(1.0)
  })

  it('已經是 0.25 倍數時維持不變', () => {
    expect(snapScaleForPixelArt(1.5)).toBeCloseTo(1.5)
  })

  it('小於一個 step 時至少回傳一個 step，不會變成 0 讓盤面消失', () => {
    expect(snapScaleForPixelArt(0.1)).toBeCloseTo(0.25)
    expect(snapScaleForPixelArt(0)).toBeCloseTo(0.25)
    expect(snapScaleForPixelArt(-1)).toBeCloseTo(0.25)
  })
})
