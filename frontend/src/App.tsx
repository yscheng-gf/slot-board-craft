// frontend/src/App.tsx
import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useGrid } from './hooks/useGrid'
import { useDrag } from './hooks/useDrag'
import { generateJson } from './utils/generateJson'
import { Grid } from './components/Grid'
import { Toolbar } from './components/Toolbar'
import { RightPanel } from './components/RightPanel'
import { GetConfig, SaveConfig, CheckUpdate, PerformUpdate, Restart, OpenURL } from '../wailsjs/go/main/App'
import type { CursorInfo, Config, UpdateInfo, UpdatePhase } from './types'
import { DEFAULT_THEME, THEMES, getThemeById } from './themes/themes'
import { snapScaleForPixelArt } from './utils/scale'
import { UpdateToast } from './components/UpdateToast'

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
  const [selectedS, setSelectedS] = useState(0)
  const [themeId, setThemeId] = useState(DEFAULT_THEME.id)
  const theme = getThemeById(themeId)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([0, 1, 2, 3, 11, 91, 92])
  const [cursorInfo, setCursorInfo] = useState<CursorInfo>(null)
  const [hoveredCell, setHoveredCell] = useState<{ reelIndex: number; rowIndex: number } | null>(null)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [updatePhase, setUpdatePhase] = useState<UpdatePhase | null>(null)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [updateError, setUpdateError] = useState('')

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
      const rawScale = Math.min(availW / natW, availH / natH)
      setScale(theme.pixelArt ? snapScaleForPixelArt(rawScale) : rawScale)
    }
    const ro = new ResizeObserver(update)
    ro.observe(panel)
    update()
    return () => ro.disconnect()
  }, [layout, theme.pixelArt])

  // 載入設定
  useEffect(() => {
    GetConfig().then((cfg: Config) => {
      if (cfg.favoriteIds?.length) setFavoriteIds(cfg.favoriteIds)
      if (cfg.lastLayout) {
        setLayoutInput(cfg.lastLayout)
        rebuildGrid(parseLayout(cfg.lastLayout))
      }
      if (cfg.themeId) setThemeId(cfg.themeId)
    }).catch(() => {}).finally(() => {
      setConfigLoaded(true)
    })
  }, [])

  // 儲存設定（favoriteIds、layoutInput 或 themeId 改變時，載入完成後才執行）
  useEffect(() => {
    if (!configLoaded) return
    SaveConfig({ favoriteIds, lastLayout: layoutInput, themeId }).catch(() => {})
  }, [favoriteIds, layoutInput, themeId, configLoaded])

  // 檢查更新；manual=true 時（使用者手動點擊）即使沒有更新或檢查失敗也要顯示提示
  const performUpdateCheck = useCallback((manual: boolean) => {
    CheckUpdate().then((info: UpdateInfo) => {
      if (info.hasUpdate) {
        setUpdateInfo(info)
        setUpdatePhase('available')
      } else if (manual) {
        setUpdatePhase('up-to-date')
      }
    }).catch(() => {
      if (manual) setUpdatePhase('check-failed')
    })
  }, [])

  // 開啟 App 後延遲檢查一次更新（避免一開啟就蓋住畫面），之後每小時自動檢查一次
  useEffect(() => {
    const ONE_HOUR_MS = 60 * 60 * 1000
    const startupTimer = setTimeout(() => performUpdateCheck(false), 2000)
    const hourlyTimer = setInterval(() => performUpdateCheck(false), ONE_HOUR_MS)
    return () => {
      clearTimeout(startupTimer)
      clearInterval(hourlyTimer)
    }
  }, [performUpdateCheck])

  const handleUpdateClick = useCallback(() => {
    setUpdatePhase('updating')
    PerformUpdate().then((res: string) => {
      if (res === 'ok') {
        setUpdatePhase('success')
        setTimeout(() => Restart(), 2000)
      } else {
        setUpdateError(res)
        setUpdatePhase('error')
      }
    }).catch((err: unknown) => {
      setUpdateError(String(err))
      setUpdatePhase('error')
    })
  }, [])

  const handleManualDownload = useCallback(() => {
    if (updateInfo?.releaseUrl) OpenURL(updateInfo.releaseUrl)
    setUpdatePhase(null)
  }, [updateInfo])

  const handleDismissUpdate = useCallback(() => {
    setUpdatePhase(null)
  }, [])

  // 「已是最新版本」「檢查失敗」是一次性提示，幾秒後自動消失
  useEffect(() => {
    if (updatePhase !== 'up-to-date' && updatePhase !== 'check-failed') return
    const timer = setTimeout(() => setUpdatePhase(null), 3000)
    return () => clearTimeout(timer)
  }, [updatePhase])

  const handleLayoutChange = useCallback((raw: string) => {
    const nums = parseLayout(raw)
    if (nums.length === 0) return
    setLayoutInput(raw)
    rebuildGrid(nums)
  }, [rebuildGrid])

  const handleMouseDown = useCallback((reel: number, row: number) => {
    startDrag(reel, row)
  }, [startDrag])

  const handleMouseEnter = useCallback((reel: number, row: number) => {
    if (isDragging) updateDrag(reel, row)
    const cell = grid[reel]?.[row] ?? { id: 0, bt: 0, w: 1, l: 1, s: 0 }
    setCursorInfo({ reelIndex: reel, rowIndex: row, cell })
    setHoveredCell({ reelIndex: reel, rowIndex: row })
  }, [isDragging, updateDrag, grid])

  const handleMouseUp = useCallback(() => {
    const result = endDrag()
    if (!result) return
    placeSymbol(result.reelStart, result.rowStart, result.w, result.l, selectedId, selectedBt, selectedS)
    const placedCell = { id: selectedId, bt: selectedBt, w: result.w, l: result.l, s: selectedS }
    setCursorInfo({ reelIndex: result.reelStart, rowIndex: result.rowStart, cell: placedCell })
  }, [endDrag, placeSymbol, selectedId, selectedBt, selectedS])

  const handleAddFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => [...prev, id].sort((a, b) => a - b))
  }, [])

  const handleRemoveFavorite = useCallback((id: number) => {
    setFavoriteIds((prev) => prev.filter((f) => f !== id))
  }, [])

  const handleRandomize = useCallback(() => {
    randomizeBoard(favoriteIds)
    setCursorInfo(null)
  }, [randomizeBoard, favoriteIds])

  const handleHoverLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <Toolbar
        layoutInput={layoutInput}
        selectedId={selectedId}
        selectedBt={selectedBt}
        selectedS={selectedS}
        favoriteIds={favoriteIds}
        themes={THEMES}
        themeId={themeId}
        onLayoutChange={handleLayoutChange}
        onSelectId={setSelectedId}
        onBtChange={setSelectedBt}
        onSChange={setSelectedS}
        onThemeChange={setThemeId}
        onAddFavorite={handleAddFavorite}
        onRemoveFavorite={handleRemoveFavorite}
        onRandomize={handleRandomize}
        onCheckUpdate={() => performUpdateCheck(true)}
      />
      <div className="flex flex-1 min-h-0">
        {/* 左側盤面 */}
        <div ref={panelRef} className="flex-1 overflow-hidden p-6 flex items-center justify-center">
          <div ref={gridRef} style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
            <Grid
              grid={grid}
              layout={layout}
              theme={theme}
              isHighlighted={isHighlighted}
              selectedCell={cursorInfo}
              hoveredCell={hoveredCell}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
              onHoverLeave={handleHoverLeave}
            />
          </div>
        </div>
        {/* 右側面板 */}
        <div className="w-72 flex-shrink-0">
          <RightPanel cursorInfo={cursorInfo} json={json} />
        </div>
      </div>

      {updatePhase && (
        <UpdateToast
          phase={updatePhase}
          latestVersion={updateInfo?.latestVersion ?? ''}
          errorMessage={updateError}
          onUpdateClick={handleUpdateClick}
          onManualDownloadClick={handleManualDownload}
          onDismiss={handleDismissUpdate}
        />
      )}
    </div>
  )
}
