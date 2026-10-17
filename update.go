// update.go
package main

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"

	"github.com/minio/selfupdate"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

const githubRepo = "yscheng-gf/slot-board-craft"
const defaultGithubAPIBase = "https://api.github.com"

// executableName is the raw binary name inside the release archives (matches
// wails.json's outputfilename), used to locate the file to update to.
const executableName = "Slot Board Craft"

type UpdateInfo struct {
	HasUpdate      bool   `json:"hasUpdate"`
	CurrentVersion string `json:"currentVersion"`
	LatestVersion  string `json:"latestVersion"`
	ReleaseURL     string `json:"releaseUrl"`
}

type releaseAsset struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
}

type githubRelease struct {
	TagName string         `json:"tag_name"`
	HTMLURL string         `json:"html_url"`
	Assets  []releaseAsset `json:"assets"`
}

// hasNewVersion 比較目前版號與最新 release tag（都忽略開頭的 "v"）。
func hasNewVersion(current, latestTag string) bool {
	return strings.TrimPrefix(current, "v") != strings.TrimPrefix(latestTag, "v")
}

// updateAssetSuffix 回傳指定平台用來自動更新的 release asset 檔名結尾；
// 不支援自動更新的平台回傳空字串。
func updateAssetSuffix(goos string) string {
	switch goos {
	case "darwin":
		return "macOS.tar.gz"
	case "windows":
		return "Windows.zip"
	default:
		return ""
	}
}

// pickUpdateAsset 在 release assets 裡找出符合目前平台的自動更新壓縮檔網址。
func pickUpdateAsset(assets []releaseAsset, goos string) (string, bool) {
	suffix := updateAssetSuffix(goos)
	if suffix == "" {
		return "", false
	}
	for _, asset := range assets {
		if strings.HasSuffix(asset.Name, suffix) {
			return asset.BrowserDownloadURL, true
		}
	}
	return "", false
}

func (a *App) apiBase() string {
	if a.githubAPIBase != "" {
		return a.githubAPIBase
	}
	return defaultGithubAPIBase
}

// CheckUpdate 查詢 GitHub 最新 release，回傳是否有更新可用。
func (a *App) CheckUpdate() UpdateInfo {
	info := UpdateInfo{
		CurrentVersion: a.version,
		LatestVersion:  a.version,
		ReleaseURL:     fmt.Sprintf("https://github.com/%s/releases", githubRepo),
	}

	resp, err := http.Get(fmt.Sprintf("%s/repos/%s/releases/latest", a.apiBase(), githubRepo))
	if err != nil {
		return info
	}
	defer resp.Body.Close()

	var release githubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return info
	}

	info.LatestVersion = release.TagName
	if release.HTMLURL != "" {
		info.ReleaseURL = release.HTMLURL
	}

	if hasNewVersion(a.version, release.TagName) {
		info.HasUpdate = true
		a.latestVersion = release.TagName
		if url, ok := pickUpdateAsset(release.Assets, runtime.GOOS); ok {
			a.updateURL = url
		}
	}

	return info
}

