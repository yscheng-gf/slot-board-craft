# GitHub Actions Release Pipeline — 設計規格

**日期：** 2026-06-04

## 概覽

Push `v*` tag 時自動觸發：
- macOS universal binary 打包成 DMG
- Windows amd64 `.exe` 另外壓成 `.zip`
- 建立 GitHub Release，附上兩平台產物

---

## 觸發條件

```yaml
on:
  push:
    tags:
      - 'v*'
```

---

## Job 架構

```
build-macos (macos-latest) ──┐
                              ├──▶ release (ubuntu-latest)
build-windows (windows-latest) ┘
```

### `build-macos`

| 項目 | 值 |
|------|-----|
| Runner | `macos-latest` |
| Go | 1.26 |
| Node | 20 |
| Wails | v2.12.0 |
| 目標平台 | `darwin/universal`（Intel + Apple Silicon 雙架構） |
| 簽名 | 無（ad-hoc） |
| 產物 | `SlotBoardCraft-<tag>-macOS.dmg` |

DMG 打包用 macOS 內建 `hdiutil`：
```bash
hdiutil create \
  -volname "Slot Board Craft" \
  -srcfolder "build/bin/Slot Board Craft.app" \
  -ov -format UDZO \
  "SlotBoardCraft-${GITHUB_REF_NAME}-macOS.dmg"
```

### `build-windows`

| 項目 | 值 |
|------|-----|
| Runner | `windows-latest` |
| Go | 1.26 |
| Node | 20 |
| Wails | v2.12.0 |
| 目標平台 | `windows/amd64` |
| CGO | 需要 gcc；從 `C:\msys64\mingw64\bin` 加入 PATH |
| 產物 | `Slot Board Craft.exe` + `SlotBoardCraft-<tag>-Windows.zip` |

ZIP 打包：將 `.exe` 壓成 `SlotBoardCraft-<tag>-Windows.zip`。

### `release`

| 項目 | 值 |
|------|-----|
| Runner | `ubuntu-latest` |
| 依賴 | `needs: [build-macos, build-windows]` |
| 權限 | `permissions: contents: write` |
| Action | `softprops/action-gh-release@v2` |
| Release 標題 | tag 名稱（如 `v1.0.0`） |
| 附件 | `.dmg` + `.exe` + `.zip` |

---

## go.mod 更新

Go directive 從 `1.23.0` 升到 `1.26`：
```
go 1.26
```

---

## 檔案路徑

```
.github/
  workflows/
    release.yml
```

---

## Secrets

只需內建的 `GITHUB_TOKEN`，不需額外設定。

---

## 不在範圍內

- code signing / notarization
- Linux build
- 自動更新版本號（`go.mod` 的 go directive 手動維護）
- Release notes 自動從 git log 生成
