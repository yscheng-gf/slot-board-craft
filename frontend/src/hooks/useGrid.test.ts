// frontend/src/hooks/useGrid.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGrid } from './useGrid'

describe('useGrid', () => {
  it('初始化時依 layout 建立盤面，預設 id=92', () => {
    const { result } = renderHook(() => useGrid([3, 4]))
    expect(result.current.grid.length).toBe(2)      // 2 reels
    expect(result.current.grid[0].length).toBe(3)   // reel 0: 3 rows
    expect(result.current.grid[1].length).toBe(4)   // reel 1: 4 rows
    expect(result.current.grid[0][0].id).toBe(92)
  })

  it('rebuildGrid 重建盤面，重置所有格子', () => {
    const { result } = renderHook(() => useGrid([2]))
    act(() => {
      result.current.placeSymbol(0, 0, 1, 1, 5, 0)
    })
    act(() => {
      result.current.rebuildGrid([3])
    })
    expect(result.current.layout).toEqual([3])
    expect(result.current.grid.length).toBe(1)
    expect(result.current.grid[0].length).toBe(3)
    expect(result.current.grid[0][0].id).toBe(92)
  })

  it('placeSymbol 填入單格（w=1, l=1）', () => {
    const { result } = renderHook(() => useGrid([3, 4]))
    act(() => {
      result.current.placeSymbol(1, 2, 1, 1, 14, 2)
    })
    expect(result.current.grid[1][2]).toEqual({ id: 14, bt: 2, w: 1, l: 1 })
  })

  it('placeSymbol 填入 2×2，附屬格設為 id=0', () => {
    const { result } = renderHook(() => useGrid([4, 4]))
    act(() => {
      result.current.placeSymbol(0, 0, 2, 2, 14, 0)
    })
    expect(result.current.grid[0][0]).toEqual({ id: 14, bt: 0, w: 2, l: 2 })
    expect(result.current.grid[1][0].id).toBe(0)
    expect(result.current.grid[0][1].id).toBe(0)
    expect(result.current.grid[1][1].id).toBe(0)
  })

  it('placeSymbol 超出邊界時截斷到合法範圍', () => {
    const { result } = renderHook(() => useGrid([3]))
    act(() => {
      // reel 只有 index 0，w=2 超界，截斷為 w=1
      result.current.placeSymbol(0, 0, 2, 1, 5, 0)
    })
    expect(result.current.grid[0][0].w).toBe(1)
  })

  it('randomizeBoard 將每個格子換成 favoriteIds 中的某個 ID', () => {
    const { result } = renderHook(() => useGrid([2, 3]))
    act(() => {
      result.current.randomizeBoard([1, 2, 3])
    })
    const allIds = result.current.grid.flatMap((reel) => reel.map((c) => c.id))
    expect(allIds.every((id) => [1, 2, 3].includes(id))).toBe(true)
  })

  it('randomizeBoard 每格都是 bt=0, w=1, l=1', () => {
    const { result } = renderHook(() => useGrid([2, 2]))
    act(() => {
      result.current.randomizeBoard([5])
    })
    const allCells = result.current.grid.flatMap((reel) => reel)
    expect(allCells.every((c) => c.bt === 0 && c.w === 1 && c.l === 1)).toBe(true)
  })
})
