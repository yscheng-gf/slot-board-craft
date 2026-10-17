// update_test.go
package main

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHasNewVersionReturnsFalseForSameVersionRegardlessOfVPrefix(t *testing.T) {
	cases := [][2]string{
		{"0.1.0", "0.1.0"},
		{"v0.1.0", "0.1.0"},
		{"0.1.0", "v0.1.0"},
		{"v0.1.0", "v0.1.0"},
	}
	for _, c := range cases {
		if hasNewVersion(c[0], c[1]) {
			t.Errorf("hasNewVersion(%q, %q) = true, want false", c[0], c[1])
		}
	}
}

func TestHasNewVersionReturnsTrueForDifferentVersion(t *testing.T) {
	if !hasNewVersion("0.1.0", "v0.2.0") {
		t.Fatal("hasNewVersion(0.1.0, v0.2.0) = false, want true")
	}
}

func TestUpdateAssetSuffixUnsupportedGOOSReturnsEmpty(t *testing.T) {
	if s := updateAssetSuffix("linux"); s != "" {
		t.Fatalf("updateAssetSuffix(linux) = %q, want empty", s)
	}
}

func TestPickUpdateAssetMatchesSuffixForGOOS(t *testing.T) {
	assets := []releaseAsset{
		{Name: "SlotBoardCraft-v0.2.0-macOS.dmg", BrowserDownloadURL: "https://example.com/dmg"},
		{Name: "SlotBoardCraft-v0.2.0-macOS.tar.gz", BrowserDownloadURL: "https://example.com/targz"},
		{Name: "SlotBoardCraft-v0.2.0-Windows.exe", BrowserDownloadURL: "https://example.com/exe"},
		{Name: "SlotBoardCraft-v0.2.0-Windows.zip", BrowserDownloadURL: "https://example.com/zip"},
	}

	url, ok := pickUpdateAsset(assets, "darwin")
	if !ok || url != "https://example.com/targz" {
		t.Fatalf("darwin: got (%q, %v), want (https://example.com/targz, true)", url, ok)
	}

	url, ok = pickUpdateAsset(assets, "windows")
	if !ok || url != "https://example.com/zip" {
		t.Fatalf("windows: got (%q, %v), want (https://example.com/zip, true)", url, ok)
	}
}

func TestPickUpdateAssetReturnsFalseWhenNoAssetMatches(t *testing.T) {
	assets := []releaseAsset{{Name: "SlotBoardCraft-v0.2.0-macOS.dmg", BrowserDownloadURL: "https://example.com/dmg"}}
	if _, ok := pickUpdateAsset(assets, "windows"); ok {
		t.Fatal("expected no match for windows, got a match")
	}
}

func TestExtractTarGzReturnsTheSingleRegularFileIgnoringAppleDoubleEntries(t *testing.T) {
	var buf bytes.Buffer
	gzw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gzw)

	// macOS tar often includes "._Name" AppleDouble metadata entries alongside the real file.
	junk := []byte{0, 1, 2}
	if err := tw.WriteHeader(&tar.Header{Name: "._Slot Board Craft", Size: int64(len(junk)), Typeflag: tar.TypeReg}); err != nil {
		t.Fatal(err)
	}
	if _, err := tw.Write(junk); err != nil {
		t.Fatal(err)
	}

	want := []byte("fake-executable-bytes")
	if err := tw.WriteHeader(&tar.Header{Name: "Slot Board Craft", Size: int64(len(want)), Typeflag: tar.TypeReg}); err != nil {
		t.Fatal(err)
	}
	if _, err := tw.Write(want); err != nil {
		t.Fatal(err)
	}
	tw.Close()
	gzw.Close()

	r, err := extractTarGz(buf.Bytes())
	if err != nil {
		t.Fatalf("extractTarGz failed: %v", err)
	}
	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != string(want) {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestExtractTarGzIgnoresUnrelatedFilesAndOnlyReturnsTheExecutableByName(t *testing.T) {
	var buf bytes.Buffer
	gzw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gzw)

	decoy := []byte("not the executable")
	if err := tw.WriteHeader(&tar.Header{Name: "README.txt", Size: int64(len(decoy)), Typeflag: tar.TypeReg}); err != nil {
		t.Fatal(err)
	}
	if _, err := tw.Write(decoy); err != nil {
		t.Fatal(err)
	}

	want := []byte("fake-executable-bytes")
	if err := tw.WriteHeader(&tar.Header{Name: executableName, Size: int64(len(want)), Typeflag: tar.TypeReg}); err != nil {
		t.Fatal(err)
	}
	if _, err := tw.Write(want); err != nil {
		t.Fatal(err)
	}
	tw.Close()
	gzw.Close()

	r, err := extractTarGz(buf.Bytes())
	if err != nil {
		t.Fatalf("extractTarGz failed: %v", err)
	}
	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != string(want) {
		t.Fatalf("got %q, want %q (should skip unrelated README.txt and pick the named executable)", got, want)
	}
}

func TestExtractZipReturnsTheExeEntry(t *testing.T) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)

	want := []byte("fake-windows-executable-bytes")
	fw, err := zw.Create("SlotBoardCraft-v0.2.0-Windows.exe")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write(want); err != nil {
		t.Fatal(err)
	}
	zw.Close()

	r, err := extractZip(buf.Bytes())
	if err != nil {
		t.Fatalf("extractZip failed: %v", err)
	}
	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != string(want) {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestExtractZipReturnsErrorWhenNoExeEntry(t *testing.T) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)
	fw, _ := zw.Create("readme.txt")
	fw.Write([]byte("hi"))
	zw.Close()

	if _, err := extractZip(buf.Bytes()); err == nil {
		t.Fatal("expected error when zip has no .exe entry")
	}
}

func TestCheckUpdateReportsNoUpdateWhenVersionsMatch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(githubRelease{TagName: "v0.1.0", HTMLURL: "https://example.com/release"})
	}))
	defer srv.Close()

	a := NewApp("0.1.0")
	a.githubAPIBase = srv.URL

	info := a.CheckUpdate()
	if info.HasUpdate {
		t.Fatal("HasUpdate = true, want false")
	}
	if info.CurrentVersion != "0.1.0" {
		t.Fatalf("CurrentVersion = %q, want 0.1.0", info.CurrentVersion)
	}
}

func TestCheckUpdateReportsUpdateAndPicksDarwinAssetWhenVersionsDiffer(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(githubRelease{
			TagName: "v0.2.0",
			HTMLURL: "https://example.com/release",
			Assets: []releaseAsset{
				{Name: "SlotBoardCraft-v0.2.0-macOS.tar.gz", BrowserDownloadURL: "https://example.com/targz"},
				{Name: "SlotBoardCraft-v0.2.0-Windows.zip", BrowserDownloadURL: "https://example.com/zip"},
			},
		})
	}))
	defer srv.Close()

	a := NewApp("0.1.0")
	a.githubAPIBase = srv.URL

	info := a.CheckUpdate()
	if !info.HasUpdate {
		t.Fatal("HasUpdate = false, want true")
	}
	if info.LatestVersion != "v0.2.0" {
		t.Fatalf("LatestVersion = %q, want v0.2.0", info.LatestVersion)
	}
	// This test runs on darwin, so the darwin asset should have been picked for updateURL.
	if a.updateURL != "https://example.com/targz" {
		t.Fatalf("updateURL = %q, want https://example.com/targz", a.updateURL)
	}
}
