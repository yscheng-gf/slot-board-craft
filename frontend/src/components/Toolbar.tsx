import { useState, useRef } from 'react'

type Props = {
  layoutInput: string
  selectedId: number
  selectedBt: number
  favoriteIds: number[]
  onLayoutChange: (raw: string) => void
  onSelectId: (id: number) => void
  onBtChange: (bt: number) => void
  onAddFavorite: (id: number) => void
  onRemoveFavorite: (id: number) => void
  onRandomize: () => void
}

export function Toolbar({
  layoutInput,
  selectedId,
  selectedBt,
  favoriteIds,
  onLayoutChange,
  onSelectId,
  onBtChange,
  onAddFavorite,
  onRemoveFavorite,
  onRandomize,
}: Props) {
  const [idInput, setIdInput] = useState('')
  const [addInput, setAddInput] = useState('')
  const idInputRef = useRef<HTMLInputElement>(null)

  function handleLayoutKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onLayoutChange((e.target as HTMLInputElement).value)
    }
  }

  function handleIdKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = parseInt(idInput, 10)
      if (!isNaN(val)) onSelectId(val)
      setIdInput('')
    }
  }

  function handleAddKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = parseInt(addInput, 10)
      if (!isNaN(val) && !favoriteIds.includes(val)) onAddFavorite(val)
      setAddInput('')
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-700 flex-wrap">
      {/* Layout 輸入 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Layout:</span>
        <input
          defaultValue={layoutInput}
          onKeyDown={handleLayoutKey}
          className="bg-gray-800 text-gray-100 text-sm px-2 py-1 rounded border border-gray-600 w-36 font-mono"
          placeholder="3,4,5,5,4,3"
        />
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* 常用 ID chip */}
      <div className="flex items-center gap-1 flex-wrap">
        {favoriteIds.map((fid) => (
          <button
            key={fid}
            onClick={() => onSelectId(fid)}
            onContextMenu={(e) => { e.preventDefault(); onRemoveFavorite(fid) }}
            className={`px-2 py-0.5 rounded text-xs font-mono border transition-colors ${
              selectedId === fid
                ? 'bg-pink-600 border-pink-400 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
            title="右鍵刪除"
          >
            {fid}
          </button>
        ))}

        {/* 新增 chip */}
        <input
          value={addInput}
          onChange={(e) => setAddInput(e.target.value)}
          onKeyDown={handleAddKey}
          className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded border border-dashed border-gray-600 w-12 font-mono text-center"
          placeholder="+"
          title="輸入 ID 後按 Enter 新增"
        />
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* 自由輸入 ID */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">ID:</span>
        <input
          ref={idInputRef}
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          onKeyDown={handleIdKey}
          className="bg-gray-800 text-gray-100 text-sm px-2 py-1 rounded border border-gray-600 w-16 font-mono text-center"
          placeholder={String(selectedId)}
        />
      </div>

      {/* BT */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">BT:</span>
        <input
          type="number"
          min={0}
          max={2}
          value={selectedBt}
          onChange={(e) => onBtChange(Number(e.target.value))}
          className="bg-gray-800 text-gray-100 text-sm px-2 py-1 rounded border border-gray-600 w-12 font-mono text-center"
        />
      </div>

      {/* 隨機 */}
      <button
        onClick={onRandomize}
        disabled={favoriteIds.length === 0}
        className="px-3 py-1 rounded border text-xs font-mono bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        RNG
      </button>
    </div>
  )
}
