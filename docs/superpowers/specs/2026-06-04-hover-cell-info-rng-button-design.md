# Hover Cell 資訊更新 & RNG 按鈕 — 設計規格

**日期：** 2026-06-04

## 概覽

兩個獨立的 UI 小改動：

1. **Hover 更新 cursorInfo** — 滑鼠移到 cell 上時即時更新右側 info panel，並給 cell 輕微亮色回饋。
2. **按鈕改名為 RNG** — 將 Toolbar 的「隨機」文字改成「RNG」。

---

## 功能一：Hover 更新 Cell 資訊

### 行為

- 滑鼠 hover 到任一格子時，右側 info panel 立即顯示該格的資訊（reelIndex、rowIndex、id、bt、w、l）。
- 點擊（mouseDown）不再負責更新 cursorInfo。原 `handleMouseDown` 只保留 `startDrag` 的職責。
- `isSelected`（粉紅框）維持不變，仍標示上次放置位置（`placeSymbol` 後設定）。

### 視覺

- Cell 加入 `isHovered` prop（`boolean`）。
- 背景色優先級：`isHighlighted`（拖曳藍 `#2563eb`）> `isHovered`（輕微亮）> `idToColor(id)`（基色）。
- Hover 亮色：在 Cell 內用 `idToColorHover(id)` 計算，規則和 `idToColor` 相同，但 lightness 從 28% 提升到 44%。
  - id=0 → `#4b5563`
  - id=92 → `#374151`
  - 其他 → `hsl(hue, 55%, 44%)`

### 資料流

```
Grid (onMouseEnter) → App.handleMouseEnter(reel, row)
  → setCursorInfo({ reelIndex, rowIndex, cell })
  → setHoveredCell({ reelIndex, rowIndex })
```

App 持有 `hoveredCell: { reelIndex: number, rowIndex: number } | null` state，透過 `isHovered` prop 傳給 `Grid` → `Cell`。

### 實作

| 檔案 | 改動 |
|------|------|
| `App.tsx` | 新增 `hoveredCell` state；`handleMouseEnter` 無條件更新 `cursorInfo` 與 `hoveredCell`；`handleMouseDown` 移除 `setCursorInfo` 呼叫 |
| `Grid.tsx` | 新增 `hoveredCell` prop；傳 `isHovered` 給 `Cell` |
| `Cell.tsx` | 新增 `isHovered` prop 與 `idToColorHover()` 函式；更新背景色邏輯 |

---

## 功能二：RNG 按鈕

`Toolbar.tsx` 中 JSX 內的「隨機」文字改為「RNG」。一行改動，無其他影響。

---

## 不在範圍內

- 點擊後仍觸發 cursorInfo（hover 取代點擊）
- Hover 時顯示 tooltip 或 popover
- 拖曳時的 hover 行為（拖曳高亮仍優先）
