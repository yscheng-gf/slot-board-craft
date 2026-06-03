// frontend/src/components/RightPanel.tsx
import { useState } from 'react'
import type { CursorInfo } from '../types'
import { CopyToClipboard } from '../../wailsjs/go/main/App'

type Props = {
  cursorInfo: CursorInfo
  json: string
}

export function RightPanel({ cursorInfo, json }: Props) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'err'>('idle')

  async function handleCopy() {
    try {
      await CopyToClipboard(json)
      setCopyStatus('ok')
    } catch {
      setCopyStatus('err')
    }
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  const copyLabel =
    copyStatus === 'ok' ? '已複製！' : copyStatus === 'err' ? '複製失敗' : '複製到剪貼簿'
  const copyClass =
    copyStatus === 'ok'
      ? 'bg-green-700 border-green-500'
      : copyStatus === 'err'
      ? 'bg-red-700 border-red-500'
      : 'bg-gray-700 border-gray-500 hover:bg-gray-600'

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 p-3 gap-3">
      {/* 游標資訊 */}
      <div className="bg-gray-800 rounded p-3 text-sm">
        <div className="text-xs text-gray-400 mb-2">游標位置</div>
        {cursorInfo ? (
          <div className="space-y-1 font-mono text-gray-200">
            <div>Reel <span className="text-pink-400">{cursorInfo.reelIndex}</span>, Row <span className="text-pink-400">{cursorInfo.rowIndex}</span></div>
            <div>ID: <span className="text-yellow-300">{cursorInfo.cell.id}</span></div>
            <div>BT: <span className="text-yellow-300">{cursorInfo.cell.bt}</span></div>
            <div>W: <span className="text-yellow-300">{cursorInfo.cell.w}</span>  L: <span className="text-yellow-300">{cursorInfo.cell.l}</span></div>
          </div>
        ) : (
          <div className="text-gray-500 text-xs">點擊格子查看資訊</div>
        )}
      </div>

      {/* JSON 輸出 */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="text-xs text-gray-400 mb-1">JSON（即時）</div>
        <pre className="flex-1 bg-gray-800 rounded p-2 text-[10px] text-cyan-300 font-mono overflow-auto break-all whitespace-pre-wrap min-h-0">
          {JSON.stringify(JSON.parse(json), null, 2)}
        </pre>
      </div>

      {/* 複製按鈕 */}
      <button
        onClick={handleCopy}
        className={`w-full py-1.5 rounded border text-sm text-gray-100 transition-colors ${copyClass}`}
      >
        {copyLabel}
      </button>
    </div>
  )
}
