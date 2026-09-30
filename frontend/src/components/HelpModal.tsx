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
          <li><b>BT（邊框樣式）</b>：下拉選單選擇 10 種顏色／發光邊框，純粹用來視覺區分，無稀有度意義。</li>
          <li><b>拖曳放置符號</b>：在盤面上按住拖曳可選取一塊範圍（w×l），放開滑鼠後套用目前選中的 ID / BT。</li>
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
