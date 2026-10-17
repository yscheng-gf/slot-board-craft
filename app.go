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
	ThemeId     string `json:"themeId"`
}

var defaultConfig = Config{
	FavoriteIds: []int{0, 1, 2, 3, 11, 91, 92},
	LastLayout:  "3,4,5,5,4,3",
	ThemeId:     "default",
}

type App struct {
	ctx context.Context

	version       string
	latestVersion string
	updateURL     string
	githubAPIBase string // 測試用，留空則使用真正的 GitHub API
}

func NewApp(version string) *App {
	return &App{version: version}
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
