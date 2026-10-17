// frontend/src/components/UpdateToast.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UpdateToast } from './UpdateToast'

describe('UpdateToast', () => {
  it('phase 為 available 時顯示最新版號與「立即更新」按鈕，點擊觸發 onUpdateClick', () => {
    const onUpdateClick = vi.fn()
    render(
      <UpdateToast
        phase="available"
        latestVersion="v0.2.0"
        onUpdateClick={onUpdateClick}
        onManualDownloadClick={() => {}}
        onDismiss={() => {}}
      />
    )
    expect(screen.getByText(/v0\.2\.0/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '立即更新' }))
    expect(onUpdateClick).toHaveBeenCalledTimes(1)
  })

  it('phase 為 updating 時按鈕顯示更新中且停用，不能再次觸發 onUpdateClick', () => {
    const onUpdateClick = vi.fn()
    render(
      <UpdateToast
        phase="updating"
        latestVersion="v0.2.0"
        onUpdateClick={onUpdateClick}
        onManualDownloadClick={() => {}}
        onDismiss={() => {}}
      />
    )
    const button = screen.getByRole('button', { name: /更新中/ })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onUpdateClick).not.toHaveBeenCalled()
  })

  it('phase 為 success 時顯示成功訊息，不顯示關閉按鈕', () => {
    render(
      <UpdateToast
        phase="success"
        latestVersion="v0.2.0"
        onUpdateClick={() => {}}
        onManualDownloadClick={() => {}}
        onDismiss={() => {}}
      />
    )
    expect(screen.getByText(/成功/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '關閉' })).not.toBeInTheDocument()
  })

  it('phase 為 error 時顯示錯誤訊息與「手動下載」按鈕，點擊觸發 onManualDownloadClick', () => {
    const onManualDownloadClick = vi.fn()
    render(
      <UpdateToast
        phase="error"
        latestVersion="v0.2.0"
        errorMessage="下載更新失敗: network error"
        onUpdateClick={() => {}}
        onManualDownloadClick={onManualDownloadClick}
        onDismiss={() => {}}
      />
    )
    expect(screen.getByText(/下載更新失敗/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '手動下載' }))
    expect(onManualDownloadClick).toHaveBeenCalledTimes(1)
  })

  it('phase 為 up-to-date 時顯示已是最新版本訊息', () => {
    render(
      <UpdateToast
        phase="up-to-date"
        latestVersion="v0.1.0"
        onUpdateClick={() => {}}
        onManualDownloadClick={() => {}}
        onDismiss={() => {}}
      />
    )
    expect(screen.getByText(/已是最新版本/)).toBeInTheDocument()
  })

  it('phase 為 check-failed 時顯示檢查更新失敗訊息', () => {
    render(
      <UpdateToast
        phase="check-failed"
        latestVersion=""
        onUpdateClick={() => {}}
        onManualDownloadClick={() => {}}
        onDismiss={() => {}}
      />
    )
    expect(screen.getByText(/無法檢查更新/)).toBeInTheDocument()
  })

  it('非 updating 狀態下點關閉按鈕觸發 onDismiss', () => {
    const onDismiss = vi.fn()
    render(
      <UpdateToast
        phase="available"
        latestVersion="v0.2.0"
        onUpdateClick={() => {}}
        onManualDownloadClick={() => {}}
        onDismiss={onDismiss}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
