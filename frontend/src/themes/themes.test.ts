// frontend/src/themes/themes.test.ts
import { describe, it, expect } from 'vitest'
import { DEFAULT_THEME, THEMES, getThemeById, getThemeIcon, resolveGridIcons } from './themes'
import type { Grid } from '../types'

function cell(id: number) {
  return { id, bt: 0, w: 1, l: 1, s: 0 }
}

describe('DEFAULT_THEME', () => {
  it('沒有任何圖示，一律退回色塊顯示', () => {
    expect(getThemeIcon(DEFAULT_THEME, 1)).toBeUndefined()
    expect(getThemeIcon(DEFAULT_THEME, 92)).toBeUndefined()
  })
})

describe('getThemeById', () => {
  it('找得到時回傳對應主題', () => {
    const found = getThemeById('pixel')
    expect(found.id).toBe('pixel')
  })

  it('找不到時退回 DEFAULT_THEME（不拋例外）', () => {
    expect(getThemeById('不存在的主題')).toBe(DEFAULT_THEME)
  })
})

describe('getThemeIcon', () => {
  it('主題有對應 id 的圖示時回傳該圖示路徑', () => {
    const theme = { id: 't', name: 't', icons: { 5: '/foo.png' } }
    expect(getThemeIcon(theme, 5)).toBe('/foo.png')
  })

  it('主題沒有對應 id 的圖示、也沒有涵蓋的家族範圍時回傳 undefined（讓呼叫端退回色塊）', () => {
    const theme = { id: 't', name: 't', icons: { 5: '/foo.png' } }
    expect(getThemeIcon(theme, 6)).toBeUndefined()
  })

  it('id 落在某個家族範圍內、但沒有專屬圖示時，回傳該家族的 fallback 圖示', () => {
    const theme = {
      id: 't',
      name: 't',
      icons: {},
      families: [{ range: [80, 199] as [number, number], icon: '/special-generic.png' }],
    }
    expect(getThemeIcon(theme, 85)).toBe('/special-generic.png')
    expect(getThemeIcon(theme, 199)).toBe('/special-generic.png')
  })

  it('id 不在任何家族範圍內時，不套用 fallback', () => {
    const theme = {
      id: 't',
      name: 't',
      icons: {},
      families: [{ range: [80, 199] as [number, number], icon: '/special-generic.png' }],
    }
    expect(getThemeIcon(theme, 200)).toBeUndefined()
    expect(getThemeIcon(theme, 79)).toBeUndefined()
  })

  it('id 同時有專屬圖示跟家族 fallback 時，專屬圖示優先', () => {
    const theme = {
      id: 't',
      name: 't',
      icons: { 80: '/special-wild.png' },
      families: [{ range: [80, 199] as [number, number], icon: '/special-generic.png' }],
    }
    expect(getThemeIcon(theme, 80)).toBe('/special-wild.png')
  })

  it('傳入 dynamicIcons 時，動態分配的圖示優先於家族 fallback', () => {
    const theme = {
      id: 't',
      name: 't',
      icons: {},
      families: [{ range: [80, 199] as [number, number], icon: '/special-generic.png' }],
    }
    expect(getThemeIcon(theme, 85, { 85: '/special-bonus.png' })).toBe('/special-bonus.png')
  })

  it('id 同時有專屬圖示跟 dynamicIcons 時，專屬圖示優先', () => {
    const theme = { id: 't', name: 't', icons: { 91: '/special-wild.png' } }
    expect(getThemeIcon(theme, 91, { 91: '/special-bonus.png' })).toBe('/special-wild.png')
  })
})

