# Slot Board GUI 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Wails v2 + React + TypeScript + Tailwind 建立跨平台 slot 盤面視覺化編輯器，支援拖曳填充合併格子、常用 ID chip、即時 JSON 產出。

**Architecture:** Go 後端只處理設定檔讀寫與剪貼簿；所有盤面邏輯（state、拖曳、JSON 產生）在 React/TypeScript 前端實作。盤面用絕對定位渲染，支援任意 W×L 合併格子。

**Tech Stack:** Wails v2.12, Go 1.22+, React 18, TypeScript, Tailwind CSS v3, Vitest

---

## 檔案結構

```
slot-board-utils/
├── main.go                          # Wails 進入點（scaffold，幾乎不動）
├── app.go                           # Go backend：Config、CopyToClipboard、GetConfig、SaveConfig
├── go.mod / go.sum
├── wails.json
├── frontend/
│   ├── src/
│   │   ├── types.ts                 # TypeScript 型別定義
│   │   ├── utils/
│   │   │   ├── generateJson.ts      # JSON 產生邏輯（從 CLI 移植）
│   │   │   └── generateJson.test.ts # Vitest 測試
│   │   ├── hooks/
│   │   │   ├── useGrid.ts           # 盤面狀態管理
│   │   │   ├── useGrid.test.ts      # Vitest 測試
│   │   │   └── useDrag.ts           # 拖曳互動狀態
│   │   ├── components/
│   │   │   ├── Cell.tsx             # 單格 / 合併格子渲染
│   │   │   ├── Grid.tsx             # 完整盤面
│   │   │   ├── Toolbar.tsx          # 工具列（layout 輸入、ID chip、BT）
│   │   │   └── RightPanel.tsx       # 游標資訊 + JSON + 複製按鈕
│   │   ├── App.tsx                  # Root：三欄佈局
│   │   ├── main.tsx                 # React entry（scaffold）
│   │   └── index.css                # Tailwind directives
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── docs/
    └── superpowers/
        ├── specs/2026-06-04-slot-board-gui-design.md
        └── plans/2026-06-04-slot-board-gui.md
```

---

## Task 1: Wails 專案初始化 + Tailwind 設定

**Files:**
- Create: `main.go`, `app.go`, `wails.json`, `go.mod`, `frontend/` (全部由 scaffold 產生)
- Create: `frontend/src/index.css`
- Create: `frontend/tailwind.config.js`
- Modify: `frontend/vite.config.ts`

- [ ] **Step 1: 備份既有目錄內容，在父目錄初始化 Wails 專案**

```bash
# 在 /Users/shun/Development/xgd 執行
cd /Users/shun/Development/xgd

# 備份既有內容
cp -r slot-board-utils/docs /tmp/slot-board-utils-docs-backup
cp -r slot-board-utils/.superpowers /tmp/slot-board-utils-superpowers-backup

# 刪除目錄讓 wails init 重建
rm -rf slot-board-utils

# 初始化 Wails 專案（react-ts template）
wails init -n slot-board-utils -t react-ts
```

- [ ] **Step 2: 還原備份，進入專案目錄**

```bash
cp -r /tmp/slot-board-utils-docs-backup /Users/shun/Development/xgd/slot-board-utils/docs
cp -r /tmp/slot-board-utils-superpowers-backup /Users/shun/Development/xgd/slot-board-utils/.superpowers
cd /Users/shun/Development/xgd/slot-board-utils
```

- [ ] **Step 3: 安裝 Tailwind CSS v3**

```bash
cd frontend
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 4: 設定 tailwind.config.js**

```js
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 5: 替換 index.css 為 Tailwind directives**

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: 確認 Tailwind 已加入 main.tsx 的 import**

開啟 `frontend/src/main.tsx`，確認有這行（scaffold 通常已包含）：
```tsx
import './index.css'
```

- [ ] **Step 7: 加入 Vitest 設定**

```bash
cd /Users/shun/Development/xgd/slot-board-utils/frontend
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

修改 `frontend/vite.config.ts`：
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

建立 `frontend/src/test-setup.ts`：
```ts
import '@testing-library/jest-dom'
```

在 `frontend/package.json` 的 `scripts` 加入：
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 8: 驗證專案可以啟動**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
wails dev
```

