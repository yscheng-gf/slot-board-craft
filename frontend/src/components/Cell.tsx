export const CELL_W = 56
export const CELL_H = 44
export const GAP = 4

const BT_BORDER: Record<number, string> = {
  0: '#4b5563', // 灰
  1: '#9ca3af', // 銀
  2: '#f59e0b', // 金
}

type Props = {
  id: number
  bt: number
  w: number
  l: number
  reelIndex: number
  rowIndex: number
  isHighlighted: boolean
  isSelected: boolean
  onMouseDown: (reel: number, row: number) => void
  onMouseEnter: (reel: number, row: number) => void
  onMouseUp: () => void
}

export function Cell({
  id, bt, w, l,
  reelIndex, rowIndex,
  isHighlighted, isSelected,
  onMouseDown, onMouseEnter, onMouseUp,
}: Props) {
  const left = reelIndex * (CELL_W + GAP)
  const top = rowIndex * (CELL_H + GAP)
  const width = w * CELL_W + (w - 1) * GAP
  const height = l * CELL_H + (l - 1) * GAP

  const bg = isHighlighted ? '#2563eb' : '#1f2937'
  const borderColor = BT_BORDER[bt] ?? BT_BORDER[0]
  const ring = isSelected ? '0 0 0 2px #ec4899' : 'none'

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        background: bg,
        borderColor,
        boxShadow: ring,
        zIndex: w > 1 || l > 1 ? 10 : 5,
      }}
      className="border-2 rounded flex items-center justify-center cursor-pointer select-none relative"
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(reelIndex, rowIndex) }}
      onMouseEnter={() => onMouseEnter(reelIndex, rowIndex)}
      onMouseUp={onMouseUp}
    >
      <span className="text-sm font-mono text-gray-100">{id}</span>
      {(w > 1 || l > 1) && (
        <span className="absolute top-0.5 right-1 text-[9px] text-gray-400">
          {w}×{l}
        </span>
      )}
    </div>
  )
}
