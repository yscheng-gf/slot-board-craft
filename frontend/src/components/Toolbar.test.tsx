// frontend/src/components/Toolbar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toolbar } from './Toolbar'

function noop() {}

describe('Toolbar layout 輸入框', () => {
  it('layoutInput prop 非同步更新後，輸入框文字要跟著同步（模擬設定檔載入完成）', () => {
    const { rerender } = render(
      <Toolbar
        layoutInput="3,4,5,5,4,3"
        selectedId={92}
        selectedBt={0}
        favoriteIds={[]}
        onLayoutChange={noop}
        onSelectId={noop}
        onBtChange={noop}
        onAddFavorite={noop}
        onRemoveFavorite={noop}
        onRandomize={noop}
      />
    )

    // 模擬 GetConfig() 非同步 resolve 後，App 用設定檔的 lastLayout 更新了 layoutInput
    rerender(
      <Toolbar
        layoutInput="2,3,3,2"
        selectedId={92}
        selectedBt={0}
        favoriteIds={[]}
        onLayoutChange={noop}
        onSelectId={noop}
        onBtChange={noop}
        onAddFavorite={noop}
        onRemoveFavorite={noop}
        onRandomize={noop}
      />
    )

    const input = screen.getByPlaceholderText('3,4,5,5,4,3') as HTMLInputElement
    expect(input.value).toBe('2,3,3,2')
  })
})
