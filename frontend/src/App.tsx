// frontend/src/App.tsx
import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useGrid } from './hooks/useGrid'
import { useDrag } from './hooks/useDrag'
import { generateJson } from './utils/generateJson'
import { Grid } from './components/Grid'
import { Toolbar } from './components/Toolbar'
import { RightPanel } from './components/RightPanel'
import { GetConfig, SaveConfig } from '../wailsjs/go/main/App'
import type { CursorInfo, Config } from './types'

const DEFAULT_LAYOUT_STR = '3,4,5,5,4,3'

function parseLayout(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0)
}

export default function App() {
  const [layoutInput, setLayoutInput] = useState(DEFAULT_LAYOUT_STR)
  const [selectedId, setSelectedId] = useState(0)
  const [selectedBt, setSelectedBt] = useState(0)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([0, 1, 2, 3, 11, 91, 92])
  const [cursorInfo, setCursorInfo] = useState<CursorInfo>(null)

  const { layout, grid, rebuildGrid, placeSymbol, randomizeBoard } = useGrid(parseLayout(DEFAULT_LAYOUT_STR))
  const { isDragging, startDrag, updateDrag, endDrag, isHighlighted } = useDrag()

  const json = generateJson(grid)

  // Auto-scale: 讓盤面填滿左側面板
  const panelRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const panel = panelRef.current
    const gridEl = gridRef.current
    if (!panel || !gridEl) return
    const update = () => {
      const padding = 48 // p-6 = 24px × 2
      const availW = panel.clientWidth - padding
      const availH = panel.clientHeight - padding
      const natW = gridEl.offsetWidth
      const natH = gridEl.offsetHeight
      if (natW === 0 || natH === 0) return
      setScale(Math.min(availW / natW, availH / natH))
    }
    const ro = new ResizeObserver(update)
    ro.observe(panel)
    update()
    return () => ro.disconnect()
  }, [layout])

  // 載入設定
  useEffect(() => {
    GetConfig().then((cfg: Config) => {
      if (cfg.favoriteIds?.length) setFavoriteIds(cfg.favoriteIds)
      if (cfg.lastLayout) {
        setLayoutInput(cfg.lastLayout)
        rebuildGrid(parseLayout(cfg.lastLayout))
      }
    }).catch(() => {})
  }, [])

  // 儲存設定（favoriteIds 或 layoutInput 改變時）
  useEffect(() => {
    SaveConfig({ favoriteIds, lastLayout: layoutInput }).catch(() => {})
  }, [favoriteIds, layoutInput])

  const handleLayoutChange = useCallback((raw: string) => {
    const nums = parseLayout(raw)
    if (nums.length === 0) return
    setLayoutInput(raw)
    rebuildGrid(nums)
  }, [rebuildGrid])

  const handleMouseDown = useCallback((reel: number, row: number) => {
    startDrag(reel, row)
    setCursorInfo({ reelIndex: reel, rowIndex: row, cell: grid[reel]?.[row] ?? { id: 92, bt: 0, w: 1, l: 1 } })
  }, [startDrag, grid])

  const handleMouseEnter = useCallback((reel: number, row: number) => {
    if (isDragging) updateDrag(reel, row)
  }, [isDragging, updateDrag])

  const handleMouseUp = useCallback(() => {
    const result = endDrag()
    if (!result) return
    placeSymbol(result.reelStart, result.rowStart, result.w, result.l, selectedId, selectedBt)
    const placedCell = { id: selectedId, bt: selectedBt, w: result.w, l: result.l }
    setCursorInfo({ reelIndex: result.reelStart, rowIndex: result.rowStart, cell: placedCell })
  }, [endDrag, placeSymbol, selectedId, selectedBt])

  const handleAddFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => [...prev, id].sort((a, b) => a - b))
  }, [])

  const handleRemoveFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => prev.filter((f) => f !== id))
  }, [])

  const handleRandomize = useCallback(() => {
    randomizeBoard(favoriteIds)
  }, [randomizeBoard, favoriteIds])

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <Toolbar
        layoutInput={layoutInput}
        selectedId={selectedId}
        selectedBt={selectedBt}
        favoriteIds={favoriteIds}
        onLayoutChange={handleLayoutChange}
        onSelectId={setSelectedId}
        onBtChange={setSelectedBt}
        onAddFavorite={handleAddFavorite}
        onRemoveFavorite={handleRemoveFavorite}
        onRandomize={handleRandomize}
      />
      <div className="flex flex-1 min-h-0">
        {/* 左側盤面 */}
        <div ref={panelRef} className="flex-1 overflow-hidden p-6 flex items-center justify-center">
          <div ref={gridRef} style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
            <Grid
              grid={grid}
              layout={layout}
              isHighlighted={isHighlighted}
              selectedCell={cursorInfo}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
            />
          </div>
        </div>
        {/* 右側面板 */}
        <div className="w-72 flex-shrink-0">
          <RightPanel cursorInfo={cursorInfo} json={json} />
        </div>
      </div>
    </div>
  )
}
