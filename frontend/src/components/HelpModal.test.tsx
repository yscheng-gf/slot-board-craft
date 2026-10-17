// frontend/src/components/HelpModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HelpModal } from './HelpModal'
import { APP_VERSION } from '../version'

describe('HelpModal', () => {
  it('顯示操作說明與版號', () => {
    render(<HelpModal onClose={() => {}} onCheckUpdate={() => {}} />)
    expect(screen.getByText(/Layout/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(APP_VERSION))).toBeInTheDocument()
  })

  it('點右上角 X 觸發 onClose', () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} onCheckUpdate={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /關閉|close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('點背景遮罩觸發 onClose', () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} onCheckUpdate={() => {}} />)
    fireEvent.click(screen.getByTestId('help-modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('按下 Esc 觸發 onClose', () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} onCheckUpdate={() => {}} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('點「檢查更新」觸發 onCheckUpdate', () => {
    const onCheckUpdate = vi.fn()
    render(<HelpModal onClose={() => {}} onCheckUpdate={onCheckUpdate} />)
    fireEvent.click(screen.getByRole('button', { name: '檢查更新' }))
    expect(onCheckUpdate).toHaveBeenCalledTimes(1)
  })
})
