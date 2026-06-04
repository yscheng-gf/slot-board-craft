# Cell 顏色與隨機盤面 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 為每個 symbol ID 加上黃金比例 HSL 背景色，並在 Toolbar 新增隨機盤面按鈕。

**Architecture:** `idToColor()` 純函式放在 `Cell.tsx` 中直接使用；`randomizeBoard()` 加入 `useGrid` hook 並由 App 串接至 Toolbar。兩個功能互相獨立，可分開 commit。

**Tech Stack:** React, TypeScript, Vitest, @testing-library/react

---

## Task 1：`idToColor` 純函式與 Cell 背景色

**Files:**
- Modify: `frontend/src/components/Cell.tsx`

- [ ] **步驟 1：在 `Cell.tsx` 頂部新增 `idToColor` 函式**

  在 `BT_BORDER` 宣告的上方插入：

  ```ts
  function idToColor(id: number): string {
    if (id === 92) return '#1f2937'
    const hue = (id * 137.508) % 360
    return `hsl(${hue.toFixed(1)}, 55%, 28%)`
  }
  ```

- [ ] **步驟 2：將 `Cell` 元件內的寫死背景色換成 `idToColor`**

  目前 `Cell.tsx` 第 37 行：
  ```ts
  const bg = isHighlighted ? '#2563eb' : '#1f2937'
  ```

  改為：
  ```ts
  const bg = isHighlighted ? '#2563eb' : idToColor(id)
  ```

- [ ] **步驟 3：在瀏覽器確認視覺效果**

  執行 `wails dev`（或前端已啟動則重新整理），目視確認不同 ID 的格子呈現不同底色，拖曳高亮仍正常顯示藍色。

- [ ] **步驟 4：Commit**

  ```bash
  git add frontend/src/components/Cell.tsx
  git commit -m "feat: color cells by symbol ID using golden-ratio HSL"
  ```

---

## Task 2：`useGrid` 新增 `randomizeBoard`

**Files:**
- Modify: `frontend/src/hooks/useGrid.ts`
- Modify: `frontend/src/hooks/useGrid.test.ts`

- [ ] **步驟 1：在 `useGrid.test.ts` 補兩個測試（先讓它們失敗）**

  在現有 `describe('useGrid', ...)` 區塊末尾加入：

  ```ts
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
  ```

- [ ] **步驟 2：確認測試失敗**

  ```bash
  cd frontend && npm test -- --run
  ```

  預期：`randomizeBoard is not a function` 相關錯誤。

- [ ] **步驟 3：在 `useGrid.ts` 實作 `randomizeBoard`**

  在 `placeSymbol` 的 `useCallback` 定義之後、`return` 之前加入：

  ```ts
  const randomizeBoard = useCallback((favoriteIds: number[]) => {
    if (favoriteIds.length === 0) return
    setGrid((prev) =>
      prev.map((reel) =>
        reel.map(() => ({
          id: favoriteIds[Math.floor(Math.random() * favoriteIds.length)],
          bt: 0,
          w: 1,
          l: 1,
        }))
      )
    )
  }, [])
  ```

  並更新 `return` 加上 `randomizeBoard`：

  ```ts
  return { layout, grid, rebuildGrid, placeSymbol, randomizeBoard }
  ```

- [ ] **步驟 4：確認測試全過**

  ```bash
  cd frontend && npm test -- --run
  ```

  預期：`Tests 14 passed (14)`（原 12 + 新 2）。

- [ ] **步驟 5：Commit**

  ```bash
  git add frontend/src/hooks/useGrid.ts frontend/src/hooks/useGrid.test.ts
  git commit -m "feat: add randomizeBoard to useGrid"
  ```

---

## Task 3：Toolbar 新增隨機按鈕，App 串接

**Files:**
- Modify: `frontend/src/components/Toolbar.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **步驟 1：在 `Toolbar.tsx` 的 Props 型別加入 `onRandomize`**

  ```ts
  type Props = {
    layoutInput: string
    selectedId: number
    selectedBt: number
    favoriteIds: number[]
    onLayoutChange: (raw: string) => void
    onSelectId: (id: number) => void
    onBtChange: (bt: number) => void
    onAddFavorite: (id: number) => void
    onRemoveFavorite: (id: number) => void
    onRandomize: () => void   // ← 新增
  }
  ```

  並在函式參數解構中加入 `onRandomize`：

  ```ts
  export function Toolbar({
    layoutInput,
    selectedId,
    selectedBt,
    favoriteIds,
    onLayoutChange,
    onSelectId,
    onBtChange,
    onAddFavorite,
    onRemoveFavorite,
    onRandomize,   // ← 新增
  }: Props) {
  ```

- [ ] **步驟 2：在 Toolbar JSX 的 BT 輸入欄之後加入隨機按鈕**

  在最後一個 `</div>`（BT 區塊）之後、整個 Toolbar `</div>` 關閉前插入：

  ```tsx
  {/* 隨機 */}
  <button
    onClick={onRandomize}
    disabled={favoriteIds.length === 0}
    className="px-3 py-1 rounded border text-xs font-mono bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    隨機
  </button>
  ```

- [ ] **步驟 3：在 `App.tsx` 串接 `handleRandomize`**

  在 `handleRemoveFavorite` 之後加入：

  ```ts
  const handleRandomize = useCallback(() => {
    randomizeBoard(favoriteIds)
  }, [randomizeBoard, favoriteIds])
  ```

  並在 `<Toolbar>` 元件傳入新 prop：

  ```tsx
  <Toolbar
    layoutInput={layoutInput}
    selectedId={selectedId}
    selectedBt={selectedBt}
    favoriteIds={favoriteIds}
    onLayoutChange={handleLayoutChange}
    onSelectId={setSelectedId}
    onBtChange={setSelectedBt}
    onAddFavorite={handleAddFavorite}
    onRemoveFavorite={handleRemoveFavorite}
    onRandomize={handleRandomize}   // ← 新增
  />
  ```

- [ ] **步驟 4：TypeScript build 確認無型別錯誤**

  ```bash
  cd frontend && npx tsc --noEmit
  ```

  預期：無輸出（無錯誤）。

- [ ] **步驟 5：在瀏覽器確認隨機按鈕行為**

  執行 `wails dev`，點擊「隨機」按鈕確認：
  - 每個格子都填入來自常用 ID 的隨機符號。
  - Layout 不變（reel 數、row 數維持）。
  - `favoriteIds` 清空時按鈕呈現 disabled 狀態。

- [ ] **步驟 6：Commit**

  ```bash
  git add frontend/src/components/Toolbar.tsx frontend/src/App.tsx
  git commit -m "feat: add randomize board button to Toolbar"
  ```
