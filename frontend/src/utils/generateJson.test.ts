import { describe, it, expect } from 'vitest'
import { generateJson } from './generateJson'
import type { Grid } from '../types'

describe('generateJson', () => {
  it('空盤面（全 id=92）輸出所有格子', () => {
    const grid: Grid = [
      [{ id: 92, bt: 0, w: 1, l: 1 }, { id: 92, bt: 0, w: 1, l: 1 }],
      [{ id: 92, bt: 0, w: 1, l: 1 }, { id: 92, bt: 0, w: 1, l: 1 }],
    ]
    const result = JSON.parse(generateJson(grid))
    expect(result[0][0]).toMatchObject({ id: 92, l: 1, w: 1, i: 0 })
    expect(result[0][1]).toMatchObject({ id: 92, l: 1, w: 1, i: 1 })
    expect(result[1][0]).toMatchObject({ id: 92, l: 1, w: 1, i: 2 })
    expect(result[1][1]).toMatchObject({ id: 92, l: 1, w: 1, i: 3 })
  })

  it('id=0 的格子輸出為 null', () => {
    const grid: Grid = [
      [{ id: 1, bt: 0, w: 2, l: 1 }, { id: 92, bt: 0, w: 1, l: 1 }],
      [{ id: 0, bt: 0, w: 1, l: 1 }, { id: 92, bt: 0, w: 1, l: 1 }],
    ]
    const result = JSON.parse(generateJson(grid))
    expect(result[1][0]).toBeNull()
  })

  it('bt=0 時不輸出 bt 欄位', () => {
    const grid: Grid = [[{ id: 3, bt: 0, w: 1, l: 1 }]]
    const result = JSON.parse(generateJson(grid))
    expect(result[0][0]).not.toHaveProperty('bt')
  })

  it('bt!=0 時輸出 bt 欄位', () => {
    const grid: Grid = [[{ id: 3, bt: 2, w: 1, l: 1 }]]
    const result = JSON.parse(generateJson(grid))
    expect(result[0][0].bt).toBe(2)
  })

  it('index 從左到右、從上到下遞增', () => {
    const grid: Grid = [
      [{ id: 1, bt: 0, w: 1, l: 1 }, { id: 2, bt: 0, w: 1, l: 1 }],
      [{ id: 3, bt: 0, w: 1, l: 1 }, { id: 4, bt: 0, w: 1, l: 1 }],
    ]
    const result = JSON.parse(generateJson(grid))
    expect(result[0][0].i).toBe(0)
    expect(result[0][1].i).toBe(1)
    expect(result[1][0].i).toBe(2)
    expect(result[1][1].i).toBe(3)
  })

  it('輸出為二維陣列', () => {
    const grid: Grid = [[{ id: 92, bt: 0, w: 1, l: 1 }]]
    const result = JSON.parse(generateJson(grid))
    expect(Array.isArray(result)).toBe(true)
    expect(Array.isArray(result[0])).toBe(true)
  })
})
