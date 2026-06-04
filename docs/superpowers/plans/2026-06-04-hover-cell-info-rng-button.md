# Hover Cell 資訊更新 & RNG 按鈕 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓滑鼠 hover 到格子時即時更新右側 info panel 並顯示輕微亮色，同時將 Toolbar 的「隨機」按鈕改名為「RNG」。

**Architecture:** `Cell` 新增 `isHovered` prop 與 `idToColorHover()`；`Grid` 新增 `hoveredCell` 與 `onHoverLeave` prop；`App` 持有 `hoveredCell` state，`handleMouseEnter` 無條件更新 cursorInfo 與 hoveredCell，`handleMouseDown` 移除 setCursorInfo。

**Tech Stack:** React, TypeScript, Vitest

---

## Task 1：Cell.tsx — 新增 `isHovered` prop 與 `idToColorHover`

**Files:**
- Modify: `frontend/src/components/Cell.tsx`

- [ ] **步驟 1：在 `idToColor` 下方新增 `idToColorHover` 函式**

  ```ts
  function idToColorHover(id: number): string {
    if (id === 0) return '#4b5563'
    if (id === 92) return '#374151'
    const hue = (id * 137.508) % 360
    return `hsl(${hue.toFixed(1)}, 55%, 44%)`
  }
  ```

- [ ] **步驟 2：在 Props 型別加入 `isHovered: boolean`**

  ```ts
  type Props = {
    id: number
    bt: number
    w: number
    l: number
    reelIndex: number
    rowIndex: number
    topOffset: number
    isHighlighted: boolean
    isHovered: boolean
    isSelected: boolean
    onMouseDown: (reel: number, row: number) => void
    onMouseEnter: (reel: number, row: number) => void
    onMouseUp: () => void
  }
  ```

- [ ] **步驟 3：函式參數解構加入 `isHovered`，更新背景色邏輯**

  解構：
  ```ts
  export function Cell({
    id, bt, w, l,
    reelIndex, rowIndex, topOffset,
    isHighlighted, isHovered, isSelected,
    onMouseDown, onMouseEnter, onMouseUp,
  }: Props) {
  ```

  背景色：
  ```ts
  const bg = isHighlighted ? '#2563eb' : isHovered ? idToColorHover(id) : idToColor(id)
  ```

- [ ] **步驟 4：執行測試確認現有測試仍全過**

  ```bash
  cd /Users/shun/Development/gdxworkspace/slot-board-utils/frontend && npm test -- --run
  ```

  預期：`14 passed`（Cell 無單元測試，確認既有測試未壞即可）。