describe('resolveGridIcons', () => {
  const pool = {
    range: [80, 199] as [number, number],
    icons: ['/pool-1.png', '/pool-2.png'],
  }

  it('沒有 dynamicPool 時回傳空物件', () => {
    const theme = { id: 't', name: 't', icons: {} }
    const grid: Grid = [[cell(85)]]
    expect(resolveGridIcons(theme, grid)).toEqual({})
  })

  it('依盤面出現順序（reel 由左到右、row 由上到下）分配圖示池', () => {
    const theme = { id: 't', name: 't', icons: {}, dynamicPool: pool }
    const grid: Grid = [
      [cell(85), cell(86)],
      [cell(87), cell(0)],
    ]
    expect(resolveGridIcons(theme, grid)).toEqual({ 85: '/pool-1.png', 86: '/pool-2.png' })
  })

  it('同一個 id 出現多次只分配一次，不會重複消耗池子', () => {
    const theme = { id: 't', name: 't', icons: {}, dynamicPool: pool }
    const grid: Grid = [[cell(85), cell(85), cell(85)]]
    expect(resolveGridIcons(theme, grid)).toEqual({ 85: '/pool-1.png' })
  })

  it('池子用完後，之後出現的 id 不會被分配（交給呼叫端退回家族 fallback）', () => {
    const theme = { id: 't', name: 't', icons: {}, dynamicPool: pool }
    const grid: Grid = [[cell(85), cell(86), cell(87)]]
    const resolved = resolveGridIcons(theme, grid)
    expect(resolved).toEqual({ 85: '/pool-1.png', 86: '/pool-2.png' })
    expect(resolved[87]).toBeUndefined()
  })

  it('已經有專屬圖示（theme.icons）的 id 不會佔用動態池子', () => {
    const theme = { id: 't', name: 't', icons: { 91: '/special-wild.png' }, dynamicPool: pool }
    const grid: Grid = [[cell(91), cell(85)]]
    expect(resolveGridIcons(theme, grid)).toEqual({ 85: '/pool-1.png' })
  })

  it('超出 dynamicPool 範圍的 id 不會被分配', () => {
    const theme = { id: 't', name: 't', icons: {}, dynamicPool: pool }
    const grid: Grid = [[cell(5), cell(85)]]
    expect(resolveGridIcons(theme, grid)).toEqual({ 85: '/pool-1.png' })
  })

  it('id=0（空格）不會被分配', () => {
    const theme = { id: 't', name: 't', icons: {}, dynamicPool: pool }
    const grid: Grid = [[cell(0), cell(85)]]
    expect(resolveGridIcons(theme, grid)).toEqual({ 85: '/pool-1.png' })
  })
})

describe('THEMES', () => {
  it('第一個是 DEFAULT_THEME，且包含 pixel 主題', () => {
    expect(THEMES[0]).toBe(DEFAULT_THEME)
    expect(THEMES.some((t) => t.id === 'pixel')).toBe(true)
  })

  it('pixel 主題標記 pixelArt，且至少涵蓋 1~9 高倍符號', () => {
    const pixel = getThemeById('pixel')
    expect(pixel.pixelArt).toBe(true)
    for (let id = 1; id <= 9; id++) {
      expect(pixel.icons[id]).toBeDefined()
    }
  })

  it('pixel 主題只固定 91=wild、92=scatter 兩個專屬圖示，其餘特殊符號交給動態池子', () => {
    const pixel = getThemeById('pixel')
    expect(pixel.icons[91]).toBeDefined()
    expect(pixel.icons[92]).toBeDefined()
    expect(pixel.icons[93]).toBeUndefined()
    expect(pixel.dynamicPool?.icons.length).toBe(7)
  })

  it('pixel 主題對還沒畫專屬圖、也還沒被動態分配的特殊符號 id 回傳通用 fallback 圖示', () => {
    const pixel = getThemeById('pixel')
    expect(getThemeIcon(pixel, 150)).toBeDefined()
    expect(getThemeIcon(pixel, 150)).toBe(getThemeIcon(pixel, 160))
  })

  it('pixel 主題整合 resolveGridIcons：盤面上先出現的特殊符號 id 依序拿到 bonus/freespin/...等 7 張動態圖示，用完才退回 generic', () => {
    const pixel = getThemeById('pixel')
    const grid: Grid = [
      [cell(93), cell(94), cell(95), cell(96)],
      [cell(97), cell(98), cell(99), cell(100)],
    ]
    const dynamicIcons = resolveGridIcons(pixel, grid)
    const resolvedFor93to99 = [93, 94, 95, 96, 97, 98, 99].map((id) => getThemeIcon(pixel, id, dynamicIcons))
    expect(resolvedFor93to99.every((icon) => icon !== undefined)).toBe(true)
    expect(new Set(resolvedFor93to99).size).toBe(7) // 七張都不一樣

    // 第 8 個不一樣的特殊符號 id，池子已用完，退回 generic fallback
    const fallbackIcon = getThemeIcon(pixel, 100, dynamicIcons)
    expect(fallbackIcon).toBeDefined()
    expect(resolvedFor93to99).not.toContain(fallbackIcon)
  })
})
