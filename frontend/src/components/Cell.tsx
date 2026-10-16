import { getBorderTier } from '../constants/borderTypes'

export const CELL_W = 56
export const CELL_H = 44
export const GAP = 4

function idToColor(id: number): string {
  if (id === 0) return '#374151'
  const hue = (id * 137.508) % 360
  return `hsl(${hue.toFixed(1)}, 55%, 28%)`
}

function idToColorHover(id: number): string {
  if (id === 0) return '#4b5563'
  const hue = (id * 137.508) % 360
  return `hsl(${hue.toFixed(1)}, 55%, 44%)`
}

type Props = {
  id: number
  bt: number
  w: number
  l: number
  s: number
  iconUrl?: string
  pixelArt?: boolean
  reelIndex: number
  rowIndex: number
  topOffset: number
  isHighlighted: boolean
  isHovered: boolean
  isSelected: boolean
  onMouseDown: (reel: number, row: number) => void
  onMouseEnter: (reel: number, row: number) => void
  onMouseUp: () => void
}

export function Cell({
  id, bt, w, l, s, iconUrl, pixelArt,
  reelIndex, rowIndex, topOffset,
  isHighlighted, isHovered, isSelected,
  onMouseDown, onMouseEnter, onMouseUp,
}: Props) {
  const left = reelIndex * (CELL_W + GAP)
  const top = topOffset + rowIndex * (CELL_H + GAP)
  const width = w * CELL_W + (w - 1) * GAP
  const height = l * CELL_H + (l - 1) * GAP

  const bg = isHighlighted ? '#2563eb' : isHovered ? idToColorHover(id) : idToColor(id)
  const tier = getBorderTier(bt)
  const borderColor = tier.color
  const shadows = [isSelected ? '0 0 0 2px #ec4899' : null, tier.glow].filter(Boolean)
  const ring = shadows.length > 0 ? shadows.join(', ') : 'none'

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
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={`symbol ${id}`}
          draggable={false}
          style={{
            width: 32,
            height: 32,
            imageRendering: pixelArt ? 'pixelated' : undefined,
          }}
        />
      ) : (
        <span className="text-sm font-mono text-gray-100">{id}</span>
      )}
      {iconUrl && (
        <span className="absolute bottom-0.5 left-1 text-[9px] text-gray-400">
          {id}
        </span>
      )}
      {(w > 1 || l > 1) && (
        <span className="absolute top-0.5 right-1 text-[9px] text-gray-400">
          {w}×{l}
        </span>
      )}
      {s !== 0 && (
        <span className="absolute bottom-0.5 right-1 text-[9px] text-gray-400">
          s:{s}
        </span>
      )}
    </div>
  )
}