- [ ] **步驟 5：Commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils add frontend/src/components/Cell.tsx
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils commit -m "feat: add isHovered prop and idToColorHover to Cell"
  ```

---

## Task 2：Grid.tsx — 傳遞 `hoveredCell` 與 `onHoverLeave`

**Files:**
- Modify: `frontend/src/components/Grid.tsx`

- [ ] **步驟 1：更新 Props 型別，加入 `hoveredCell` 與 `onHoverLeave`**

  ```ts
  type Props = {
    grid: GridType
    layout: number[]
    isHighlighted: (reel: number, row: number) => boolean
    selectedCell: CursorInfo
    hoveredCell: { reelIndex: number; rowIndex: number } | null
    onMouseDown: (reel: number, row: number) => void
    onMouseEnter: (reel: number, row: number) => void
    onMouseUp: () => void
    onHoverLeave: () => void
  }
  ```

- [ ] **步驟 2：在函式參數解構加入 `hoveredCell`、`onHoverLeave`**

  ```ts
  export function Grid({
    grid,
    layout,
    isHighlighted,
    selectedCell,
    hoveredCell,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    onHoverLeave,
  }: Props) {
  ```

- [ ] **步驟 3：在 `isSelected` callback 下方新增 `isHovered` callback**

  ```ts
  const isHovered = useCallback(
    (reel: number, row: number) =>
      hoveredCell?.reelIndex === reel && hoveredCell?.rowIndex === row,
    [hoveredCell]
  )
  ```

- [ ] **步驟 4：更新容器 `onMouseLeave`，同時呼叫 `onMouseUp` 和 `onHoverLeave`**

  ```tsx
  <div
    style={{ position: 'relative', width: containerWidth, height: containerHeight }}
    onMouseLeave={() => { onMouseUp(); onHoverLeave() }}
  >
  ```

- [ ] **步驟 5：在 Layer 2（visible cells）的 `<Cell>` 加入 `isHovered` prop**

  ```tsx
  <Cell
    key={`cell-${reelIdx}-${rowIdx}`}
    id={cell.id}
    bt={cell.bt}
    w={cell.w}
    l={cell.l}
    reelIndex={reelIdx}
    rowIndex={rowIdx}
    topOffset={topOffset}
    isHighlighted={isHighlighted(reelIdx, rowIdx)}
    isHovered={isHovered(reelIdx, rowIdx)}
    isSelected={isSelected(reelIdx, rowIdx)}
    onMouseDown={onMouseDown}
    onMouseEnter={onMouseEnter}
    onMouseUp={onMouseUp}
  />
  ```

- [ ] **步驟 6：執行 TypeScript 型別檢查**

  ```bash
  cd /Users/shun/Development/gdxworkspace/slot-board-utils/frontend && npx tsc --noEmit
  ```

  預期：此步驟會有錯誤（App.tsx 尚未更新），但確認 Grid.tsx 本身語法無誤即可。

- [ ] **步驟 7：Commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils add frontend/src/components/Grid.tsx
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils commit -m "feat: pass hoveredCell and onHoverLeave through Grid"
  ```

---

## Task 3：App.tsx — 串接 `hoveredCell` 狀態

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **步驟 1：新增 `hoveredCell` state（緊接在 `cursorInfo` 之後）**

  ```ts
  const [hoveredCell, setHoveredCell] = useState<{ reelIndex: number; rowIndex: number } | null>(null)
  ```

- [ ] **步驟 2：更新 `handleMouseDown`，移除 `setCursorInfo`**

  ```ts
  const handleMouseDown = useCallback((reel: number, row: number) => {
    startDrag(reel, row)
  }, [startDrag])
  ```

- [ ] **步驟 3：更新 `handleMouseEnter`，無條件更新 cursorInfo 與 hoveredCell**

  ```ts
  const handleMouseEnter = useCallback((reel: number, row: number) => {
    if (isDragging) updateDrag(reel, row)
    const cell = grid[reel]?.[row] ?? { id: 92, bt: 0, w: 1, l: 1 }
    setCursorInfo({ reelIndex: reel, rowIndex: row, cell })
    setHoveredCell({ reelIndex: reel, rowIndex: row })
  }, [isDragging, updateDrag, grid])
  ```

- [ ] **步驟 4：在 `handleRandomize` 之後加入 `handleHoverLeave`**

  ```ts
  const handleHoverLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])
  ```

- [ ] **步驟 5：更新 `<Grid>` JSX，傳入 `hoveredCell` 與 `onHoverLeave`**

  ```tsx
  <Grid
    grid={grid}
    layout={layout}
    isHighlighted={isHighlighted}
    selectedCell={cursorInfo}
    hoveredCell={hoveredCell}
    onMouseDown={handleMouseDown}
    onMouseEnter={handleMouseEnter}
    onMouseUp={handleMouseUp}
    onHoverLeave={handleHoverLeave}
  />
  ```

- [ ] **步驟 6：TypeScript 型別檢查確認無誤**

  ```bash
  cd /Users/shun/Development/gdxworkspace/slot-board-utils/frontend && npx tsc --noEmit
  ```

  預期：無輸出（無錯誤）。

- [ ] **步驟 7：執行測試確認全過**

  ```bash
  cd /Users/shun/Development/gdxworkspace/slot-board-utils/frontend && npm test -- --run
  ```

  預期：`14 passed`。

- [ ] **步驟 8：Commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils add frontend/src/App.tsx
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils commit -m "feat: hover updates cursorInfo and cell highlight in App"
  ```

---

## Task 4：Toolbar.tsx — 按鈕改名為 RNG

**Files:**
- Modify: `frontend/src/components/Toolbar.tsx`

- [ ] **步驟 1：將 JSX 中「隨機」文字改為「RNG」**

  找到：
  ```tsx
  >
    隨機
  </button>
  ```

  改為：
  ```tsx
  >
    RNG
  </button>
  ```

- [ ] **步驟 2：執行測試確認全過**

  ```bash
  cd /Users/shun/Development/gdxworkspace/slot-board-utils/frontend && npm test -- --run
  ```

  預期：`14 passed`。

- [ ] **步驟 3：Commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils add frontend/src/components/Toolbar.tsx
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils commit -m "feat: rename randomize button to RNG"
  ```
