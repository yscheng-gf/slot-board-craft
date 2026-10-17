// frontend/src/components/UpdateToast.tsx
import type { UpdatePhase } from '../types'

type Props = {
  phase: UpdatePhase
  latestVersion: string
  errorMessage?: string
  onUpdateClick: () => void
  onManualDownloadClick: () => void
  onDismiss: () => void
}

export function UpdateToast({ phase, latestVersion, errorMessage, onUpdateClick, onManualDownloadClick, onDismiss }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[90vw] bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 text-sm text-gray-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {phase === 'available' && <p>🎉 有新版本 {latestVersion} 可供更新！</p>}
          {phase === 'updating' && <p>正在更新中，請稍候…</p>}
          {phase === 'success' && <p>✅ 更新成功！即將重新啟動應用程式...</p>}
          {phase === 'error' && <p>❌ {errorMessage}</p>}
          {phase === 'up-to-date' && <p>✅ 您目前已是最新版本！</p>}
          {phase === 'check-failed' && <p>⚠️ 無法檢查更新，請確認網路連線。</p>}
        </div>
        {phase !== 'updating' && phase !== 'success' && (
          <button
            onClick={onDismiss}
            aria-label="關閉"
            className="text-gray-400 hover:text-gray-100 text-lg leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {phase === 'available' && (
        <button
          onClick={onUpdateClick}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1.5"
        >
          立即更新
        </button>
      )}
      {phase === 'updating' && (
        <button disabled className="mt-3 w-full bg-blue-600/50 text-white/70 rounded px-3 py-1.5 cursor-not-allowed">
          正在更新中...
        </button>
      )}
      {phase === 'error' && (
        <button
          onClick={onManualDownloadClick}
          className="mt-3 w-full bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1.5"
        >
          手動下載
        </button>
      )}
    </div>
  )
}