預期：瀏覽器（或 Wails 視窗）顯示預設的 React scaffold 畫面，無 console 錯誤。

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: init Wails + React + TypeScript + Tailwind project"
```

---

## Task 2: TypeScript 型別定義

**Files:**
- Create: `frontend/src/types.ts`

- [ ] **Step 1: 建立 types.ts**

```ts
// frontend/src/types.ts

export type Cell = {
  id: number
  bt: number   // 0=正常, 1=銀框, 2=金框
  w: number    // 橫跨 reel 數
  l: number    // 縱跨 row 數
}

export type Grid = Cell[][]  // Grid[reelIndex][rowIndex]

export type Config = {
  favoriteIds: number[]
  lastLayout: string
}

export type CursorInfo = {
  reelIndex: number
  rowIndex: number
  cell: Cell
} | null
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: JSON 產生邏輯（TDD）

**Files:**
- Create: `frontend/src/utils/generateJson.ts`
- Create: `frontend/src/utils/generateJson.test.ts`

- [ ] **Step 1: 建立失敗測試**

```ts
// frontend/src/utils/generateJson.test.ts
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
    expect(result.main_game[0][0][0]).toMatchObject({ id: 92, l: 1, w: 1, i: 0 })
    expect(result.main_game[0][0][1]).toMatchObject({ id: 92, l: 1, w: 1, i: 1 })
    expect(result.main_game[0][1][0]).toMatchObject({ id: 92, l: 1, w: 1, i: 2 })
    expect(result.main_game[0][1][1]).toMatchObject({ id: 92, l: 1, w: 1, i: 3 })
  })

  it('id=0 的格子輸出為 null', () => {
    const grid: Grid = [
      [{ id: 1, bt: 0, w: 2, l: 1 }, { id: 92, bt: 0, w: 1, l: 1 }],
      [{ id: 0, bt: 0, w: 1, l: 1 }, { id: 92, bt: 0, w: 1, l: 1 }],
    ]
    const result = JSON.parse(generateJson(grid))
    expect(result.main_game[0][1][0]).toBeNull()
  })

  it('bt=0 時不輸出 bt 欄位', () => {
    const grid: Grid = [[{ id: 3, bt: 0, w: 1, l: 1 }]]
    const result = JSON.parse(generateJson(grid))
    expect(result.main_game[0][0][0]).not.toHaveProperty('bt')
  })

  it('bt!=0 時輸出 bt 欄位', () => {
    const grid: Grid = [[{ id: 3, bt: 2, w: 1, l: 1 }]]
    const result = JSON.parse(generateJson(grid))
    expect(result.main_game[0][0][0].bt).toBe(2)
  })

  it('index 從左到右、從上到下遞增', () => {
    const grid: Grid = [
      [{ id: 1, bt: 0, w: 1, l: 1 }, { id: 2, bt: 0, w: 1, l: 1 }],
      [{ id: 3, bt: 0, w: 1, l: 1 }, { id: 4, bt: 0, w: 1, l: 1 }],
    ]
    const result = JSON.parse(generateJson(grid))
    expect(result.main_game[0][0][0].i).toBe(0)
    expect(result.main_game[0][0][1].i).toBe(1)
    expect(result.main_game[0][1][0].i).toBe(2)
    expect(result.main_game[0][1][1].i).toBe(3)
  })

  it('外層結構為 main_game > array > reelData', () => {
    const grid: Grid = [[{ id: 92, bt: 0, w: 1, l: 1 }]]
    const result = JSON.parse(generateJson(grid))
    expect(result).toHaveProperty('main_game')
    expect(Array.isArray(result.main_game)).toBe(true)
    expect(Array.isArray(result.main_game[0])).toBe(true)
  })
})
```

- [ ] **Step 2: 執行測試，確認失敗**

```bash
cd /Users/shun/Development/xgd/slot-board-utils/frontend
npm test
```

預期：FAIL，找不到 `./generateJson` module。

- [ ] **Step 3: 實作 generateJson.ts**

