// frontend/src/components/HelpModal.tsx
import { useEffect } from 'react'
import { APP_VERSION } from '../version'

type Props = {
  onClose: () => void
}

export function HelpModal({ onClose }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      data-testid="help-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700 rounded-lg w-[28rem] max-w-[90vw] max-h-[80vh] overflow-auto p-5 text-sm text-gray-200"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-100">操作說明</h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="text-gray-400 hover:text-gray-100 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <ul className="space-y-2 list-disc list-inside">
          <li><b>Layout</b>：用逗號分隔的數字（如 <code>3,4,5,5,4,3</code>），代表每個 reel 的格數，按 Enter 套用。</li>
          <li><b>常用 ID</b>：點選 chip 快速選取符號 ID；右鍵點 chip 可刪除；在旁邊的 + 輸入框輸入 ID 後按 Enter 新增。</li>
          <li><b>ID 欄位</b>：直接輸入任意符號 ID 後按 Enter 選取。</li>
          <li><b>BT（邊框樣式）</b>：輸入任意數字（無上限）套用顏色／發光邊框，純粹用來視覺區分，無稀有度意義。</li>
          <li><b>S（狀態）</b>：輸入任意數字，標記在格子右下角（<code>s:數字</code>），預設 0 時不顯示。</li>
          <li><b>拖曳放置符號</b>：在盤面上按住拖曳可選取一塊範圍（w×l），放開滑鼠後套用目前選中的 ID / BT / S。</li>
          <li><b>主題</b>：切換符號的圖示風格；目前內建「像素風」「經典老虎機」「七龍珠風」三個示範主題（ID 1~9 高倍符號、11~20 低倍符號、91=wild、92=scatter 固定對照）。80~199 內其他特殊符號 ID，依盤面上第一次出現的位置（reel 由左到右、row 由上到下）依序分配 bonus/free spins/jackpot/coin/respin/super wild/multiplier 共 7 張圖示，用完後退回通用的「？」圖示。圖示模式下左下角會標出數字 id 方便辨識；完全沒有涵蓋到的 ID 才會退回色塊顯示。</li>
          <li><b>RNG</b>：用目前的常用 ID 清單隨機產生整個盤面。</li>
          <li><b>JSON 輸出</b>：右側面板即時顯示盤面 JSON，可一鍵複製到剪貼簿。</li>
        </ul>

        <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500 font-mono">
          {APP_VERSION}
        </div>
      </div>
    </div>
  )
}
