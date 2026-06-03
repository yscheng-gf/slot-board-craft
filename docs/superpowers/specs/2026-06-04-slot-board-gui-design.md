# Slot Board GUI 設計文件

**日期**: 2026-06-04
**專案**: slot-board-utils
**參考**: slot-screen-cli (TUI 版本)

---

## 目標

建立一個跨平台（macOS / Windows）的 GUI 工具，讓開發者可以透過視覺化介面快速配置 slot 盤面，並即時產出 debug 用的 JSON 輸出。

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 桌面框架 | Wails v2 |
| 後端語言 | Go 1.22+ |
| 前端框架 | React 18 + TypeScript |
| 樣式 | Tailwind CSS v3 |

---

## 架構分工

### Go 後端（`backend/app.go`）

負責兩件事：

1. **設定檔讀寫**：持久化常用 ID chip 清單與上次使用的 layout 字串，儲存於 Wails 預設的 appdata 目錄（`~/.config/slot-board-utils/config.json` 或 Windows 對應路徑）。
2. **剪貼簿操作**：透過 `github.com/atotto/clipboard` 套件，提供 `CopyToClipboard(text string) error` 方法給前端呼叫。

### React 前端

承擔所有盤面邏輯：

- 盤面狀態管理（grid、selectedID、BT）
- JSON 產生（TypeScript 實作，格式與 CLI 完全相同）
- 拖曳互動
- 即時 JSON 更新

---

## 資料結構

### TypeScript

```ts
// 單一格子
type Cell = {
  id: number
  bt: number   // 0=正常, 1=銀, 2=金
  w: number    // 橫跨 reel 數
  l: number    // 縱跨 row 數
}

// 盤面：Grid[reelIndex][rowIndex]
type Grid = Cell[][]

// 工具列狀態
type ToolbarState = {
  layoutInput: string      // e.g. "3,4,5,5,4,3"
  layout: number[]         // 解析後的數字陣列
  selectedId: number
  selectedBt: number
  favoriteIds: number[]    // 常用 ID chip 清單（持久化）
}
```

### JSON 輸出格式（與 CLI 完全相同）

```json
{
  "main_game": [
    [
      [
        { "id": 0, "bt": 0, "l": 1, "w": 1, "i": 0 },
        { "id": 1, "l": 1, "w": 1, "i": 1 }
      ],
      [
        { "id": 2, "l": 2, "w": 2, "i": 3 }
      ]
    ]
  ]
}
```

規則：`id=0` 的格子（被大 symbol 覆蓋的附屬格）不輸出到陣列中，`i` 為線性 index（從左到右、從上到下遞增）。

---

## UI 設計

### 整體佈局

```
┌──────────────────────────────────────────────────────────────────┐
│ [3,4,5,5,4,3] [重建]  [0][1][2][3][11][91][92][+]  ID:[  ] BT:[0]│ ← 工具列
├─────────────────────────────────────┬────────────────────────────┤
│                                     │ 游標位置                   │
│           盤面 Grid                  │ Reel 2, Row 1              │
│                                     │ ID: 14  BT: 0              │
│                                     │ W: 2    L: 2               │
│                                     ├────────────────────────────┤
│                                     │ JSON (即時)                │
│                                     │ {"main_game":[[[...]]]}    │
│                                     │                            │
│                                     │ [複製到剪貼簿]              │
└─────────────────────────────────────┴────────────────────────────┘
  ← 約 65% 寬 →                         ← 約 35% 寬 →
```

---

### 工具列（頂部）

| 元件 | 行為 |
|------|------|
| Layout 輸入框 | 輸入 `3,4,5,5,4,3`，按 Enter 重建盤面（重置所有格子） |
| 常用 ID chip | 點擊即切換 selectedId，右鍵或 × 可刪除，`+` 按鈕新增 |
| ID 輸入框 | 輸入任意整數，Enter 確認並更新 selectedId |
| BT 輸入框 | 輸入 0/1/2，即時更新 selectedBt |
| W × L 顯示 | 唯讀，顯示最後一次操作的 w 和 l（拖曳後更新） |

---

### 盤面（左側）

#### 初始狀態

盤面重建時，所有格子預設 ID=92、BT=0、W=1、L=1（與 CLI 行為一致）。

#### 格子渲染

- 一般格子：固定寬高，顯示 ID，邊框顏色依 BT（0=灰、1=銀、2=金）
- 合併格子（w>1 或 l>1）：視覺上合併成一個大格，ID 顯示在中央，右上角標示 `WxL`
- 被大格覆蓋的附屬格：不渲染（視覺空間被大格佔用）

#### 互動

| 操作 | 行為 |
|------|------|
| 單擊格子 | 套用目前 selectedId / selectedBt，w=1, l=1 |
| 拖曳（mousedown → mouseup）| 起點為左上角，終點決定 w（reel 跨度）和 l（row 跨度），套用後視覺合併 |
| 拖曳中 | 即時高亮預覽所有涵蓋的格子 |
| 邊界檢查 | 跨度超出盤面時截斷到合法範圍，不報錯 |

#### 大格子渲染規則

起點 `(reelX, rowY)`，`w` 個 reel × `l` 個 row：
- 在 CSS Grid 中，起點格子使用 `grid-column: span w`、`grid-row: span l`
- 附屬位置（非起點）的格子渲染為隱藏（`display: none`）

---

### 右側面板

**上半（游標資訊）**
- 顯示最後點擊或拖曳結束的格子：Reel、Row、ID、BT、W、L

**下半（JSON 輸出）**
- `<pre>` 區塊，monospace 字型，自動更新
- JSON 格式化顯示（pretty-print，縮排 2 格）
- 「複製到剪貼簿」按鈕：呼叫 Go 後端 `CopyToClipboard()`，成功後按鈕短暫顯示「已複製！」

---

## 設定檔格式

儲存於 OS appdata 目錄：

```json
{
  "favoriteIds": [0, 1, 2, 3, 11, 91, 92],
  "lastLayout": "3,4,5,5,4,3"
}
```

啟動時讀取，修改 chip 清單時立即寫回。

---

## 錯誤處理

| 情況 | 處理方式 |
|------|---------|
| Layout 輸入非數字 | 忽略非數字 token，僅套用合法部分 |
| Layout 為空 | 不重建，保留目前盤面 |
| 剪貼簿複製失敗 | 按鈕顯示「複製失敗」，不中斷操作 |
| 設定檔讀取失敗 | 使用預設值（favoriteIds: [], lastLayout: "3,4,5,5,4,3"） |

---

## 不在範圍內

- Symbol 名稱顯示（只顯示 ID 數字）
- 多個盤面同時編輯
- Undo/Redo
- 盤面儲存/載入（只有剪貼簿輸出）
