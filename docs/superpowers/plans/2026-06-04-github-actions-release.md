# GitHub Actions Release Pipeline 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 GitHub Actions workflow，push `v*` tag 時自動 build macOS universal DMG 與 Windows exe+zip，並發佈 GitHub Release。

**Architecture:** 兩個平台 build job（macos-latest / windows-latest）並行執行，產物上傳 artifact 後由 release job 統一下載並建立 GitHub Release。Go directive 升至 1.26。

**Tech Stack:** GitHub Actions, Wails v2.12.0, Go 1.26, Node 20, softprops/action-gh-release@v2

---

## Task 1：更新 go.mod 到 Go 1.26

**Files:**
- Modify: `go.mod`

- [ ] **步驟 1：更新 go directive**

  將 `/Users/shun/Development/gdxworkspace/slot-board-utils/go.mod` 第三行：
  ```
  go 1.23.0
  ```
  改為：
  ```
  go 1.26
  ```

- [ ] **步驟 2：確認 Go build 無錯誤**

  ```bash
  cd /Users/shun/Development/gdxworkspace/slot-board-utils && go build ./...
  ```

  預期：無輸出（無錯誤）。

- [ ] **步驟 3：Commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils add go.mod
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils commit -m "chore: upgrade go directive to 1.26"
  ```

---

## Task 2：建立 `.github/workflows/release.yml`

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **步驟 1：建立目錄並寫入 workflow 檔案**

  建立目錄：
  ```bash
  mkdir -p /Users/shun/Development/gdxworkspace/slot-board-utils/.github/workflows
  ```

  建立 `/Users/shun/Development/gdxworkspace/slot-board-utils/.github/workflows/release.yml`，內容如下：

  ```yaml
  name: Release

  on:
    push:
      tags:
        - 'v*'

  jobs:
    build-macos:
      runs-on: macos-latest
      steps:
        - uses: actions/checkout@v4

        - uses: actions/setup-go@v5
          with:
            go-version: '1.26'

        - uses: actions/setup-node@v4
          with:
            node-version: '20'

        - name: Install Wails
          run: go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0

        - name: Build macOS (universal)
          run: wails build -platform darwin/universal

        - name: Create DMG
          run: |
            hdiutil create \
              -volname "Slot Board Craft" \
              -srcfolder "build/bin/Slot Board Craft.app" \
              -ov -format UDZO \
              "SlotBoardCraft-${{ github.ref_name }}-macOS.dmg"

        - name: Upload macOS DMG
          uses: actions/upload-artifact@v4
          with:
            name: macos-dmg
            path: "SlotBoardCraft-${{ github.ref_name }}-macOS.dmg"

    build-windows:
      runs-on: windows-latest
      steps:
        - uses: actions/checkout@v4

        - name: Add mingw to PATH
          run: echo "C:\msys64\mingw64\bin" | Out-File -FilePath $env:GITHUB_PATH -Encoding utf8 -Append

        - uses: actions/setup-go@v5
          with:
            go-version: '1.26'

        - uses: actions/setup-node@v4
          with:
            node-version: '20'

        - name: Install Wails
          run: go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0

        - name: Build Windows
          run: wails build -platform windows/amd64

        - name: Create ZIP
          run: |
            Compress-Archive `
              -Path "build\bin\Slot Board Craft.exe" `
              -DestinationPath "SlotBoardCraft-${{ github.ref_name }}-Windows.zip"

        - name: Upload Windows EXE
          uses: actions/upload-artifact@v4
          with:
            name: windows-exe
            path: "build/bin/Slot Board Craft.exe"

        - name: Upload Windows ZIP
          uses: actions/upload-artifact@v4
          with:
            name: windows-zip
            path: "SlotBoardCraft-${{ github.ref_name }}-Windows.zip"

    release:
      needs: [build-macos, build-windows]
      runs-on: ubuntu-latest
      permissions:
        contents: write
      steps:
        - name: Download all artifacts
          uses: actions/download-artifact@v4
          with:
            merge-multiple: true

        - name: Create GitHub Release
          uses: softprops/action-gh-release@v2
          with:
            files: |
              SlotBoardCraft-*-macOS.dmg
              Slot Board Craft.exe
              SlotBoardCraft-*-Windows.zip
  ```

- [ ] **步驟 2：驗證 YAML 語法**

  ```bash
  python3 -c "import yaml; yaml.safe_load(open('/Users/shun/Development/gdxworkspace/slot-board-utils/.github/workflows/release.yml'))" && echo "YAML OK"
  ```

  預期：`YAML OK`

- [ ] **步驟 3：Commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils add .github/workflows/release.yml
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils commit -m "ci: add GitHub Actions release workflow for v* tags"
  ```

---

## Task 3：驗證 workflow 觸發設定正確

**Files:** 無（驗證步驟）

- [ ] **步驟 1：確認 workflow 檔案存在且內容正確**

  ```bash
  cat /Users/shun/Development/gdxworkspace/slot-board-utils/.github/workflows/release.yml
  ```

  確認：
  - `on.push.tags` 為 `['v*']`
  - 三個 job 都在：`build-macos`、`build-windows`、`release`
  - `release` job 有 `needs: [build-macos, build-windows]`
  - `release` job 有 `permissions: contents: write`

- [ ] **步驟 2：確認 git log 顯示兩個 commit**

  ```bash
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils log --oneline -3
  ```

  預期最新兩筆：
  ```
  <sha> ci: add GitHub Actions release workflow for v* tags
  <sha> chore: upgrade go directive to 1.26
  ```

- [ ] **步驟 3：說明如何手動測試**

  若要驗證 pipeline 實際執行：
  ```bash
  # 確認 remote 已設定
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils remote -v

  # 推送 tag 觸發 workflow（在 remote 已設定時執行）
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils tag v0.1.0
  git -C /Users/shun/Development/gdxworkspace/slot-board-utils push origin v0.1.0
  ```

  在 GitHub → Actions 頁面確認 workflow 開始執行。