```ts
// frontend/src/utils/generateJson.ts
import type { Grid } from '../types'

type SymbolOut = {
  id: number
  bt?: number
  l: number
  w: number
  i: number
}

export function generateJson(grid: Grid): string {
  let idxCounter = 0
  const reelData = grid.map((reel) =>
    reel.map((cell): SymbolOut | null => {
      const i = idxCounter++
      if (cell.id === 0) return null
      return {
        id: cell.id,
        ...(cell.bt !== 0 && { bt: cell.bt }),
        l: cell.l,
        w: cell.w,
        i,
      }
    })
  )
  return JSON.stringify({ main_game: [reelData] })
}
```

- [ ] **Step 4: 執行測試，確認全部通過**

```bash
npm test
```

預期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
git add frontend/src/utils/
git commit -m "feat: add JSON generation utility with tests"
```

---

## Task 4: Go 後端（設定檔 + 剪貼簿）

**Files:**
- Modify: `app.go`（取代 scaffold 的預設內容）

- [ ] **Step 1: 安裝 clipboard 套件**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
go get github.com/atotto/clipboard
```

- [ ] **Step 2: 撰寫 app.go**

```go
// app.go
package main

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/atotto/clipboard"
)

type Config struct {
	FavoriteIds []int  `json:"favoriteIds"`
	LastLayout  string `json:"lastLayout"`
}

var defaultConfig = Config{
	FavoriteIds: []int{0, 1, 2, 3, 11, 91, 92},
	LastLayout:  "3,4,5,5,4,3",
}

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func configPath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "slot-board-utils", "config.json"), nil
}

func (a *App) GetConfig() Config {
	path, err := configPath()
	if err != nil {
		return defaultConfig
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return defaultConfig
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return defaultConfig
	}
	return cfg
}

func (a *App) SaveConfig(cfg Config) error {
	path, err := configPath()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func (a *App) CopyToClipboard(text string) error {
	return clipboard.WriteAll(text)
}
```

- [ ] **Step 3: 確認 main.go 已正確呼叫 NewApp（scaffold 通常已包含）**

開啟 `main.go`，確認內容類似：
```go
package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()
	err := wails.Run(&options.App{
		Title:  "Slot Board Utils",
		Width:  1200,
		Height: 700,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}
```

若 `Width`/`Height` 預設值較小，將其改為 `1200, 700`。

- [ ] **Step 4: 編譯確認無錯誤**

```bash
go build ./...
```

預期：無錯誤輸出。

- [ ] **Step 5: Commit**

```bash
git add app.go go.mod go.sum main.go
git commit -m "feat: add Go backend for config and clipboard"
```

---

## Task 5: useGrid Hook（TDD）

**Files:**
- Create: `frontend/src/hooks/useGrid.ts`
- Create: `frontend/src/hooks/useGrid.test.ts`

- [ ] **Step 1: 建立失敗測試**

```ts
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
})
```

- [ ] **Step 2: 執行測試，確認失敗**

```bash
npm test
```

預期：FAIL，找不到 `./useGrid` module。

- [ ] **Step 3: 實作 useGrid.ts**

```ts
// frontend/src/hooks/useGrid.ts
import { useState, useCallback } from 'react'
import type { Grid, Cell } from '../types'

function makeCell(id = 92): Cell {
  return { id, bt: 0, w: 1, l: 1 }
}

function buildGrid(layout: number[]): Grid {
  return layout.map((rows) => Array.from({ length: rows }, () => makeCell()))
}

export function useGrid(initialLayout: number[] = [3, 4, 5, 5, 4, 3]) {
  const [layout, setLayout] = useState(initialLayout)
  const [grid, setGrid] = useState<Grid>(() => buildGrid(initialLayout))

  const rebuildGrid = useCallback((newLayout: number[]) => {
    setLayout(newLayout)
    setGrid(buildGrid(newLayout))
  }, [])

  const placeSymbol = useCallback(
    (reelStart: number, rowStart: number, w: number, l: number, id: number, bt: number) => {
      setGrid((prev) => {
        const numReels = prev.length
        // 截斷超出邊界的 w
        const safeW = Math.min(w, numReels - reelStart)
        // 截斷超出邊界的 l
        const safeL = Math.min(l, (prev[reelStart]?.length ?? 0) - rowStart)

        const next: Grid = prev.map((reel) => reel.map((cell) => ({ ...cell })))

        // 附屬格設為 id=0
        for (let dx = 0; dx < safeW; dx++) {
          for (let dy = 0; dy < safeL; dy++) {
            if (dx === 0 && dy === 0) continue
            if (next[reelStart + dx]?.[rowStart + dy] !== undefined) {
              next[reelStart + dx][rowStart + dy] = makeCell(0)
            }
          }
        }

        // 主格
        next[reelStart][rowStart] = { id, bt, w: safeW, l: safeL }
        return next
      })
    },
    []
  )

  return { layout, grid, rebuildGrid, placeSymbol }
}
```

