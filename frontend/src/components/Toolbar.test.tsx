// frontend/src/components/Toolbar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toolbar } from './Toolbar'
import { DEFAULT_THEME } from '../themes/themes'

function noop() {}

const baseProps = {
  layoutInput: '3,4,5,5,4,3',
  selectedId: 92,
  selectedBt: 0,
  selectedS: 0,
  favoriteIds: [],
  themes: [DEFAULT_THEME],
  themeId: DEFAULT_THEME.id,
  onLayoutChange: noop,
  onSelectId: noop,
  onBtChange: noop,
  onSChange: noop,
  onThemeChange: noop,
  onAddFavorite: noop,
  onRemoveFavorite: noop,
  onRandomize: noop,
  onCheckUpdate: noop,
}

describe('Toolbar Help 按鈕', () => {
  it('點擊 ? 按鈕開啟操作說明彈窗，再點 X 可關閉', () => {
    render(<Toolbar {...baseProps} />)
    expect(screen.queryByText('操作說明')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '說明' }))
    expect(screen.getByText('操作說明')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(screen.queryByText('操作說明')).not.toBeInTheDocument()
  })

  it('說明彈窗內的「檢查更新」會呼叫 Toolbar 的 onCheckUpdate', () => {
    let called = 0
    render(<Toolbar {...baseProps} onCheckUpdate={() => { called++ }} />)
    fireEvent.click(screen.getByRole('button', { name: '說明' }))
    fireEvent.click(screen.getByRole('button', { name: '檢查更新' }))
    expect(called).toBe(1)
  })
})

describe('Toolbar layout 輸入框', () => {
  it('layoutInput prop 非同步更新後，輸入框文字要跟著同步（模擬設定檔載入完成）', () => {
    const { rerender } = render(<Toolbar {...baseProps} layoutInput="3,4,5,5,4,3" />)

    // 模擬 GetConfig() 非同步 resolve 後，App 用設定檔的 lastLayout 更新了 layoutInput
    rerender(<Toolbar {...baseProps} layoutInput="2,3,3,2" />)

    const input = screen.getByPlaceholderText('3,4,5,5,4,3') as HTMLInputElement
    expect(input.value).toBe('2,3,3,2')
  })
})
