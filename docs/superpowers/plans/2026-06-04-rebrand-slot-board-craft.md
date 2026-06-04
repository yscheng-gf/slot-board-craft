# 專案改名與 App Icon 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將專案名稱改為 `slot-board-craft`、app 顯示名稱改為 `Slot Board Craft`，並生成 slot game 風格 app icon 取代預設圖示。

**Architecture:** 設定檔改名（`wails.json`、`go.mod`、`main.go`）；Python + Pillow 程式化生成 1024×1024 icon PNG，存為 `build/appicon.png`。

**Tech Stack:** Go, Wails v2, Python 3 + Pillow

---

## Task 1：設定檔改名

**Files:**
- Modify: `wails.json`
- Modify: `go.mod`
- Modify: `main.go`

- [ ] **步驟 1：更新 `wails.json`**

  將 `/Users/shun/Development/gdxworkspace/slot-board-utils/wails.json` 完整替換為：

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

- [ ] **步驟 2：更新 `go.mod` 模組名稱**

  `/Users/shun/Development/gdxworkspace/slot-board-utils/go.mod` 第一行改為：

  ```
  module slot-board-craft
  ```

- [ ] **步驟 3：更新 `main.go` 視窗標題**

  `/Users/shun/Development/gdxworkspace/slot-board-utils/main.go` 中：

  ```go
  Title:  "slot-board-utils",
  ```

  改為：

  ```go
  Title:  "Slot Board Craft",
  ```

- [ ] **步驟 4：確認 `app.go` 無模組路徑 import，跳過**

  `app.go` 不含 `slot-board-utils` 路徑，無需改動。

- [ ] **步驟 5：驗證 Go build 無錯誤**

  ```bash
  cd /Users/shun/Development/gdxworkspace/slot-board-utils && go build ./...
  ```

  預期：無錯誤輸出。

- [ ] **步驟 6：Commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils add wails.json go.mod main.go
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils commit -m "chore: rename project to slot-board-craft"
  ```

---

## Task 2：生成 App Icon

**Files:**
- Create: `scripts/gen_icon.py`
- Modify: `build/appicon.png`（由腳本生成）

- [ ] **步驟 1：安裝 Pillow**

  ```bash
  pip3 install Pillow
  ```

  預期：`Successfully installed Pillow-...`（或已安裝）。

- [ ] **步驟 2：建立 `scripts/` 目錄並建立 `gen_icon.py`**

  建立 `/Users/shun/Development/gdxworkspace/slot-board-utils/scripts/gen_icon.py`，內容如下：

  ```python
  #!/usr/bin/env python3
  """生成 slot game 風格 app icon（1024x1024 PNG）"""
  import os, math
  from PIL import Image, ImageDraw, ImageFont, ImageFilter

  SIZE = 1024
  OUT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'build', 'appicon.png'))

  def gradient_bg(size: int) -> Image.Image:
      img = Image.new('RGBA', (size, size))
      draw = ImageDraw.Draw(img)
      for y in range(size):
          t = y / (size - 1)
          r = int(13 + 13 * t)
          g = int(13 - 3 * t)
          b = int(26 + 20 * t)
          draw.line([(0, y), (size - 1, y)], fill=(r, g, b, 255))
      return img

  def draw_gold_border(draw: ImageDraw.ImageDraw, size: int) -> None:
      margin, radius = 56, 110
      for i in range(6):
          alpha = int(255 - i * 38)
          draw.rounded_rectangle(
              [margin + i, margin + i, size - margin - i, size - margin - i],
              radius=radius,
              outline=(255, 200, 50, alpha),
              width=1,
          )

  def find_font(size: int):
      candidates = [
          '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
          '/System/Library/Fonts/Helvetica.ttc',
          '/Library/Fonts/Arial Bold.ttf',
          '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      ]
      for path in candidates:
          if os.path.exists(path):
              try:
                  return ImageFont.truetype(path, size)
              except Exception:
                  continue
      return ImageFont.load_default()

  def draw_seven_glow(img: Image.Image, font) -> Image.Image:
      """繪製金色「7」主體與光暈"""
      text = '7'
      # 計算文字位置
      tmp = ImageDraw.Draw(img)
      bbox = font.getbbox(text)
      tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
      tx = (SIZE - tw) // 2 - bbox[0]
      ty = (SIZE - th) // 2 - bbox[1] - 40

      # 光暈層（獨立圖層後模糊）
      glow = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
      gd = ImageDraw.Draw(glow)
      for alpha in [60, 100, 150]:
          gd.text((tx, ty), text, fill=(255, 200, 50, alpha), font=font)
      glow = glow.filter(ImageFilter.GaussianBlur(radius=22))
      img = Image.alpha_composite(img, glow)

      # 主體金色文字
      d = ImageDraw.Draw(img)
      d.text((tx, ty), text, fill=(255, 215, 0, 255), font=font)
      # 高光
      d.text((tx - 5, ty - 5), text, fill=(255, 255, 220, 80), font=font)
      return img

  def draw_stars(draw: ImageDraw.ImageDraw) -> None:
      for cx, cy, base_r in [(175, 175, 14), (245, 135, 10), (135, 245, 10)]:
          for r in range(base_r, 0, -3):
              alpha = int(220 * r / base_r)
              draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                           fill=(255, 215, 50, alpha))

  def main():
      img = gradient_bg(SIZE)
      draw = ImageDraw.Draw(img)
      draw_gold_border(draw, SIZE)
      draw_stars(draw)
      font = find_font(600)
      img = draw_seven_glow(img, font)
      # 合成到 RGB
      bg = Image.new('RGB', (SIZE, SIZE), (13, 13, 26))
      bg.paste(img, mask=img.split()[3])
      bg.save(OUT)
      print(f'Icon saved → {OUT}')

  if __name__ == '__main__':
      main()
  ```

- [ ] **步驟 3：執行腳本生成 icon**

  ```bash
  cd /Users/shun/Development/gdxworkspace/slot-board-utils && python3 scripts/gen_icon.py
  ```

  預期輸出：`Icon saved → .../build/appicon.png`

- [ ] **步驟 4：確認圖片生成**

  ```bash
  python3 -c "from PIL import Image; img=Image.open('build/appicon.png'); print(img.size, img.mode)"
  ```

  預期：`(1024, 1024) RGB`

- [ ] **步驟 5：Commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils add scripts/gen_icon.py build/appicon.png
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils commit -m "feat: add slot game style app icon and gen_icon.py script"
  ```
