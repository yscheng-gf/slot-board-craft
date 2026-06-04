# Cell 顏色與隨機盤面 — 設計規格

**日期：** 2026-06-04

## 概覽

兩個獨立的 UI 改進：

1. **Cell 背景色** — 每個 symbol ID 對應一個固定背景色，讓盤面一眼可辨。
2. **隨機盤面按鈕** — Toolbar 新增按鈕，將目前 layout 的每個格子填入從 `favoriteIds` 隨機選出的 ID。

---

## 功能一：Cell 背景色

### 顏色映射策略

使用**黃金比例 HSL hash**，將任意整數 symbol ID 映射到視覺上有區別的色相：

```
hue = (id * 137.508) % 360
color = hsl(hue, 55%, 28%)   // 深色主題適用
```

黃金比例乘數（≈ 137.5°）是色相環上最「無理數」的旋轉角，能讓任意兩個相鄰 ID 的色差最大化。舉例來說，ID 91 和 92 的色相差約 137°，而非 1°。

**特殊情況：**
- `id === 0`（附屬格，被大格覆蓋）：永不渲染，不需處理。
- `id === 92`（預設空格）：使用中性深灰（`#1f2937`），保留「空白」的視覺感。

### BT 邊框邏輯（不變）

現有的 `BT_BORDER`（`0=灰 / 1=銀 / 2=金`）維持不動。底色負責傳達 ID 身份，邊框色負責傳達 BT 等級。

### 實作

- 在 `Cell.tsx` 新增純函式 `idToColor(id: number): string`。
- 將 `Cell.tsx` 中寫死的背景色（`#1f2937`）替換為 `idToColor(id)`。
- 拖曳高亮（`isHighlighted`）仍優先覆蓋為 `#2563eb`，確保拖曳回饋清晰可見。

---

## 功能二：隨機盤面按鈕

### 行為

- 按鈕文字：**隨機**
- 位置：Toolbar 最右側，BT 輸入欄之後。
- 點擊後：將目前 grid 的每個格子替換為從 `favoriteIds` 均勻隨機選出的 ID（`bt=0`、`w=1`、`l=1`）。
- Layout **不變** — reel 數和 row 數維持原樣。
- 若 `favoriteIds` 為空，按鈕 disabled。

### 資料流

```
Toolbar (onClick) → App (handleRandomize) → useGrid.randomizeBoard(favoriteIds)
```

### `useGrid` 新增 `randomizeBoard`

```ts
randomizeBoard(favoriteIds: number[]): void
```

依目前 `layout` 重建 grid：每個 reel 的每個 row 從 `favoriteIds` 隨機取一個 ID，`bt=0`、`w=1`、`l=1`（隨機盤面不產生跨格 symbol）。

---

## 異動檔案

| 檔案 | 改動 |
|------|------|
| `frontend/src/components/Cell.tsx` | 新增 `idToColor()`，替換 `bg` |
| `frontend/src/hooks/useGrid.ts` | 新增 `randomizeBoard(favoriteIds)` |
| `frontend/src/hooks/useGrid.test.ts` | 補 `randomizeBoard` 測試 |
| `frontend/src/components/Toolbar.tsx` | 新增隨機按鈕與 `onRandomize` prop |
| `frontend/src/App.tsx` | 串接 `handleRandomize` → `randomizeBoard` |

不需新增檔案，不影響 types、`generateJson` 及 Go backend。

---

## 不在範圍內

- 自訂調色盤
- 隨機化 layout（reel 數、row 數保持不變）
- 隨機盤面產生跨格 symbol（統一輸出 1×1）
