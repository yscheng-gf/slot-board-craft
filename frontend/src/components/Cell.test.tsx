// frontend/src/components/Cell.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Cell } from './Cell'

function noop() {}

const baseProps = {
  id: 92,
  bt: 0,
  w: 1,
  l: 1,
  s: 0,
  reelIndex: 0,
  rowIndex: 0,
  topOffset: 0,
  isHighlighted: false,
  isHovered: false,
  isSelected: false,
  onMouseDown: noop,
  onMouseEnter: noop,
  onMouseUp: noop,
}

describe('Cell 圖示主題', () => {
  it('沒有 iconUrl 時，維持原本的色塊 + 數字 id 顯示', () => {
    render(<Cell {...baseProps} />)
    expect(screen.getByText('92')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('有 iconUrl 時，改顯示圖片，數字 id 移到左下角小字標示（圖案本身看不出 id，需要輔助辨識）', () => {
    render(<Cell {...baseProps} iconUrl="/icons/high-1.png" />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('/icons/high-1.png')
    expect(screen.getByText('92')).toBeInTheDocument()
  })

  it('沒有 iconUrl（色塊模式）時，id 只在中央顯示一次，不會在左下角重複', () => {
    render(<Cell {...baseProps} />)
    expect(screen.getAllByText('92')).toHaveLength(1)
  })

  it('pixelArt 主題的圖示套用 image-rendering: pixelated 保持銳利邊緣', () => {
    render(<Cell {...baseProps} iconUrl="/icons/high-1.png" pixelArt />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.style.imageRendering).toBe('pixelated')
  })
})

describe('Cell 狀態（s）標籤', () => {
  it('s=0 時不顯示狀態標籤', () => {
    render(<Cell {...baseProps} s={0} />)
    expect(screen.queryByText(/^s:/)).not.toBeInTheDocument()
  })

  it('s!=0 時在右下角顯示 s:{value}', () => {
    render(<Cell {...baseProps} s={5} />)
    expect(screen.getByText('s:5')).toBeInTheDocument()
  })

  it('s 跟 w×l 標籤可以同時顯示，互不覆蓋', () => {
    render(<Cell {...baseProps} w={2} l={2} s={3} />)
    expect(screen.getByText('2×2')).toBeInTheDocument()
    expect(screen.getByText('s:3')).toBeInTheDocument()
  })
})
