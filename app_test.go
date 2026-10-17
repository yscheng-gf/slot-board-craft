// app_test.go
package main

import "testing"

func TestSaveConfigThenGetConfigRoundTripsThemeId(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	a := NewApp()
	want := Config{FavoriteIds: []int{1, 2}, LastLayout: "3,3,3", ThemeId: "dragonball"}
	if err := a.SaveConfig(want); err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}

	got := a.GetConfig()
	if got.ThemeId != want.ThemeId {
		t.Fatalf("ThemeId = %q, want %q", got.ThemeId, want.ThemeId)
	}
}

func TestGetConfigDefaultsThemeIdWhenNoConfigExists(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	a := NewApp()
	got := a.GetConfig()
	if got.ThemeId != defaultConfig.ThemeId {
		t.Fatalf("ThemeId = %q, want default %q", got.ThemeId, defaultConfig.ThemeId)
	}
}