// PerformUpdate 下載更新壓縮檔並套用，回傳 "ok" 或錯誤訊息（給前端顯示）。
func (a *App) PerformUpdate() string {
	if a.updateURL == "" {
		return "此平台尚無可用的自動更新檔案"
	}

	resp, err := http.Get(a.updateURL)
	if err != nil {
		return "下載更新失敗: " + err.Error()
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Sprintf("下載更新失敗 HTTP Status: %d", resp.StatusCode)
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "讀取更新檔失敗: " + err.Error()
	}

	var exeReader io.Reader
	switch {
	case strings.HasSuffix(a.updateURL, ".tar.gz"):
		exeReader, err = extractTarGz(bodyBytes)
	case strings.HasSuffix(a.updateURL, ".zip"):
		exeReader, err = extractZip(bodyBytes)
	default:
		return "未知的更新檔案格式"
	}
	if err != nil {
		return "解壓縮更新檔失敗: " + err.Error()
	}

	if err := selfupdate.Apply(exeReader, selfupdate.Options{}); err != nil {
		return "套用更新檔失敗: " + err.Error()
	}

	// macOS `.app` 簽名與版號修復：覆寫執行檔後，舊的 _CodeSignature 會與新的二進位不符，
	// 導致「檔案毀損」錯誤；順便把 Info.plist 的版號更新成最新版。
	if runtime.GOOS == "darwin" {
		exe, err := os.Executable()
		if err == nil && strings.Contains(exe, ".app/Contents/MacOS/") {
			contentsDir := filepath.Dir(filepath.Dir(exe))

			os.RemoveAll(filepath.Join(contentsDir, "_CodeSignature"))

			plistPath := filepath.Join(contentsDir, "Info.plist")
			if plistData, err := os.ReadFile(plistPath); err == nil {
				latest := strings.TrimPrefix(a.lastCheckedLatestVersion(), "v")
				reVersion := regexp.MustCompile(`(<key>CFBundleVersion</key>\s*<string>).*?(</string>)`)
				reShortVersion := regexp.MustCompile(`(<key>CFBundleShortVersionString</key>\s*<string>).*?(</string>)`)
				newData := reVersion.ReplaceAll(plistData, []byte("${1}"+latest+"${2}"))
				newData = reShortVersion.ReplaceAll(newData, []byte("${1}"+latest+"${2}"))
				os.WriteFile(plistPath, newData, 0644)
			}
		}
	}

	return "ok"
}

// lastCheckedLatestVersion 回傳最近一次 CheckUpdate 查到的最新版號（給 Info.plist 修復用）。
func (a *App) lastCheckedLatestVersion() string {
	if a.latestVersion != "" {
		return a.latestVersion
	}
	return a.version
}

// OpenURL 用系統預設瀏覽器開啟網址（給「手動下載」按鈕用）。
func (a *App) OpenURL(url string) {
	wailsruntime.BrowserOpenURL(a.ctx, url)
}

// Quit 結束應用程式（讓使用者可以手動重啟以完成更新）。
func (a *App) Quit() {
	wailsruntime.Quit(a.ctx)
}

// Restart 重新啟動應用程式：先開一個新的執行個體，再結束目前這個。
func (a *App) Restart() {
	exe, err := os.Executable()
	if err == nil {
		if runtime.GOOS == "darwin" {
			if idx := strings.Index(exe, ".app/Contents/MacOS/"); idx != -1 {
				appPath := exe[:idx+4] // 包含 ".app"
				exec.Command("open", "-n", appPath).Start()
			} else {
				exec.Command(exe).Start()
			}
		} else {
			exec.Command(exe).Start()
		}
	}
	a.Quit()
}

// extractTarGz 從 tar.gz payload 裡取出名稱符合 executableName 的那個檔案。
func extractTarGz(payload []byte) (io.Reader, error) {
	gzr, err := gzip.NewReader(bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	defer gzr.Close()

	tr := tar.NewReader(gzr)
	for {
		header, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		if header.Typeflag != tar.TypeReg || filepath.Base(header.Name) != executableName {
			continue
		}
		var buf bytes.Buffer
		if _, err := io.Copy(&buf, tr); err != nil {
			return nil, err
		}
		return &buf, nil
	}
	return nil, errors.New("找不到執行檔於 tar.gz 中")
}

// extractZip 從 zip payload 裡取出唯一的 .exe 項目。
func extractZip(payload []byte) (io.Reader, error) {
	zr, err := zip.NewReader(bytes.NewReader(payload), int64(len(payload)))
	if err != nil {
		return nil, err
	}

	for _, f := range zr.File {
		if f.FileInfo().IsDir() || !strings.EqualFold(filepath.Ext(f.Name), ".exe") {
			continue
		}
		rc, err := f.Open()
		if err != nil {
			return nil, err
		}
		defer rc.Close()
		var buf bytes.Buffer
		if _, err := io.Copy(&buf, rc); err != nil {
			return nil, err
		}
		return &buf, nil
	}
	return nil, errors.New("找不到執行檔 \".exe\" 於 zip 中")
}