- [ ] **Step 4: 執行測試，確認全部通過**

```bash
npm test
```

預期：全部 PASS。

- [ ] **Step 5: Commit**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
git add frontend/src/hooks/useGrid.ts frontend/src/hooks/useGrid.test.ts
git commit -m "feat: add useGrid hook with tests"
```

---

## Task 6: useDrag Hook

**Files:**
- Create: `frontend/src/hooks/useDrag.ts`

- [ ] **Step 1: 實作 useDrag.ts**

```ts
// frontend/src/hooks/useDrag.ts
import { useState, useCallback } from 'react'

type DragState = {
  startReel: number
  startRow: number
  currentReel: number
  currentRow: number
}

export type DragResult = {
  reelStart: number
  rowStart: number
  w: number
  l: number
}

export function useDrag() {
  const [drag, setDrag] = useState<DragState | null>(null)

  const startDrag = useCallback((reel: number, row: number) => {
    setDrag({ startReel: reel, startRow: row, currentReel: reel, currentRow: row })
  }, [])

  const updateDrag = useCallback((reel: number, row: number) => {
    setDrag((prev) => (prev ? { ...prev, currentReel: reel, currentRow: row } : null))
  }, [])

  const endDrag = useCallback((): DragResult | null => {
    if (!drag) return null
    const reelStart = Math.min(drag.startReel, drag.currentReel)
    const rowStart = Math.min(drag.startRow, drag.currentRow)
    const w = Math.abs(drag.currentReel - drag.startReel) + 1
    const l = Math.abs(drag.currentRow - drag.startRow) + 1
    setDrag(null)
    return { reelStart, rowStart, w, l }
  }, [drag])

  const isHighlighted = useCallback(
    (reel: number, row: number): boolean => {
      if (!drag) return false
      const minReel = Math.min(drag.startReel, drag.currentReel)
      const maxReel = Math.max(drag.startReel, drag.currentReel)
      const minRow = Math.min(drag.startRow, drag.currentRow)
      const maxRow = Math.max(drag.startRow, drag.currentRow)
      return reel >= minReel && reel <= maxReel && row >= minRow && row <= maxRow
    },
    [drag]
  )

  const isDragging = drag !== null

  return { isDragging, startDrag, updateDrag, endDrag, isHighlighted }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
git add frontend/src/hooks/useDrag.ts
git commit -m "feat: add useDrag hook for grid interaction"
```

---

## Task 7: Cell 元件

**Files:**
- Create: `frontend/src/components/Cell.tsx`

常數定義：
- `CELL_W = 56` px（單格寬）
- `CELL_H = 44` px（單格高）
- `GAP = 4` px（格間距）

- [ ] **Step 1: 實作 Cell.tsx**

```tsx
// frontend/src/components/Cell.tsx

export const CELL_W = 56
export const CELL_H = 44
export const GAP = 4

const BT_BORDER: Record<number, string> = {
  0: '#4b5563', // 灰
  1: '#9ca3af', // 銀
  2: '#f59e0b', // 金
}

type Props = {
  id: number
  bt: number
  w: number
  l: number
  reelIndex: number
  rowIndex: number
  isHighlighted: boolean
  isSelected: boolean
  onMouseDown: (reel: number, row: number) => void
  onMouseEnter: (reel: number, row: number) => void
  onMouseUp: () => void
}

export function Cell({
  id, bt, w, l,
  reelIndex, rowIndex,
  isHighlighted, isSelected,
  onMouseDown, onMouseEnter, onMouseUp,
}: Props) {
  const left = reelIndex * (CELL_W + GAP)
  const top = rowIndex * (CELL_H + GAP)
  const width = w * CELL_W + (w - 1) * GAP
  const height = l * CELL_H + (l - 1) * GAP

  const bg = isHighlighted ? '#2563eb' : '#1f2937'
  const borderColor = BT_BORDER[bt] ?? BT_BORDER[0]
  const ring = isSelected ? '0 0 0 2px #ec4899' : 'none'

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        background: bg,
        borderColor,
        boxShadow: ring,
        zIndex: w > 1 || l > 1 ? 10 : 5,
      }}
      className="border-2 rounded flex items-center justify-center cursor-pointer select-none relative"
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(reelIndex, rowIndex) }}
      onMouseEnter={() => onMouseEnter(reelIndex, rowIndex)}
      onMouseUp={onMouseUp}
    >
      <span className="text-sm font-mono text-gray-100">{id}</span>
      {(w > 1 || l > 1) && (
        <span className="absolute top-0.5 right-1 text-[9px] text-gray-400">
          {w}×{l}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
git add frontend/src/components/Cell.tsx
git commit -m "feat: add Cell component with merge support"
```

---

## Task 8: Grid 元件

**Files:**
- Create: `frontend/src/components/Grid.tsx`

Grid 用兩層渲染：
1. **底層（hit targets）**：所有 (reel, row) 位置的透明 div，捕捉滑鼠事件
2. **上層（cells）**：只渲染 id≠0 的格子（含合併格子）

- [ ] **Step 1: 實作 Grid.tsx**

```tsx
// frontend/src/components/Grid.tsx
import { useCallback } from 'react'
import type { Grid as GridType, CursorInfo } from '../types'
import { Cell, CELL_W, CELL_H, GAP } from './Cell'

type Props = {
  grid: GridType
  layout: number[]
  isHighlighted: (reel: number, row: number) => boolean
  selectedCell: CursorInfo
  onMouseDown: (reel: number, row: number) => void
  onMouseEnter: (reel: number, row: number) => void
  onMouseUp: () => void
}

export function Grid({
  grid,
  layout,
  isHighlighted,
  selectedCell,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}: Props) {
  const maxRows = Math.max(...layout)
  const containerWidth = layout.length * (CELL_W + GAP) - GAP
  const containerHeight = maxRows * (CELL_H + GAP) - GAP

  const isSelected = useCallback(
    (reel: number, row: number) =>
      selectedCell?.reelIndex === reel && selectedCell?.rowIndex === row,
    [selectedCell]
  )

  return (
    <div
      style={{ position: 'relative', width: containerWidth, height: containerHeight }}
      onMouseLeave={onMouseUp}
    >
      {/* Layer 1: hit targets */}
      {layout.map((rows, reelIdx) =>
        Array.from({ length: rows }, (_, rowIdx) => (
          <div
            key={`hit-${reelIdx}-${rowIdx}`}
            style={{
              position: 'absolute',
              left: reelIdx * (CELL_W + GAP),
              top: rowIdx * (CELL_H + GAP),
              width: CELL_W,
              height: CELL_H,
              zIndex: 1,
              background: isHighlighted(reelIdx, rowIdx) ? '#1d4ed8' : '#111827',
              borderRadius: 4,
              border: '2px solid #374151',
            }}
            onMouseDown={(e) => { e.preventDefault(); onMouseDown(reelIdx, rowIdx) }}
            onMouseEnter={() => onMouseEnter(reelIdx, rowIdx)}
            onMouseUp={onMouseUp}
          />
        ))
      )}

      {/* Layer 2: visible cells */}
      {grid.map((reel, reelIdx) =>
        reel.map((cell, rowIdx) =>
          cell.id !== 0 ? (
            <Cell
              key={`cell-${reelIdx}-${rowIdx}`}
              id={cell.id}
              bt={cell.bt}
              w={cell.w}
              l={cell.l}
              reelIndex={reelIdx}
              rowIndex={rowIdx}
              isHighlighted={isHighlighted(reelIdx, rowIdx)}
              isSelected={isSelected(reelIdx, rowIdx)}
              onMouseDown={onMouseDown}
              onMouseEnter={onMouseEnter}
              onMouseUp={onMouseUp}
            />
          ) : null
        )
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
git add frontend/src/components/Grid.tsx
git commit -m "feat: add Grid component with two-layer rendering"
```

---

## Task 9: Toolbar 元件

**Files:**
- Create: `frontend/src/components/Toolbar.tsx`

- [ ] **Step 1: 實作 Toolbar.tsx**

```tsx
// frontend/src/components/Toolbar.tsx
import { useState, useRef } from 'react'

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
}

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
}: Props) {
  const [idInput, setIdInput] = useState('')
  const [addInput, setAddInput] = useState('')
  const idInputRef = useRef<HTMLInputElement>(null)

  function handleLayoutKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onLayoutChange((e.target as HTMLInputElement).value)
    }
  }

  function handleIdKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = parseInt(idInput, 10)
      if (!isNaN(val)) onSelectId(val)
      setIdInput('')
    }
  }

  function handleAddKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = parseInt(addInput, 10)
      if (!isNaN(val) && !favoriteIds.includes(val)) onAddFavorite(val)
      setAddInput('')
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-700 flex-wrap">
      {/* Layout 輸入 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Layout:</span>
        <input
          defaultValue={layoutInput}
          onKeyDown={handleLayoutKey}
          className="bg-gray-800 text-gray-100 text-sm px-2 py-1 rounded border border-gray-600 w-36 font-mono"
          placeholder="3,4,5,5,4,3"
        />
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* 常用 ID chip */}
      <div className="flex items-center gap-1 flex-wrap">
        {favoriteIds.map((fid) => (
          <button
            key={fid}
            onClick={() => onSelectId(fid)}
            onContextMenu={(e) => { e.preventDefault(); onRemoveFavorite(fid) }}
            className={`px-2 py-0.5 rounded text-xs font-mono border transition-colors ${
              selectedId === fid
                ? 'bg-pink-600 border-pink-400 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
            title="右鍵刪除"
          >
            {fid}
          </button>
        ))}

        {/* 新增 chip */}
        <input
          value={addInput}
          onChange={(e) => setAddInput(e.target.value)}
          onKeyDown={handleAddKey}
          className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded border border-dashed border-gray-600 w-12 font-mono text-center"
          placeholder="+"
          title="輸入 ID 後按 Enter 新增"
        />
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* 自由輸入 ID */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">ID:</span>
        <input
          ref={idInputRef}
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          onKeyDown={handleIdKey}
          className="bg-gray-800 text-gray-100 text-sm px-2 py-1 rounded border border-gray-600 w-16 font-mono text-center"
          placeholder={String(selectedId)}
        />
      </div>

      {/* BT */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">BT:</span>
        <input
          type="number"
          min={0}
          max={2}
          value={selectedBt}
          onChange={(e) => onBtChange(Number(e.target.value))}
          className="bg-gray-800 text-gray-100 text-sm px-2 py-1 rounded border border-gray-600 w-12 font-mono text-center"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
git add frontend/src/components/Toolbar.tsx
git commit -m "feat: add Toolbar component"
```

---

## Task 10: RightPanel 元件

**Files:**
- Create: `frontend/src/components/RightPanel.tsx`

- [ ] **Step 1: 實作 RightPanel.tsx**

```tsx
// frontend/src/components/RightPanel.tsx
import { useState } from 'react'
import type { CursorInfo } from '../types'
import { CopyToClipboard } from '../../wailsjs/go/main/App'

type Props = {
  cursorInfo: CursorInfo
  json: string
}

export function RightPanel({ cursorInfo, json }: Props) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'err'>('idle')

  async function handleCopy() {
    try {
      await CopyToClipboard(json)
      setCopyStatus('ok')
    } catch {
      setCopyStatus('err')
    }
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  const copyLabel =
    copyStatus === 'ok' ? '已複製！' : copyStatus === 'err' ? '複製失敗' : '複製到剪貼簿'
  const copyClass =
    copyStatus === 'ok'
      ? 'bg-green-700 border-green-500'
      : copyStatus === 'err'
      ? 'bg-red-700 border-red-500'
      : 'bg-gray-700 border-gray-500 hover:bg-gray-600'

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 p-3 gap-3">
      {/* 游標資訊 */}
      <div className="bg-gray-800 rounded p-3 text-sm">
        <div className="text-xs text-gray-400 mb-2">游標位置</div>
        {cursorInfo ? (
          <div className="space-y-1 font-mono text-gray-200">
            <div>Reel <span className="text-pink-400">{cursorInfo.reelIndex}</span>, Row <span className="text-pink-400">{cursorInfo.rowIndex}</span></div>
            <div>ID: <span className="text-yellow-300">{cursorInfo.cell.id}</span></div>
            <div>BT: <span className="text-yellow-300">{cursorInfo.cell.bt}</span></div>
            <div>W: <span className="text-yellow-300">{cursorInfo.cell.w}</span>  L: <span className="text-yellow-300">{cursorInfo.cell.l}</span></div>
          </div>
        ) : (
          <div className="text-gray-500 text-xs">點擊格子查看資訊</div>
        )}
      </div>

      {/* JSON 輸出 */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="text-xs text-gray-400 mb-1">JSON（即時）</div>
        <pre className="flex-1 bg-gray-800 rounded p-2 text-[10px] text-cyan-300 font-mono overflow-auto break-all whitespace-pre-wrap min-h-0">
          {JSON.stringify(JSON.parse(json), null, 2)}
        </pre>
      </div>

      {/* 複製按鈕 */}
      <button
        onClick={handleCopy}
        className={`w-full py-1.5 rounded border text-sm text-gray-100 transition-colors ${copyClass}`}
      >
        {copyLabel}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
git add frontend/src/components/RightPanel.tsx
git commit -m "feat: add RightPanel component"
```

---

## Task 11: App Root 整合

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 撰寫 App.tsx**

```tsx
// frontend/src/App.tsx
import { useState, useCallback, useEffect } from 'react'
import { useGrid } from './hooks/useGrid'
import { useDrag } from './hooks/useDrag'
import { generateJson } from './utils/generateJson'
import { Grid } from './components/Grid'
import { Toolbar } from './components/Toolbar'
import { RightPanel } from './components/RightPanel'
import { GetConfig, SaveConfig } from '../wailsjs/go/main/App'
import type { CursorInfo, Config } from './types'

const DEFAULT_LAYOUT_STR = '3,4,5,5,4,3'

function parseLayout(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0)
}

export default function App() {
  const [layoutInput, setLayoutInput] = useState(DEFAULT_LAYOUT_STR)
  const [selectedId, setSelectedId] = useState(0)
  const [selectedBt, setSelectedBt] = useState(0)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([0, 1, 2, 3, 11, 91, 92])
  const [cursorInfo, setCursorInfo] = useState<CursorInfo>(null)

  const { layout, grid, rebuildGrid, placeSymbol } = useGrid(parseLayout(DEFAULT_LAYOUT_STR))
  const { isDragging, startDrag, updateDrag, endDrag, isHighlighted } = useDrag()

  const json = generateJson(grid)

  // 載入設定
  useEffect(() => {
    GetConfig().then((cfg: Config) => {
      if (cfg.favoriteIds?.length) setFavoriteIds(cfg.favoriteIds)
      if (cfg.lastLayout) {
        setLayoutInput(cfg.lastLayout)
        rebuildGrid(parseLayout(cfg.lastLayout))
      }
    }).catch(() => {})
  }, [])

  // 儲存設定（favoriteIds 或 layoutInput 改變時）
  useEffect(() => {
    SaveConfig({ favoriteIds, lastLayout: layoutInput }).catch(() => {})
  }, [favoriteIds, layoutInput])

  const handleLayoutChange = useCallback((raw: string) => {
    const nums = parseLayout(raw)
    if (nums.length === 0) return
    setLayoutInput(raw)
    rebuildGrid(nums)
  }, [rebuildGrid])

  const handleMouseDown = useCallback((reel: number, row: number) => {
    startDrag(reel, row)
    setCursorInfo({ reelIndex: reel, rowIndex: row, cell: grid[reel]?.[row] ?? { id: 92, bt: 0, w: 1, l: 1 } })
  }, [startDrag, grid])

  const handleMouseEnter = useCallback((reel: number, row: number) => {
    if (isDragging) updateDrag(reel, row)
  }, [isDragging, updateDrag])

  const handleMouseUp = useCallback(() => {
    const result = endDrag()
    if (!result) return
    placeSymbol(result.reelStart, result.rowStart, result.w, result.l, selectedId, selectedBt)
    const placedCell = { id: selectedId, bt: selectedBt, w: result.w, l: result.l }
    setCursorInfo({ reelIndex: result.reelStart, rowIndex: result.rowStart, cell: placedCell })
  }, [endDrag, placeSymbol, selectedId, selectedBt])

  const handleAddFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => [...prev, id])
  }, [])

  const handleRemoveFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => prev.filter((f) => f !== id))
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
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
      />
      <div className="flex flex-1 min-h-0">
        {/* 左側盤面 */}
        <div className="flex-1 overflow-auto p-6 flex items-start justify-start">
          <Grid
            grid={grid}
            layout={layout}
            isHighlighted={isHighlighted}
            selectedCell={cursorInfo}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseUp={handleMouseUp}
          />
        </div>
        {/* 右側面板 */}
        <div className="w-72 flex-shrink-0">
          <RightPanel cursorInfo={cursorInfo} json={json} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 清除 scaffold 的舊內容**

確認 `frontend/src/App.tsx` 已完全被上方內容取代（刪除 scaffold 的預設 `App` component）。

確認 `frontend/src/main.tsx` 如下（一般 scaffold 已正確）：
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: 產生 Wails JS bindings**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
wails generate module
```

確認 `frontend/wailsjs/go/main/App.js` 和對應 `.d.ts` 已產生，包含 `CopyToClipboard`、`GetConfig`、`SaveConfig`。

- [ ] **Step 4: 執行開發模式驗證**

```bash
wails dev
```

手動測試以下流程：
1. 啟動後看到盤面（預設 `3,4,5,5,4,3`，格子全為 92）
2. 點擊 ID chip `0` → selectedId 切換
3. 點擊格子 → 格子顯示新 ID，右側面板顯示游標資訊，JSON 即時更新
4. 拖曳多格 → 形成合併格子，顯示 `W×L` 標示
5. 修改 Layout 為 `3,3,3` 按 Enter → 盤面重建
6. 點「複製到剪貼簿」→ 成功訊息，剪貼簿有 JSON

- [ ] **Step 5: 執行所有測試**

```bash
cd /Users/shun/Development/xgd/slot-board-utils/frontend
npm test
```

預期：全部 PASS。

- [ ] **Step 6: Commit**

```bash
cd /Users/shun/Development/xgd/slot-board-utils
git add frontend/src/App.tsx frontend/src/main.tsx
git commit -m "feat: wire up App root and complete slot board GUI"
```

---

## Task 12: 建置最終產出（可選）

**Files:** `build/bin/slot-board-utils` (macOS) 或 `build/bin/slot-board-utils.exe` (Windows)

- [ ] **Step 1: 建置 production binary**

```bash
wails build
```

預期：`build/bin/` 下出現對應平台的可執行檔。

- [ ] **Step 2: 執行 binary 確認**

```bash
open build/bin/slot-board-utils.app  # macOS
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: final build verification"
```

---

## 自我審查

**Spec 覆蓋確認：**
- ✅ 跨平台（Wails 處理）
- ✅ 上工具列 + 左盤面 + 右面板（Task 11 App.tsx）
- ✅ 常用 ID chip 可新增/刪除，持久化（Task 4、11）
- ✅ 自由輸入 ID（Toolbar）
- ✅ Layout 文字輸入重建盤面（Task 5、11）
- ✅ 單擊填入 w=1, l=1（Task 11 handleMouseUp）
- ✅ 拖曳決定 W/L，視覺合併（Task 6 useDrag + Task 7 Cell）
- ✅ JSON 即時更新（Task 11，generateJson 在 render 呼叫）
- ✅ JSON 格式與 CLI 完全相同（Task 3 generateJson.ts）
- ✅ 複製到剪貼簿（Task 4 Go backend + Task 10 RightPanel）
- ✅ 設定檔讀寫（Task 4 Go backend）
- ✅ 初始格子預設 id=92（Task 5 useGrid）
- ✅ BT 邊框顏色（Task 7 Cell、Task 8 Grid）
