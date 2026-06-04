# 專案改名與 App Icon — 設計規格

**日期：** 2026-06-04

## 概覽

兩個改動：

1. **專案改名** — 從 `slot-board-utils` 改成 `slot-board-craft`，app 顯示名稱改為 `Slot Board Craft`。
2. **App Icon** — 程式化生成 slot game 風格圖示，替換預設 icon。

---

## 功能一：專案改名

### 異動檔案

| 檔案 | 改動 |
|------|------|
| `wails.json` | `name` → `slot-board-craft`；`outputfilename` → `slot-board-craft`；新增 `info` 區塊設定 `productName: "Slot Board Craft"` |
| `go.mod` | `module slot-board-utils` → `module slot-board-craft` |
| `main.go` | 若 import 路徑含 `slot-board-utils` 則更新 |
| `app.go` | 同上 |

### wails.json 目標格式

```json
{
  "$schema": "https://wails.io/schemas/config.v2.json",
  "name": "slot-board-craft",
  "outputfilename": "slot-board-craft",
  "info": {
    "productName": "Slot Board Craft"
  },
  "frontend:install": "npm install",
  "frontend:build": "npm run build",
  "frontend:dev:watcher": "npm run dev",
  "frontend:dev:serverUrl": "auto",
  "author": {
    "name": "Shun",
    "email": "a7932677@gmail.com"
  }
}
```

### 不需要改動

- 實際資料夾名稱（保持 `slot-board-utils/`，只是本機目錄）
- `build/darwin/Info.plist` — 已使用 `{{.Info.ProductName}}` template，自動套用
- `build/windows/info.json` — 同上，自動套用

---

## 功能二：App Icon

### 規格

- 尺寸：1024×1024 PNG
- 輸出路徑：`build/appicon.png`（Wails 會在 build 時自動產出 `.icns` 和 `.ico`）

### 視覺設計

- **背景：** 深紫黑漸層（`#0d0d1a` → `#1a0a2e`）
- **外框：** 金色漸層圓角矩形，帶輕微發光效果
- **主體：** 超大金色「7」，加放射狀光暈（模擬 neon glow）
- **細節：** 左上角三顆小金星作為點綴

### 生成方式

用 Python + Pillow 程式化繪製，腳本存在 `scripts/gen_icon.py`，執行後直接覆蓋 `build/appicon.png`。

```
python3 scripts/gen_icon.py
```

---

## 不在範圍內

- 重新命名本機資料夾
- 手動修改 `.icns` / `.ico`（由 `wails build` 自動處理）
- App Store 或 Notarization 相關設定
